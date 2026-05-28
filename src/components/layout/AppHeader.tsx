import { Menu, Plus, Sparkles } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { Button } from '../ui/Button';

export function AppHeader() {
  const { clearChat, hasStarted } = useChat();

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-obsidian/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Button size="icon" variant="ghost" className="md:hidden" aria-label="Menu">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-electric-violet/30 to-cyber-lime/20 ring-1 ring-white/10">
              <Sparkles className="h-4 w-4 text-cyber-lime" />
              <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-cyber-lime ring-2 ring-obsidian" />
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight text-white">
                HK DineAgent
              </h1>
              <p className="text-[10px] text-white/35">Culinary Concierge</p>
            </div>
          </div>
        </div>

        {hasStarted && (
          <Button
            size="sm"
            variant="ghost"
            onClick={clearChat}
            className="rounded-full text-white/50"
          >
            <Plus className="h-3.5 w-3.5 rotate-45" />
            <span className="hidden sm:inline">New chat</span>
          </Button>
        )}
      </div>
    </header>
  );
}
