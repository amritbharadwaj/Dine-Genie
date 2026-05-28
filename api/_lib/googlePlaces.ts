import { matchOpenRiceEntry } from './openRiceMatch';

export interface GoogleReview {
  author: string;
  rating: number;
  text: string;
  relativeTime: string;
  photoUri?: string;
}

export interface PlaceInsights {
  placeId: string;
  name: string;
  address: string;
  googleRating: number;
  totalReviews: number;
  googleMapsUri?: string;
  priceLevel?: string;
  primaryType?: string;
  cuisineHint?: string;
  openRice?: {
    score: number;
    bestDish: string;
    cuisine: string;
    michelin?: string;
  };
  reviews: GoogleReview[];
  insights: {
    summary: string;
    aggregateSummary: string;
    bestPicks: string[];
    topPraised: string[];
    commonConcerns: string[];
    mentionedDishes: string[];
  };
}

export interface FetchPlaceReviewsInput {
  restaurantName: string;
  district?: string;
  searchQuery?: string;
}

interface PlacesApiReview {
  rating?: number;
  relativePublishTimeDescription?: string;
  text?: { text?: string };
  authorAttribution?: {
    displayName?: string;
    photoUri?: string;
  };
}

interface PlacesApiPlace {
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  priceLevel?: string;
  primaryType?: string;
  types?: string[];
  reviews?: PlacesApiReview[];
}

const EXCLUDED_TYPES = new Set([
  'lodging',
  'hotel',
  'motel',
  'resort_hotel',
  'extended_stay_hotel',
  'bed_and_breakfast',
  'guest_house',
  'hostel',
  'campground',
  'rv_park',
  'private_guest_room',
  'shopping_mall',
  'airport',
  'train_station',
  'transit_station',
  'travel_agency',
  'real_estate_agency',
  'corporate_office',
  'apartment_complex',
]);

const FOOD_TYPES = new Set([
  'restaurant',
  'cafe',
  'coffee_shop',
  'bakery',
  'bar',
  'bar_and_grill',
  'pub',
  'wine_bar',
  'cocktail_bar',
  'night_club',
  'brewery',
  'meal_takeaway',
  'meal_delivery',
  'food',
  'chinese_restaurant',
  'japanese_restaurant',
  'ramen_restaurant',
  'sushi_restaurant',
  'dim_sum_restaurant',
  'seafood_restaurant',
  'indian_restaurant',
  'thai_restaurant',
  'korean_restaurant',
  'vietnamese_restaurant',
  'fast_food_restaurant',
  'brunch_restaurant',
  'breakfast_restaurant',
  'hamburger_restaurant',
  'pizza_restaurant',
  'ice_cream_shop',
  'dessert_shop',
  'donut_shop',
  'tea_house',
  'steak_house',
  'vegetarian_restaurant',
  'vegan_restaurant',
  'sandwich_shop',
  'deli',
  'food_court',
  'cafeteria',
  'snack_bar',
]);

const GENERIC_PRAISE = new Set([
  'perfect',
  'amazing',
  'excellent',
  'good',
  'great',
  'delicious',
  'nice',
  'wonderful',
  'fantastic',
  'awesome',
  'incredible',
  'outstanding',
  'best',
]);

const DISH_PATTERNS = [
  /(?:try the|must order|ordered the|recommend the|loved the|get the)\s+([^.!?,]{3,45})/gi,
  /(?:the)\s+([a-z][a-z\s'-]{2,40})\s+(?:was|is)\s+(?:amazing|excellent|delicious|incredible|perfect|outstanding|so good)/gi,
];

const CONCERN_PATTERNS = [
  /(?:long wait|slow service|overpriced|too expensive|noisy|crowded|rude staff|disappointing)/gi,
  /(?:not worth|wouldn't return|average at best)/gi,
];

const THEME_RULES: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /(?:service|staff|waiter|server).{0,40}(?:friendly|attentive|excellent|great|warm)/i, label: 'Warm, attentive service' },
  { pattern: /(?:view|ambiance|atmosphere|vibe|decor).{0,40}(?:great|nice|lovely|cozy|beautiful)/i, label: 'Strong atmosphere & vibe' },
  { pattern: /(?:fresh|authentic| flavour|flavor|aromatic|fragrant)/i, label: 'Fresh, flavour-forward cooking' },
  { pattern: /(?:portion|serving).{0,30}(?:generous|large|huge)/i, label: 'Generous portions' },
  { pattern: /(?:value|affordable|worth.{0,15}price)/i, label: 'Good value for money' },
  { pattern: /(?:queue|wait).{0,30}(?:worth)/i, label: 'Worth the wait' },
];

const TYPE_LABELS: Record<string, string> = {
  restaurant: 'Restaurant',
  chinese_restaurant: 'Chinese',
  japanese_restaurant: 'Japanese',
  ramen_restaurant: 'Ramen',
  sushi_restaurant: 'Sushi',
  dim_sum_restaurant: 'Dim Sum',
  cafe: 'Café',
  coffee_shop: 'Coffee shop',
  bakery: 'Bakery',
  bar: 'Bar',
  bar_and_grill: 'Bar & grill',
  pub: 'Pub',
  wine_bar: 'Wine bar',
  cocktail_bar: 'Cocktail bar',
  night_club: 'Bar & nightlife',
  brewery: 'Brewery',
  indian_restaurant: 'Indian',
  thai_restaurant: 'Thai',
  korean_restaurant: 'Korean',
  vietnamese_restaurant: 'Vietnamese',
  seafood_restaurant: 'Seafood',
  fast_food_restaurant: 'Fast food',
  meal_takeaway: 'Takeaway',
  deli: 'Deli',
  food_court: 'Food court',
  cafeteria: 'Cafeteria',
};

function uniqueStrings(items: string[], limit = 5): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const item of items) {
    const normalized = item.trim().replace(/\s+/g, ' ');
    if (!normalized || normalized.length < 3) continue;
    const key = normalized.toLowerCase();
    if (seen.has(key) || GENERIC_PRAISE.has(key)) continue;
    seen.add(key);
    result.push(normalized);
    if (result.length >= limit) break;
  }

  return result;
}

function extractMatches(text: string, patterns: RegExp[]): string[] {
  const matches: string[] = [];
  for (const pattern of patterns) {
    const clone = new RegExp(pattern.source, pattern.flags);
    let match: RegExpExecArray | null;
    while ((match = clone.exec(text)) !== null) {
      matches.push(match[1] ?? match[0]);
    }
  }
  return matches;
}

function mapPriceLevel(level?: string): string | undefined {
  const map: Record<string, string> = {
    PRICE_LEVEL_FREE: 'Free',
    PRICE_LEVEL_INEXPENSIVE: '$',
    PRICE_LEVEL_MODERATE: '$$',
    PRICE_LEVEL_EXPENSIVE: '$$$',
    PRICE_LEVEL_VERY_EXPENSIVE: '$$$$',
  };
  return level ? map[level] : undefined;
}

function mapCuisineHint(place: PlacesApiPlace): string {
  if (place.primaryType && TYPE_LABELS[place.primaryType]) {
    return TYPE_LABELS[place.primaryType];
  }
  const match = (place.types ?? []).find((type) => TYPE_LABELS[type]);
  return match ? TYPE_LABELS[match] : 'Restaurant';
}

function isNonFoodName(name: string): boolean {
  return /\b(hotel|marriott|resort|hostel|inn|airport|terminal|shopping mall|plaza|office tower|airbnb|air bnb|guest house|homestay)\b/i.test(
    name,
  );
}

function isFoodEstablishment(place: PlacesApiPlace): boolean {
  const name = place.displayName?.text ?? '';
  const types = place.types ?? [];
  const primary = place.primaryType;

  if (primary && EXCLUDED_TYPES.has(primary)) return false;
  if (types.some((type) => EXCLUDED_TYPES.has(type))) return false;
  if (isNonFoodName(name) && !types.some((type) => FOOD_TYPES.has(type))) return false;

  return (
    (primary !== undefined && FOOD_TYPES.has(primary)) ||
    types.some((type) => FOOD_TYPES.has(type))
  );
}

function normalizeReview(review: PlacesApiReview): GoogleReview | null {
  const text = review.text?.text?.trim();
  if (!text) return null;

  return {
    author: review.authorAttribution?.displayName ?? 'Google User',
    rating: review.rating ?? 0,
    text,
    relativeTime: review.relativePublishTimeDescription ?? '',
    photoUri: review.authorAttribution?.photoUri,
  };
}

function extractThemes(corpus: string): string[] {
  const themes: string[] = [];
  for (const rule of THEME_RULES) {
    if (rule.pattern.test(corpus)) themes.push(rule.label);
  }
  return uniqueStrings(themes, 4);
}

function buildBestPicks(
  place: PlacesApiPlace,
  reviews: GoogleReview[],
  openRice: PlaceInsights['openRice'],
  mentionedDishes: string[],
): string[] {
  const picks: string[] = [];
  const price = mapPriceLevel(place.priceLevel);
  const cuisine = openRice?.cuisine ?? mapCuisineHint(place);
  const bestDish = openRice?.bestDish ?? mentionedDishes[0];

  if (bestDish) picks.push(`Must-try: ${bestDish}`);
  if (cuisine) picks.push(`Cuisine: ${cuisine}`);
  if (price) picks.push(`Price range: ${price}`);
  if (openRice?.michelin) picks.push(openRice.michelin);

  const avgRecent =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;
  if (avgRecent >= 4.5) picks.push('Recent Google reviewers rate it highly');

  return picks.slice(0, 4);
}

function synthesizeInsights(
  place: PlacesApiPlace,
  reviews: GoogleReview[],
  openRice: PlaceInsights['openRice'],
): PlaceInsights['insights'] {
  const corpus = reviews.map((r) => r.text).join(' ');
  const mentionedDishes = uniqueStrings(extractMatches(corpus, DISH_PATTERNS), 5);
  const topPraised = extractThemes(corpus);
  const commonConcerns = uniqueStrings(extractMatches(corpus, CONCERN_PATTERNS), 3);

  const name = place.displayName?.text ?? 'This restaurant';
  const rating = place.rating ?? 0;
  const count = place.userRatingCount ?? 0;
  const bestDish = openRice?.bestDish ?? mentionedDishes[0];
  const bestPicks = buildBestPicks(place, reviews, openRice, mentionedDishes);

  let summary = `${name} — **${rating.toFixed(1)}/5** on Google (${count.toLocaleString()} reviews)`;
  if (openRice) summary += ` · OpenRice **${openRice.score.toFixed(1)}/5**`;
  if (bestDish) summary += `. Standout pick: **${bestDish}**`;

  const aggregateParts: string[] = [
    `**${name}** is a verified **food establishment** (${mapCuisineHint(place)}).`,
    `Google diners rate it **${rating.toFixed(1)}/5** from **${count.toLocaleString()}** reviews.`,
  ];

  if (openRice) {
    aggregateParts.push(`OpenRice scores it **${openRice.score.toFixed(1)}/5** — a trusted local benchmark for HK dining.`);
  }

  if (bestDish) {
    aggregateParts.push(`Best pick across reviews: **${bestDish}**.`);
  } else if (mentionedDishes.length > 0) {
    aggregateParts.push(`Reviewers frequently mention **${mentionedDishes.slice(0, 2).join('** and **')}**.`);
  }

  if (topPraised.length > 0) {
    aggregateParts.push(`Diners especially praise ${topPraised.slice(0, 2).join(' and ').toLowerCase()}.`);
  }

  if (commonConcerns.length > 0) {
    aggregateParts.push(`Worth noting: ${commonConcerns.slice(0, 2).join('; ')}.`);
  }

  return {
    summary,
    aggregateSummary: aggregateParts.join(' '),
    bestPicks,
    topPraised,
    commonConcerns,
    mentionedDishes,
  };
}

function buildSearchQuery(input: FetchPlaceReviewsInput): string {
  const district = input.district?.trim();
  const base = input.searchQuery?.trim() || input.restaurantName.trim();
  const lower = base.toLowerCase();

  if (lower.includes('restaurant') || lower.includes('food') || lower.includes('cafe')) {
    return [base, district, 'Hong Kong'].filter(Boolean).join(' ');
  }

  return [base, district, 'Hong Kong restaurant bar cafe food'].filter(Boolean).join(' ');
}

const FOOD_SEARCH_TYPES = ['restaurant', 'bar', 'cafe'] as const;

async function searchPlacesByType(
  apiKey: string,
  textQuery: string,
  includedType: (typeof FOOD_SEARCH_TYPES)[number],
): Promise<PlacesApiPlace[]> {
  const fieldMask = [
    'places.id',
    'places.displayName',
    'places.formattedAddress',
    'places.rating',
    'places.userRatingCount',
    'places.reviews',
    'places.priceLevel',
    'places.googleMapsUri',
    'places.primaryType',
    'places.types',
  ].join(',');

  const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': fieldMask,
    },
    body: JSON.stringify({
      textQuery,
      includedType,
      strictTypeFiltering: true,
      languageCode: 'en',
      regionCode: 'HK',
      maxResultCount: 10,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Google Places search failed (${response.status}): ${errorBody}`);
  }

  const data = (await response.json()) as { places?: PlacesApiPlace[] };
  return data.places ?? [];
}

function rankFoodPlace(place: PlacesApiPlace): number {
  const rating = place.rating ?? 0;
  const reviews = place.userRatingCount ?? 0;
  return rating * Math.log10(reviews + 10);
}

async function searchFoodPlaces(apiKey: string, textQuery: string): Promise<PlacesApiPlace[]> {
  const batches = await Promise.all(
    FOOD_SEARCH_TYPES.map((type) => searchPlacesByType(apiKey, textQuery, type)),
  );

  const seen = new Set<string>();
  const merged: PlacesApiPlace[] = [];

  for (const batch of batches) {
    for (const place of batch) {
      const id = place.id;
      if (!id || seen.has(id)) continue;
      seen.add(id);
      merged.push(place);
    }
  }

  const foodPlaces = merged.filter(isFoodEstablishment).sort((a, b) => rankFoodPlace(b) - rankFoodPlace(a));
  if (foodPlaces.length > 0) return foodPlaces;

  return merged
    .filter((place) => !isNonFoodName(place.displayName?.text ?? ''))
    .sort((a, b) => rankFoodPlace(b) - rankFoodPlace(a));
}

async function fetchPlaceDetails(apiKey: string, placeId: string): Promise<PlacesApiPlace | null> {
  const fieldMask = [
    'id',
    'displayName',
    'formattedAddress',
    'rating',
    'userRatingCount',
    'reviews',
    'priceLevel',
    'googleMapsUri',
    'primaryType',
    'types',
  ].join(',');

  const response = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
    headers: {
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': fieldMask,
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Google Places details failed (${response.status}): ${errorBody}`);
  }

  return (await response.json()) as PlacesApiPlace;
}

export async function fetchPlaceReviews(input: FetchPlaceReviewsInput): Promise<PlaceInsights | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_PLACES_API_KEY is not configured');
  }

  const textQuery = buildSearchQuery(input);
  const candidates = await searchFoodPlaces(apiKey, textQuery);
  const searchResult = candidates[0];

  if (!searchResult?.id) {
    return null;
  }

  if (!isFoodEstablishment(searchResult)) {
    return null;
  }

  const place = (await fetchPlaceDetails(apiKey, searchResult.id)) ?? searchResult;

  if (!isFoodEstablishment(place)) {
    return null;
  }

  const reviews = (place.reviews ?? [])
    .map(normalizeReview)
    .filter((r): r is GoogleReview => r !== null)
    .slice(0, 5);

  const placeName = place.displayName?.text ?? input.restaurantName;
  const catalogMatch = matchOpenRiceEntry(placeName);
  const openRice = catalogMatch
    ? {
        score: catalogMatch.openRiceScore,
        bestDish: catalogMatch.bestDish,
        cuisine: catalogMatch.cuisine,
        michelin: catalogMatch.michelin,
      }
    : undefined;

  return {
    placeId: place.id ?? searchResult.id,
    name: placeName,
    address: place.formattedAddress ?? '',
    googleRating: place.rating ?? 0,
    totalReviews: place.userRatingCount ?? 0,
    googleMapsUri: place.googleMapsUri,
    priceLevel: mapPriceLevel(place.priceLevel),
    primaryType: place.primaryType,
    cuisineHint: openRice?.cuisine ?? mapCuisineHint(place),
    openRice,
    reviews,
    insights: synthesizeInsights(place, reviews, openRice),
  };
}

export type PlacesErrorCode = 'missing_key' | 'permission_denied' | 'not_found' | 'ssl_error' | 'unknown';

export function classifyPlacesError(message: string): PlacesErrorCode {
  if (message.includes('not configured')) return 'missing_key';
  if (
    message.includes('403') ||
    message.includes('PERMISSION_DENIED') ||
    message.includes('API_KEY_SERVICE_BLOCKED')
  ) {
    return 'permission_denied';
  }
  if (message.includes('No matching place')) return 'not_found';
  if (
    message.includes('UNABLE_TO_VERIFY_LEAF_SIGNATURE') ||
    message.includes('unable to verify the first certificate')
  ) {
    return 'ssl_error';
  }
  return 'unknown';
}

export async function handlePlaceReviewsRequest(body: unknown): Promise<{
  ok: boolean;
  data?: PlaceInsights;
  error?: string;
  errorCode?: PlacesErrorCode;
}> {
  const payload = body as Partial<FetchPlaceReviewsInput>;

  if (!payload.restaurantName?.trim()) {
    return { ok: false, error: 'restaurantName is required', errorCode: 'unknown' };
  }

  try {
    const data = await fetchPlaceReviews({
      restaurantName: payload.restaurantName.trim(),
      district: payload.district?.trim(),
      searchQuery: payload.searchQuery?.trim(),
    });

    if (!data) {
      return {
        ok: false,
        error: 'No matching restaurant or food establishment found on Google Maps',
        errorCode: 'not_found',
      };
    }

    return { ok: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch Google reviews';
    return { ok: false, error: message, errorCode: classifyPlacesError(message) };
  }
}
