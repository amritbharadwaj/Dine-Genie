import { ChatProvider } from './context/ChatContext';
import { AppHeader } from './components/layout/AppHeader';
import { ChatCanvas } from './components/chat/ChatCanvas';

export default function App() {
  return (
    <ChatProvider>
      <div className="flex h-dvh max-h-dvh flex-col overflow-hidden">
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -left-1/4 top-1/4 h-[500px] w-[500px] animate-float rounded-full bg-electric-violet/[0.04] blur-[100px]" />
          <div
            className="absolute -right-1/4 bottom-1/4 h-[400px] w-[400px] animate-float rounded-full bg-cyber-lime/[0.03] blur-[80px]"
            style={{ animationDelay: '-3s' }}
          />
        </div>

        <AppHeader />
        <ChatCanvas />
      </div>
    </ChatProvider>
  );
}
