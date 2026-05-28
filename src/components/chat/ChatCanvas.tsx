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
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  return (
    <div className="flex min-h-dvh flex-col">
      <main
        ref={scrollRef}
        className={[
          'flex-1 overflow-y-auto overscroll-contain',
          hasStarted ? 'pb-36' : 'pb-44',
        ].join(' ')}
      >
        <div className="mx-auto w-full max-w-3xl px-4 pt-6">
          {!hasStarted ? (
            <DiscoveryDashboard />
          ) : (
            <div className="space-y-6 pb-4">
              {messages.map((message, index) => (
                <ChatBubble key={message.id} message={message} index={index} />
              ))}
              {isThinking && <ThinkingIndicator />}
              <div ref={bottomRef} className="h-1" />
            </div>
          )}
        </div>
      </main>

      <ChatInput value={inputValue} onChange={setInputValue} />
    </div>
  );
}
