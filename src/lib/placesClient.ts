import type { PlaceInsights } from '../types';
import { getDemoPlaceInsights } from './demoPlaceInsights';

export type PlacesErrorCode =
  | 'missing_key'
  | 'permission_denied'
  | 'not_found'
  | 'ssl_error'
  | 'unknown';

export interface FetchPlaceReviewsParams {
  restaurantName: string;
  district?: string;
  searchQuery?: string;
}

export interface PlacesFetchResult {
  insights: PlaceInsights | null;
  errorCode?: PlacesErrorCode;
  errorMessage?: string;
}

interface PlaceReviewsApiResponse {
  ok: boolean;
  data?: PlaceInsights;
  error?: string;
  errorCode?: PlacesErrorCode;
}

function mapErrorCode(status: number, errorCode?: PlacesErrorCode): PlacesErrorCode {
  if (errorCode) return errorCode;
  if (status === 503) return 'missing_key';
  if (status === 403) return 'permission_denied';
  if (status === 404) return 'not_found';
  return 'unknown';
}

export async function fetchGooglePlaceReviews(
  params: FetchPlaceReviewsParams,
): Promise<PlacesFetchResult> {
  try {
    const response = await fetch('/api/places/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    let result: PlaceReviewsApiResponse;
    const rawText = await response.text();
    try {
      result = JSON.parse(rawText) as PlaceReviewsApiResponse;
    } catch {
      return {
        insights: null,
        errorCode: 'unknown',
        errorMessage: rawText.slice(0, 200) || `Server returned ${response.status}`,
      };
    }

    if (!response.ok || !result.ok || !result.data) {
      const errorCode = mapErrorCode(response.status, result.errorCode);

      if (errorCode === 'missing_key') {
        const demo = getDemoPlaceInsights(params.restaurantName);
        if (demo) {
          console.info('[Places] Using demo review data — set GOOGLE_PLACES_API_KEY for live data');
          return { insights: demo };
        }
      }

      console.warn('[Places]', result.error ?? 'Failed to fetch reviews');
      return {
        insights: null,
        errorCode,
        errorMessage: result.error,
      };
    }

    return { insights: result.data };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Network error';
    console.warn('[Places] Network error:', error);
    return { insights: null, errorCode: 'unknown', errorMessage: message };
  }
}

export function getPlacesUnavailableMessage(
  errorCode?: PlacesErrorCode,
  errorMessage?: string,
): string {
  switch (errorCode) {
    case 'missing_key':
      return '*Google Reviews unavailable — add `GOOGLE_PLACES_API_KEY` to your `.env` file and restart the dev server.*';
    case 'permission_denied':
      return '*Google Reviews blocked — enable **Places API (New)** in Google Cloud Console and allow your API key to use it. [Enable here](https://console.cloud.google.com/apis/library/places.googleapis.com)*';
    case 'not_found':
      return '*No Google Maps listing found for this restaurant.*';
    case 'ssl_error':
      return '*Google Reviews unavailable — SSL certificate issue. Restart with `npm run dev` (uses `--use-system-ca` automatically).*';
    default:
      return errorMessage
        ? `*Google Reviews unavailable — ${errorMessage.slice(0, 200)}*`
        : '*Google Reviews temporarily unavailable — restart `npm run dev` and try again.*';
  }
}

export function formatReviewInsightsForChat(insights: PlaceInsights): string {
  const { insights: analysis, googleRating, totalReviews, name } = insights;
  const lines: string[] = [
    `### Google Reviews — ${name}`,
    '',
    analysis.summary,
    '',
    `**Google Rating:** ${googleRating.toFixed(1)}/5 · **${totalReviews.toLocaleString()}** reviews`,
  ];

  if (analysis.mentionedDishes.length > 0) {
    lines.push('', '**Dishes diners mention most:**');
    analysis.mentionedDishes.forEach((dish) => lines.push(`- ${dish}`));
  }

  if (analysis.topPraised.length > 0) {
    lines.push('', '**What people love:**');
    analysis.topPraised.forEach((item) => lines.push(`- ${item}`));
  }

  if (analysis.commonConcerns.length > 0) {
    lines.push('', '**Worth noting:**');
    analysis.commonConcerns.forEach((item) => lines.push(`- ${item}`));
  }

  return lines.join('\n');
}
