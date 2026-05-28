import {
  buildDistrictSearchQuery,
  buildRestaurantSearchQuery,
  extractQueryContext,
} from './locationContext';
import { fetchPlaceReviews, type PlaceInsights } from './googlePlaces';

export type MessageRole = 'user' | 'assistant';

export interface ChatMessageInput {
  role: MessageRole;
  content: string;
}

export interface ChatRequestBody {
  messages: ChatMessageInput[];
  userContext?: {
    pinnedDistrict?: string | null;
  };
}

export interface RestaurantWidget {
  id: string;
  name: string;
  district: string;
  mtrStation: string;
  priceRange: '$' | '$$' | '$$$' | '$$$$';
  cuisine: string;
  bestDish: string;
  rating: number;
  description: string;
  highlights: string[];
  michelin?: string;
  openRiceScore?: number;
}

export type ChatWidget =
  | { type: 'restaurant'; data: RestaurantWidget }
  | { type: 'google-reviews'; data: PlaceInsights };

export interface ChatResponseData {
  content: string;
  widgets?: ChatWidget[];
}

const KIMI_API_BASE = (process.env.KIMI_API_BASE_URL ?? 'https://api.moonshot.ai/v1').replace(/\/$/, '');
const KIMI_MODEL = process.env.KIMI_MODEL ?? 'kimi-k2.6';

const SYSTEM_PROMPT = `You are HK DineAgent — an ultra-smart culinary concierge for foodies in Hong Kong.

Your personality: premium, knowledgeable, concise, and locally grounded. Write in clear markdown with **bold** for restaurant names and dish highlights.

Critical rules:
- ONLY recommend places where people go to eat or drink — restaurants, cafés, bars, pubs, dai pai dongs, bakeries, etc. Never hotels, Airbnbs, hostels, airports, or malls unless naming a specific in-house restaurant.
- **Tung Chung** (Lantau Island) is NOT **Chungking Mansions** (TST). Never confuse districts.
- Respect the user's pinned location context.

When LIVE RESTAURANT DATA is provided:
- Lead with the supplied **aggregate summary** — do not repeat raw Google/OpenRice stats verbatim.
- Use OpenRice scores when provided as the local HK dining benchmark alongside Google.
- Highlight **best picks** (must-try dishes, cuisine, price, vibe).
- Do NOT invent ratings or review quotes.
- Do NOT output a separate "Google Reviews —" section — the UI renders review cards.

Keep responses focused: aggregate verdict, 2–3 actionable tips (MTR exit, queue, when to go).`;

function getKimiApiKey(): string {
  const key = process.env.KIMI_API_KEY ?? process.env.MOONSHOT_API_KEY;
  if (!key) {
    throw new Error('KIMI_API_KEY is not configured');
  }
  return key;
}

function mapPriceLevel(level?: string): RestaurantWidget['priceRange'] {
  if (level === '$') return '$';
  if (level === '$$') return '$$';
  if (level === '$$$') return '$$$';
  if (level === '$$$$') return '$$$$';
  return '$$';
}

function restaurantFromPlaceInsights(insights: PlaceInsights, district: string): RestaurantWidget {
  return {
    id: insights.placeId,
    name: insights.name,
    district,
    mtrStation: district,
    priceRange: mapPriceLevel(insights.priceLevel),
    cuisine: insights.cuisineHint ?? insights.openRice?.cuisine ?? 'Restaurant',
    bestDish: insights.openRice?.bestDish ?? insights.insights.mentionedDishes[0] ?? 'Ask staff for today\'s specialty',
    rating: insights.googleRating,
    openRiceScore: insights.openRice?.score,
    michelin: insights.openRice?.michelin,
    description: insights.insights.aggregateSummary.replace(/\*\*/g, ''),
    highlights: insights.insights.bestPicks.slice(0, 3),
  };
}

function formatGroundingBlock(insights: PlaceInsights): string {
  const reviewSnippets = insights.reviews
    .slice(0, 3)
    .map((r) => `- (${r.rating}/5, ${r.relativeTime}) ${r.text.slice(0, 220)}`)
    .join('\n');

  return `[LIVE RESTAURANT DATA — food establishment only]
Name: ${insights.name}
Type: ${insights.cuisineHint ?? 'Restaurant'} (${insights.primaryType ?? 'restaurant'})
Address: ${insights.address}
Google: ${insights.googleRating}/5 (${insights.totalReviews} reviews)
OpenRice: ${insights.openRice ? `${insights.openRice.score}/5 · ${insights.openRice.cuisine}` : 'not in local catalog'}
Price: ${insights.priceLevel ?? 'unknown'}
Aggregate summary: ${insights.insights.aggregateSummary}
Best picks: ${insights.insights.bestPicks.join(' · ') || 'n/a'}
Mentioned dishes: ${insights.insights.mentionedDishes.join(', ') || 'none'}
Themes diners praise: ${insights.insights.topPraised.join('; ') || 'n/a'}
Concerns: ${insights.insights.commonConcerns.join('; ') || 'none'}
Review snippets:
${reviewSnippets || 'none'}`;
}

async function gatherPlaceGrounding(
  userMessage: string,
  pinnedDistrict?: string | null,
): Promise<PlaceInsights | null> {
  const ctx = extractQueryContext(userMessage);
  const area = ctx.district?.name ?? pinnedDistrict ?? null;

  let searchQuery: string;
  let restaurantName: string;

  if (ctx.restaurantHint) {
    restaurantName = ctx.restaurantHint
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
    searchQuery = buildRestaurantSearchQuery(restaurantName, area ?? undefined, undefined, pinnedDistrict);
  } else if (area) {
    restaurantName = area;
    searchQuery = buildDistrictSearchQuery(ctx, pinnedDistrict);
  } else if (pinnedDistrict) {
    restaurantName = pinnedDistrict;
    searchQuery = `${userMessage} best restaurant food ${pinnedDistrict} Hong Kong`;
  } else {
    return null;
  }

  try {
    return await fetchPlaceReviews({
      restaurantName,
      district: area ?? pinnedDistrict ?? undefined,
      searchQuery,
    });
  } catch {
    return null;
  }
}

async function callKimi(
  messages: ChatMessageInput[],
  pinnedDistrict: string | null | undefined,
  groundingBlock: string | null,
): Promise<string> {
  const apiKey = getKimiApiKey();
  const pinnedNote = pinnedDistrict
    ? `User pinned location context: ${pinnedDistrict}, Hong Kong.`
    : 'No pinned location — infer from the user message.';

  const systemText = [SYSTEM_PROMPT, pinnedNote, groundingBlock].filter(Boolean).join('\n\n');

  const chatMessages = [
    { role: 'system' as const, content: systemText },
    ...messages.map((message) => ({
      role: message.role,
      content: message.content,
    })),
  ];

  const response = await fetch(`${KIMI_API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: KIMI_MODEL,
      messages: chatMessages,
      temperature: 0.65,
      max_tokens: 2048,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Kimi API failed (${response.status}): ${errorBody.slice(0, 400)}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    error?: { message?: string };
  };

  if (data.error?.message) {
    throw new Error(`Kimi API error: ${data.error.message}`);
  }

  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) {
    throw new Error('Kimi returned an empty response');
  }

  return text;
}

export async function handleChatRequest(body: ChatRequestBody): Promise<{
  ok: boolean;
  data?: ChatResponseData;
  error?: string;
}> {
  const messages = body.messages?.filter((m) => m.content?.trim()) ?? [];
  const lastUser = [...messages].reverse().find((m) => m.role === 'user');

  if (!lastUser) {
    return { ok: false, error: 'At least one user message is required' };
  }

  try {
    const pinnedDistrict = body.userContext?.pinnedDistrict ?? null;
    const placeInsights = await gatherPlaceGrounding(lastUser.content, pinnedDistrict);
    const groundingBlock = placeInsights ? formatGroundingBlock(placeInsights) : null;

    const kimiReply = await callKimi(messages, pinnedDistrict, groundingBlock);

    const widgets: ChatWidget[] = [];
    let content = kimiReply;

    if (placeInsights) {
      const district =
        extractQueryContext(lastUser.content).district?.name ?? pinnedDistrict ?? 'Hong Kong';

      widgets.push({ type: 'restaurant', data: restaurantFromPlaceInsights(placeInsights, district) });
      widgets.push({ type: 'google-reviews', data: placeInsights });

      content = `${placeInsights.insights.aggregateSummary}\n\n${kimiReply}`;
    }

    return {
      ok: true,
      data: {
        content,
        widgets: widgets.length > 0 ? widgets : undefined,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate response';
    return { ok: false, error: message };
  }
}
