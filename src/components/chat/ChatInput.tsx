import { useEffect, useRef, type FormEvent, type KeyboardEvent } from 'react';
import { ArrowUp, ImagePlus, MapPin, Mic } from 'lucide-react';
import { Button } from '../ui/Button';
import { InputField } from '../ui/InputField';
import { useChat } from '../../context/ChatContext';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function ChatInput({ value, onChange }: ChatInputProps) {
  const { sendMessage, isThinking, pinnedDistrict, cyclePinnedDistrict } = useChat();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!value.trim() || isThinking) return;
    const message = value;
    onChange('');
    await sendMessage(message);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit();
    }
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-8">
      <div
        className="pointer-events-auto w-full max-w-3xl animate-fade-up"
        style={{ animationDelay: '100ms' }}
      >
        <form onSubmit={handleSubmit} className="relative">
          <div className="absolute -top-10 left-0 right-0 flex items-center justify-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="glass"
              className="h-8 rounded-full px-3 text-white/50"
              aria-label="Voice input (coming soon)"
            >
              <Mic className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="glass"
              className="h-8 rounded-full px-3 text-white/50 hover:text-cyber-lime/80"
              aria-label={`Pinned area: ${pinnedDistrict}. Tap to change.`}
              onClick={cyclePinnedDistrict}
            >
              <MapPin className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{pinnedDistrict}, HK</span>
            </Button>
            <Button
              type="button"
              size="sm"
              variant="glass"
              className="h-8 rounded-full px-3 text-white/50"
              aria-label="Upload image (coming soon)"
            >
              <ImagePlus className="h-3.5 w-3.5" />
            </Button>
          </div>

          <InputField
            ref={inputRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about restaurants, dishes, or neighbourhoods..."
            disabled={isThinking}
            trailing={
              <Button
                type="submit"
                size="icon"
                variant={value.trim() ? 'lime' : 'ghost'}
                disabled={!value.trim() || isThinking}
                aria-label="Send message"
                className="h-9 w-9 shrink-0 rounded-xl"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
            }
          />

          <p className="mt-2 text-center text-[11px] text-white/25">
            HK DineAgent · Culinary concierge for Hong Kong foodies
          </p>
        </form>
      </div>
    </div>
  );
}
