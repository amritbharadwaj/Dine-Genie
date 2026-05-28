import { Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';

interface PromptPillProps {
  label: string;
  onClick: () => void;
  index?: number;
}

export function PromptPill({ label, onClick, index = 0 }: PromptPillProps) {
  return (
    <Button
      variant="glass"
      size="sm"
      onClick={onClick}
      className={[
        'h-auto min-h-9 whitespace-normal rounded-full px-4 py-2 text-left text-[13px] leading-snug',
        'hover:border-cyber-lime/20 hover:bg-cyber-lime/[0.06] hover:text-white',
        'animate-fade-up',
      ].join(' ')}
      style={{ animationDelay: `${150 + index * 60}ms` }}
    >
      <Sparkles className="mr-1.5 inline h-3 w-3 shrink-0 text-cyber-lime/60" />
      {label}
    </Button>
  );
}
