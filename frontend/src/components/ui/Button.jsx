import React from 'react';

const base =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-colors ' +
  'disabled:opacity-50 disabled:pointer-events-none';

const variants = {
  primary: 'bg-accent text-on-accent hover:bg-accent-hi',
  secondary: 'bg-card text-ink border border-line hover:bg-elevated hover:border-ink-3/50',
  ghost: 'text-ink-2 hover:text-ink hover:bg-elevated',
  subtle: 'bg-accent-soft text-accent-hi hover:bg-accent-soft/70',
};

const sizes = {
  sm: 'h-8 px-3 text-ui',
  md: 'h-9 px-3.5 text-ui',
  lg: 'h-10 px-4 text-body',
  icon: 'h-9 w-9 text-ui',
  'icon-sm': 'h-8 w-8 text-ui',
};

const Button = React.forwardRef(function Button(
  { as: Comp = 'button', variant = 'secondary', size = 'md', className = '', type, ...props },
  ref
) {
  const extra = Comp === 'button' ? { type: type || 'button' } : {};
  return (
    <Comp
      ref={ref}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...extra}
      {...props}
    />
  );
});

export default Button;
