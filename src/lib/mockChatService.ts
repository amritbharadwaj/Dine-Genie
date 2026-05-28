import type { ChatPayload, ChatResponse, ChatWidget, PlaceInsights, PriceRange, Restaurant } from '../types';
import {
  biryaniShowdown,
  getRestaurantByName,
  restaurants,
} from '../data/mockRestaurantData';
import {
  buildDistrictSearchQuery,
  buildRestaurantSearchQuery,
  extractQueryContext,
  type QueryContext,
} from '../../lib/locationContext';
import {
  fetchGooglePlaceReviews,
  formatReviewInsightsForChat,
  getPlacesUnavailableMessage,
} from './placesClient';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type QueryIntent =
  | 'caprice'
  | 'yardbird'
  | 'biryani'
  | 'showdown'
  | 'hotpot'
  | 'dimsum'
  | 'district'
  | 'generic';

function matchQuery(content: string, pinnedDistrict?: string | null): QueryIntent {
  const ctx = extractQueryContext(content);

  if (ctx.restaurantHint === 'caprice' || /\bcaprice\b/i.test(content)) return 'caprice';
  if (ctx.restaurantHint === 'yardbird' || /\byardbird\b/i.test(content)) return 'yardbird';
  if (ctx.mentionsShowdown) return 'showdown';

  if (ctx.mentionsBiryani) {
    if (ctx.mentionsTungChung) return 'district';
    if (ctx.mentionsChungkingMansions) return 'biryani';
    if (ctx.district && ctx.district.id !== 'chungking-mansions') return 'district';
    return 'biryani';
  }

  if (ctx.mentionsHotpot && ctx.district?.id !== 'tung-chung') return 'hotpot';
  if (ctx.mentionsDimSum && ctx.district?.id !== 'tung-chung') return 'dimsum';

  if (ctx.district && !ctx.restaurantHint) return 'district';
  if (getRestaurantByName(content)) return 'generic';
  if (pinnedDistrict && !ctx.restaurantHint) return 'district';

  return 'generic';
}

function buildRestaurantContent(r: Restaurant, intro: string): string {
  return `${intro}

- **Signature dish:** ${r.bestDish}
- **Location:** ${r.district} · MTR ${r.mtrStation}
- **Cuisine:** ${r.cuisine}
- **Price range:** ${r.priceRange}${r.michelin ? ` · ${r.michelin}` : ''}${r.openRiceScore ? ` · OpenRice ${r.openRiceScore}/5` : ''}

${r.description}`;
}

function mapPriceLevel(level?: string): PriceRange {
  if (level === '$') return '$';
  if (level === '$$') return '$$';
  if (level === '$$$') return '$$$';
  if (level === '$$$$') return '$$$$';
  return '$$';
}

function restaurantFromPlaceInsights(insights: PlaceInsights, district: string): Restaurant {
  return {
    id: insights.placeId,
    name: insights.name,
    district,
    mtrStation: district,
    priceRange: mapPriceLevel(insights.priceLevel),
    cuisine: 'Local favourite',
    bestDish: insights.insights.mentionedDishes[0] ?? 'Ask staff for today\'s specialty',
    rating: insights.googleRating,
    description: insights.insights.summary.replace(/\*\*/g, ''),
    highlights: [
      ...insights.insights.topPraised.slice(0, 2),
      `${insights.totalReviews.toLocaleString()} Google reviews`,
    ],
  };
}

function buildDistrictIntro(ctx: QueryContext, insights: PlaceInsights): string {
  const area = ctx.district?.name ?? 'your area';
  return `For **${area}**, Google diners highlight **${insights.name}** as a strong pick based on live reviews.

**Address:** ${insights.address}`;
}

function buildBaseResponse(intent: QueryIntent, content: string, ctx: QueryContext): ChatResponse {
  switch (intent) {
    case 'caprice':
    case 'yardbird':
    case 'biryani':
    case 'hotpot':
    case 'dimsum': {
      const r =
        intent === 'caprice' ? restaurants.caprice
        : intent === 'yardbird' ? restaurants.yardbird
        : intent === 'biryani' ? restaurants['chungking-biryani']
        : intent === 'hotpot' ? restaurants.mamafina
        : restaurants['tim-ho-wan'];
      return {
        content: buildRestaurantContent(r, `Here's my pick for **${r.name}**:`),
        widgets: [{ type: 'restaurant', data: r }],
      };
    }
    case 'showdown':
      return {
        content: `**Biryani Showdown** — comparison below 👇`,
        widgets: [{ type: 'showdown', data: biryaniShowdown }],
      };
    case 'district': {
      const area = ctx.district?.name ?? 'Hong Kong';
      return { content: `Searching live Google reviews for **${area}**...` };
    }
    default: {
      const named = getRestaurantByName(content);
      if (named) {
        return {
          content: buildRestaurantContent(named, `Here's what I know about **${named.name}**:`),
          widgets: [{ type: 'restaurant', data: named }],
        };
      }
      return {
        content: `I'm your **HK culinary concierge** (offline mock mode). Ask about restaurants, districts, or dishes in Hong Kong.`,
      };
    }
  }
}

function getRestaurantFromResponse(response: ChatResponse): Restaurant | null {
  const widget = response.widgets?.find((w): w is ChatWidget & { type: 'restaurant' } => w.type === 'restaurant');
  return widget ? widget.data : null;
}

async function enrichWithGoogleReviews(
  response: ChatResponse,
  restaurant: Restaurant,
  ctx: QueryContext,
  pinnedDistrict?: string | null,
): Promise<ChatResponse> {
  const { insights, errorCode, errorMessage } = await fetchGooglePlaceReviews({
    restaurantName: restaurant.name,
    district: ctx.district?.name ?? restaurant.district,
    searchQuery: buildRestaurantSearchQuery(
      restaurant.name,
      restaurant.district,
      restaurant.googleSearchQuery,
      pinnedDistrict,
    ),
  });

  if (!insights) {
    return {
      ...response,
      content: `${response.content}\n\n${getPlacesUnavailableMessage(errorCode, errorMessage)}`,
    };
  }

  return {
    content: `${response.content}\n\n---\n\n${formatReviewInsightsForChat(insights)}`,
    widgets: [...(response.widgets ?? []), { type: 'google-reviews', data: insights }],
  };
}

async function buildDistrictResponse(ctx: QueryContext, pinnedDistrict?: string | null): Promise<ChatResponse> {
  const area = ctx.district?.name ?? pinnedDistrict ?? 'Hong Kong';
  const { insights, errorCode, errorMessage } = await fetchGooglePlaceReviews({
    restaurantName: area,
    district: area,
    searchQuery: buildDistrictSearchQuery(ctx, pinnedDistrict),
  });

  if (!insights) {
    return {
      content: `Couldn't pull Google results for **${area}**.\n\n${getPlacesUnavailableMessage(errorCode, errorMessage)}`,
    };
  }

  return {
    content: `${buildDistrictIntro(ctx, insights)}\n\n${formatReviewInsightsForChat(insights)}`,
    widgets: [
      { type: 'restaurant', data: restaurantFromPlaceInsights(insights, area) },
      { type: 'google-reviews', data: insights },
    ],
  };
}

/** Fallback when Gemini API is unavailable */
export async function sendMockChatMessage(payload: ChatPayload): Promise<ChatResponse> {
  const lastUserMessage = [...payload.messages].reverse().find((m) => m.role === 'user');
  if (!lastUserMessage) {
    return { content: 'Send me a message and I\'ll help you discover Hong Kong\'s best food.' };
  }

  await delay(400);
  const pinnedDistrict = payload.userContext?.pinnedDistrict ?? null;
  const ctx = extractQueryContext(lastUserMessage.content);
  const intent = matchQuery(lastUserMessage.content, pinnedDistrict);

  if (intent === 'district') return buildDistrictResponse(ctx, pinnedDistrict);

  const baseResponse = buildBaseResponse(intent, lastUserMessage.content, ctx);
  const restaurant = getRestaurantFromResponse(baseResponse);
  if (!restaurant) return baseResponse;

  return enrichWithGoogleReviews(baseResponse, restaurant, ctx, pinnedDistrict);
}
