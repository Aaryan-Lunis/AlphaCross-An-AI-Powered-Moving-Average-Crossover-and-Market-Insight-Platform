import React from 'react';
import { ChevronDown } from 'lucide-react';

export const Input = React.forwardRef(function Input(
  { icon: Icon, className = '', inputClassName = '', suffix, ...props },
  ref
) {
  return (
    <div className={`relative ${className}`}>
      {Icon && (
        <Icon
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3"
          aria-hidden="true"
        />
      )}
      <input
        ref={ref}
        className={`field h-9 ${Icon ? 'pl-9' : 'pl-3'} ${suffix ? 'pr-12' : 'pr-3'} ${inputClassName}`}
        {...props}
      />
      {suffix && (
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-meta text-ink-3">
          {suffix}
        </span>
      )}
    </div>
  );
});

export const Select = ({ className = '', children, ...props }) => (
  <div className={`relative ${className}`}>
    <select className="field h-9 appearance-none pl-3 pr-8" {...props}>
      {children}
    </select>
    <ChevronDown
      className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3"
      aria-hidden="true"
    />
  </div>
);

export const Field = ({ label, hint, htmlFor, children, className = '' }) => (
  <div className={className}>
    <label htmlFor={htmlFor} className="mb-1.5 block text-ui font-medium text-ink">
      {label}
    </label>
    {children}
    {hint && <p className="mt-1.5 text-meta text-ink-3">{hint}</p>}
  </div>
);
