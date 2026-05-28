import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { ChatMessage, Restaurant } from '../types';
import { sendChatMessage } from '../lib/chatService';

const PINNED_DISTRICTS = ['Central', 'Tung Chung', 'Mong Kok', 'Tsim Sha Tsui', 'Sham Shui Po'] as const;

interface ChatContextValue {
  messages: ChatMessage[];
  isThinking: boolean;
  activeRestaurant: Restaurant | null;
  pinnedDistrict: string;
  hasStarted: boolean;
  sendMessage: (content: string) => Promise<void>;
  setActiveRestaurant: (restaurant: Restaurant | null) => void;
  cyclePinnedDistrict: () => void;
  clearChat: () => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [activeRestaurant, setActiveRestaurant] = useState<Restaurant | null>(null);
  const [pinnedDistrict, setPinnedDistrict] = useState<string>('Central');

  const hasStarted = messages.length > 0;

  const cyclePinnedDistrict = useCallback(() => {
    setPinnedDistrict((current) => {
      const index = PINNED_DISTRICTS.indexOf(current as (typeof PINNED_DISTRICTS)[number]);
      const next = index === -1 ? 0 : (index + 1) % PINNED_DISTRICTS.length;
      return PINNED_DISTRICTS[next];
    });
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed || isThinking) return;

    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsThinking(true);

    try {
      const payload = {
        messages: [...messages, userMessage].map((m) => ({
          role: m.role,
          content: m.content,
        })),
        userContext: { pinnedDistrict },
      };

      const response = await sendChatMessage(payload);

      const assistantMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        widgets: response.widgets,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      const restaurantWidget = response.widgets?.find((w) => w.type === 'restaurant');
      if (restaurantWidget && restaurantWidget.type === 'restaurant') {
        setActiveRestaurant(restaurantWidget.data);
      }
    } finally {
      setIsThinking(false);
    }
  }, [isThinking, messages, pinnedDistrict]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setActiveRestaurant(null);
  }, []);

  const value = useMemo(
    () => ({
      messages,
      isThinking,
      activeRestaurant,
      pinnedDistrict,
      hasStarted,
      sendMessage,
      setActiveRestaurant,
      cyclePinnedDistrict,
      clearChat,
    }),
    [messages, isThinking, activeRestaurant, pinnedDistrict, hasStarted, sendMessage, cyclePinnedDistrict, clearChat],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat(): ChatContextValue {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
