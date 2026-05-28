export type MessageRole = 'user' | 'assistant';

export type PriceRange = '$' | '$$' | '$$$' | '$$$$';

export interface Restaurant {
  id: string;
  name: string;
  district: string;
  mtrStation: string;
  priceRange: PriceRange;
  cuisine: string;
  bestDish: string;
  rating: number;
  michelin?: string;
  openRiceScore?: number;
  description: string;
  highlights: string[];
  /** Optimized query for Google Places Text Search */
  googleSearchQuery?: string;
}

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

export interface DishComparison {
  dishName: string;
  restaurantA: {
    restaurant: Restaurant;
    score: number;
    verdict: string;
  };
  restaurantB: {
    restaurant: Restaurant;
    score: number;
    verdict: string;
  };
  winnerId: string;
}

export type ChatWidget =
  | { type: 'restaurant'; data: Restaurant }
  | { type: 'showdown'; data: DishComparison }
  | { type: 'google-reviews'; data: PlaceInsights };

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  widgets?: ChatWidget[];
}

export interface TrendingTopic {
  id: string;
  title: string;
  queryCount: number;
  emoji: string;
  category: string;
}

export interface PromptSuggestion {
  id: string;
  label: string;
  query: string;
}

export interface ChatPayload {
  messages: Array<{ role: MessageRole; content: string }>;
  userContext?: {
    pinnedDistrict?: string | null;
  };
}

export interface ChatResponse {
  content: string;
  widgets?: ChatWidget[];
}
