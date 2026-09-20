import type { ComponentProps, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'inverse' | 'ghost';

const base =
  'inline-flex items-center justify-center gap-2 rounded-sm font-semibold tracking-[-0.01em] ' +
  'transition-[background-color,border-color,color,box-shadow,transform] duration-200 ' +
  'disabled:pointer-events-none disabled:opacity-40 active:translate-y-px';

const variants: Record<Variant, string> = {
  primary: 'bg-brand text-white shadow-brand hover:bg-brand-hover',
  secondary: 'border border-line-strong bg-surface text-ink hover:border-ink/25 hover:bg-sunken',
  inverse: 'bg-white text-ink hover:bg-white/90',
  ghost: 'text-muted hover:text-ink',
};

const sizes = {
  sm: 'h-10 px-4 text-sm',
  md: 'h-12 px-6 text-[0.95rem]',
  lg: 'h-14 px-7 text-base',
} as const;

type Props = {
  variant?: Variant;
  size?: keyof typeof sizes;
  children: ReactNode;
};

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...rest
}: Props & ComponentProps<'button'>) {
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...rest}>
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...rest
}: Props & ComponentProps<'a'>) {
  return (
    <a className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...rest}>
      {children}
    </a>
  );
}
