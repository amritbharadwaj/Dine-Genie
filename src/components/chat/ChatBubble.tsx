import ReactMarkdown from 'react-markdown';
import type { ChatMessage, DishComparison, PlaceInsights, Restaurant } from '../../types';
import { RestaurantCard } from '../cards/RestaurantCard';
import { DishShowdown } from '../cards/DishShowdown';
import { GoogleReviewsCard } from '../cards/GoogleReviewsCard';

interface ChatBubbleProps {
  message: ChatMessage;
  index: number;
}

export function ChatBubble({ message, index }: ChatBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={[
        'flex w-full animate-fade-up',
        isUser ? 'justify-end' : 'justify-start',
      ].join(' ')}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div
        className={[
          'max-w-[min(100%,42rem)] space-y-3',
          isUser ? 'items-end' : 'items-start',
        ].join(' ')}
      >
        {!isUser && (
          <div className="mb-1 flex items-center gap-2 px-1">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-electric-violet/20 ring-1 ring-electric-violet/30">
              <span className="text-[10px] font-bold text-electric-violet">DA</span>
            </div>
            <span className="text-xs font-medium text-white/40">DineAgent</span>
          </div>
        )}

        <div
          className={[
            'rounded-2xl px-4 py-3 text-[15px] leading-relaxed',
            isUser
              ? 'bg-white/10 text-white/95 backdrop-blur-sm border border-white/10 rounded-br-md'
              : 'glass-panel glow-violet rounded-bl-md text-white/90',
          ].join(' ')}
        >
          {isUser ? (
            <p>{message.content}</p>
          ) : (
            <div className="prose-agent">
              <ReactMarkdown
                components={{
                  p: ({ children }) => (
                    <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold text-white">{children}</strong>
                  ),
                  h3: ({ children }) => (
                    <h3 className="mb-2 mt-4 first:mt-0 text-sm font-semibold text-amber-300/90">
                      {children}
                    </h3>
                  ),
                  ul: ({ children }) => (
                    <ul className="mb-3 ml-4 list-disc space-y-1.5 text-white/80 last:mb-0">
                      {children}
                    </ul>
                  ),
                  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {!isUser && message.widgets && message.widgets.length > 0 && (
          <div className="space-y-3 pt-1">
            {message.widgets.map((widget, i) => {
              if (widget.type === 'restaurant') {
                return (
                  <RestaurantCard
                    key={`${message.id}-restaurant-${i}`}
                    restaurant={widget.data as Restaurant}
                  />
                );
              }
              if (widget.type === 'showdown') {
                return (
                  <DishShowdown
                    key={`${message.id}-showdown-${i}`}
                    comparison={widget.data as DishComparison}
                  />
                );
              }
              if (widget.type === 'google-reviews') {
                return (
                  <GoogleReviewsCard
                    key={`${message.id}-reviews-${i}`}
                    insights={widget.data as PlaceInsights}
                  />
                );
              }
              return null;
            })}
          </div>
        )}
      </div>
    </div>
  );
}
