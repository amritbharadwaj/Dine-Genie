import { useEffect, useRef, useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { ChatBubble } from './ChatBubble';
import { ChatInput } from './ChatInput';
import { ThinkingIndicator } from './ThinkingIndicator';
import { DiscoveryDashboard } from '../discovery/DiscoveryDashboard';

export function ChatCanvas() {
  const { messages, isThinking, hasStarted } = useChat();
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
  }, [messages, isThinking]);

  return (
    <div className="relative min-h-0 flex-1 overflow-hidden">
      <main
        ref={scrollRef}
        className={[
          'chat-scroll absolute inset-x-0 top-0 overflow-x-hidden overflow-y-scroll overscroll-y-contain',
          'bottom-[calc(9.5rem+env(safe-area-inset-bottom))]',
        ].join(' ')}
      >
        <div className="mx-auto w-full min-w-0 max-w-3xl px-4 pt-6">
          {!hasStarted ? (
            <DiscoveryDashboard />
          ) : (
            <div className="space-y-6 pb-6">
              {messages.map((message, index) => (
                <ChatBubble key={message.id} message={message} index={index} />
              ))}
              {isThinking && <ThinkingIndicator />}
              <div ref={bottomRef} className="h-px" aria-hidden="true" />
            </div>
          )}
        </div>
      </main>

      <ChatInput value={inputValue} onChange={setInputValue} />
    </div>
  );
}
