import type { ChatPayload, ChatResponse } from '../types';
import { sendMockChatMessage } from './mockChatService';

interface ChatApiResponse {
  ok: boolean;
  data?: ChatResponse;
  error?: string;
}

/**
 * Primary chat handler — calls Kimi via /api/chat with Google Places grounding.
 * Falls back to mock responses if Kimi is unavailable.
 */
export async function sendChatMessage(payload: ChatPayload): Promise<ChatResponse> {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    let result: ChatApiResponse;
    try {
      result = (await response.json()) as ChatApiResponse;
    } catch {
      console.warn('[Chat] Invalid response from /api/chat — using mock fallback');
      return sendMockChatMessage(payload);
    }

    if (response.ok && result.ok && result.data) {
      return result.data;
    }

    console.warn('[Chat] Kimi unavailable:', result.error ?? response.status);
  } catch (error) {
    console.warn('[Chat] Network error calling /api/chat:', error);
  }

  return sendMockChatMessage(payload);
}

export async function* streamChatMessage(payload: ChatPayload): AsyncGenerator<string> {
  const response = await sendChatMessage(payload);
  const words = response.content.split(/(\s+)/);

  for (const word of words) {
    yield word;
  }
}

export type { ChatResponse };
