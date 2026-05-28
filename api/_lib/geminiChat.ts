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

const GEMINI_MODEL = process.env.GEMINI_MODEL ?? 'gemini-2.0-flash';

const SYSTEM_PROMPT = `You are HK DineAgent — an ultra-smart culinary concierge for foodies in Hong Kong.

Your personality: premium, knowledgeable, concise, and locally grounded. Write in clear markdown with **bold** for restaurant names and dish highlights.

Critical location rules:
- **Tung Chung** (Lantau Island, near the airport) is NOT **Chungking Mansions** (Tsim Sha Tsui). Never confuse them.
- Always respect the user's stated district and pinned location context.
- Reference MTR stations and districts when helpful.

When LIVE GOOGLE PLACES DATA is provided in the prompt:
- Treat it as ground truth for ratings, review counts, and diner sentiment.
- Do NOT invent Google ratings or review quotes — use only what is supplied.
- Synthesize insights naturally; mention standout dishes if listed.

When no live data is provided, you may use general Hong Kong dining knowledge but say when you're unsure.

Keep responses focused and actionable — top picks, must-order dishes, practical tips (queues, MTR exits, price range).`;

function getGeminiApiKey(): string {
  const key = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_AI_API_KEY;
  if (!key) {
    throw new Error('GEMINI_API_KEY is not configured');
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

function formatGroundingBlock(insights: PlaceInsights): string {
  const reviewSnippets = insights.reviews
    .slice(0, 3)
    .map((r) => `- (${r.rating}/5, ${r.relativeTime}) ${r.text.slice(0, 280)}`)
    .join('\n');

  return `[LIVE GOOGLE PLACES DATA — ground truth]
Name: ${insights.name}
Address: ${insights.address}
Google Rating: ${insights.googleRating}/5 (${insights.totalReviews} reviews)
Price level: ${insights.priceLevel ?? 'unknown'}
Summary: ${insights.insights.summary}
Mentioned dishes: ${insights.insights.mentionedDishes.join(', ') || 'none extracted'}
Praised for: ${insights.insights.topPraised.join('; ') || 'n/a'}
Concerns: ${insights.insights.commonConcerns.join('; ') || 'none noted'}
Recent review snippets:
${reviewSnippets || 'none available'}`;
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
    searchQuery = `${userMessage} ${pinnedDistrict} Hong Kong restaurant`;
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

async function callGemini(
  messages: ChatMessageInput[],
  pinnedDistrict: string | null | undefined,
  groundingBlock: string | null,
): Promise<string> {
  const apiKey = getGeminiApiKey();
  const pinnedNote = pinnedDistrict
    ? `User pinned location context: ${pinnedDistrict}, Hong Kong.`
    : 'No pinned location — infer from the user message.';

  const systemText = [SYSTEM_PROMPT, pinnedNote, groundingBlock].filter(Boolean).join('\n\n');

  const contents = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemText }] },
        contents,
        generationConfig: {
          temperature: 0.65,
          maxOutputTokens: 2048,
        },
      }),
    },
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini API failed (${response.status}): ${errorBody.slice(0, 400)}`);
  }

  const data = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!text) {
    throw new Error('Gemini returned an empty response');
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

    const content = await callGemini(messages, pinnedDistrict, groundingBlock);

    const widgets: ChatWidget[] = [];
    if (placeInsights) {
      const district =
        extractQueryContext(lastUser.content).district?.name ?? pinnedDistrict ?? 'Hong Kong';
      widgets.push({ type: 'restaurant', data: restaurantFromPlaceInsights(placeInsights, district) });
      widgets.push({ type: 'google-reviews', data: placeInsights });
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
