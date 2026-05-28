import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'ghost' | 'glass' | 'lime';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-white text-obsidian hover:bg-white/90 shadow-[0_0_24px_rgb(255_255_255/0.12)]',
  ghost:
    'bg-transparent text-white/70 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10',
  glass:
    'glass-panel text-white/80 hover:text-white hover:bg-white/[0.08] hover:border-white/15',
  lime:
    'bg-cyber-lime/10 text-cyber-lime border border-cyber-lime/20 hover:bg-cyber-lime/20 hover:border-cyber-lime/40 glow-lime',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-6 text-base gap-2.5 rounded-xl',
  icon: 'h-10 w-10 p-0 rounded-xl',
};

export function Button({
  variant = 'glass',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={[
        'inline-flex items-center justify-center font-medium transition-all duration-300',
        'active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyber-lime/40 focus-visible:ring-offset-2 focus-visible:ring-offset-obsidian',
        variantStyles[variant],
        sizeStyles[size],
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  );
}
