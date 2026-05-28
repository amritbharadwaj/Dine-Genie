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
  reviews: GoogleReview[];
  insights: {
    summary: string;
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
  reviews?: PlacesApiReview[];
}

const POSITIVE_PATTERNS = [
  /(?:amazing|excellent|outstanding|perfect|incredible|delicious|fantastic|must[- ]try|highly recommend)/gi,
  /(?:best .{3,40}(?:ever|in hk|in hong kong))/gi,
];

const CONCERN_PATTERNS = [
  /(?:long wait|slow service|overpriced|too expensive|noisy|crowded|rude staff|disappointing)/gi,
  /(?:not worth|wouldn't return|average at best)/gi,
];

const DISH_PATTERNS = [
  /(?:try the|must order|ordered the|recommend the)\s+([^.!?,]{3,40})/gi,
  /(?:the)\s+([a-z][a-z\s'-]{2,35})\s+(?:was|is)\s+(?:amazing|excellent|delicious|incredible|perfect|outstanding)/gi,
];

function uniqueStrings(items: string[], limit = 5): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const item of items) {
    const normalized = item.trim().replace(/\s+/g, ' ');
    if (!normalized || normalized.length < 3) continue;
    const key = normalized.toLowerCase();
    if (seen.has(key)) continue;
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

function synthesizeInsights(
  place: PlacesApiPlace,
  reviews: GoogleReview[],
): PlaceInsights['insights'] {
  const corpus = reviews.map((r) => r.text).join(' ');

  const topPraised = uniqueStrings(extractMatches(corpus, POSITIVE_PATTERNS), 4);
  const commonConcerns = uniqueStrings(extractMatches(corpus, CONCERN_PATTERNS), 3);
  const mentionedDishes = uniqueStrings(extractMatches(corpus, DISH_PATTERNS), 5);

  const name = place.displayName?.text ?? 'This restaurant';
  const rating = place.rating ?? 0;
  const count = place.userRatingCount ?? 0;

  let summary = `${name} holds a **${rating.toFixed(1)}/5** Google rating from **${count.toLocaleString()}** reviews.`;

  if (topPraised.length > 0) {
    summary += ` Diners frequently praise: ${topPraised.slice(0, 2).join('; ')}.`;
  }

  if (mentionedDishes.length > 0) {
    summary += ` Standout mentions include **${mentionedDishes.slice(0, 3).join('**, **')}**.`;
  }

  if (commonConcerns.length > 0) {
    summary += ` Some note: ${commonConcerns.slice(0, 2).join('; ')}.`;
  }

  return { summary, topPraised, commonConcerns, mentionedDishes };
}

function buildSearchQuery(input: FetchPlaceReviewsInput): string {
  if (input.searchQuery) return input.searchQuery;
  const parts = [input.restaurantName, input.district, 'Hong Kong', 'restaurant'].filter(Boolean);
  return parts.join(' ');
}

async function searchPlace(apiKey: string, textQuery: string): Promise<PlacesApiPlace | null> {
  const fieldMask = [
    'places.id',
    'places.displayName',
    'places.formattedAddress',
    'places.rating',
    'places.userRatingCount',
    'places.reviews',
    'places.priceLevel',
    'places.googleMapsUri',
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
      languageCode: 'en',
      regionCode: 'HK',
      maxResultCount: 1,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Google Places search failed (${response.status}): ${errorBody}`);
  }

  const data = (await response.json()) as { places?: PlacesApiPlace[] };
  return data.places?.[0] ?? null;
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
  const searchResult = await searchPlace(apiKey, textQuery);

  if (!searchResult?.id) {
    return null;
  }

  const place = (await fetchPlaceDetails(apiKey, searchResult.id)) ?? searchResult;
  const reviews = (place.reviews ?? [])
    .map(normalizeReview)
    .filter((r): r is GoogleReview => r !== null)
    .slice(0, 5);

  return {
    placeId: place.id ?? searchResult.id,
    name: place.displayName?.text ?? input.restaurantName,
    address: place.formattedAddress ?? '',
    googleRating: place.rating ?? 0,
    totalReviews: place.userRatingCount ?? 0,
    googleMapsUri: place.googleMapsUri,
    priceLevel: mapPriceLevel(place.priceLevel),
    reviews,
    insights: synthesizeInsights(place, reviews),
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
        error: 'No matching place found on Google Maps',
        errorCode: 'not_found',
      };
    }

    return { ok: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch Google reviews';
    return { ok: false, error: message, errorCode: classifyPlacesError(message) };
  }
}
