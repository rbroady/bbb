'use client';
import { ButtonHTMLAttributes, forwardRef } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variantStyles: Record<Variant, string> = {
  primary: 'bg-accent text-text-inverse hover:bg-accent-hover active:bg-accent-ink',
  secondary: 'bg-bg-surface border border-border-default text-text-primary hover:bg-bg-hover active:bg-bg-active',
  ghost: 'text-text-secondary hover:text-text-primary hover:bg-bg-hover active:bg-bg-active',
  danger: 'bg-negative-soft text-negative hover:bg-negative/20',
};

const sizeStyles: Record<Size, string> = {
  sm: 'text-[12px] px-3 py-1.5 h-7 rounded-md',
  md: 'text-[13px] px-4 py-2 h-8 rounded-lg',
  lg: 'text-[14px] px-5 py-2.5 h-10 rounded-lg',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'secondary', size = 'md', loading, className = '', children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          inline-flex items-center justify-center gap-1.5 font-medium
          transition-colors duration-100
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${className}
        `}
        {...props}
      >
        {loading ? (
          <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
