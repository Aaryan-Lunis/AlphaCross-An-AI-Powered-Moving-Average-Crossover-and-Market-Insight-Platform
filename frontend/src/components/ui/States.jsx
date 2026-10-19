import React from 'react';
import { AlertTriangle, Inbox } from 'lucide-react';
import Button from './Button';

export const EmptyState = ({ icon: Icon = Inbox, title, description, action, className = '' }) => (
  <div className={`flex flex-col items-center justify-center px-6 py-12 text-center ${className}`}>
    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-elevated text-ink-3">
      <Icon className="h-5 w-5" aria-hidden="true" />
    </div>
    <p className="text-body font-medium text-ink">{title}</p>
    {description && <p className="mt-1 max-w-sm text-ui text-ink-2">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export const ErrorState = ({ title = 'Something went wrong', message, onRetry, className = '', compact = false }) => (
  <div
    role="alert"
    className={`flex flex-col items-center justify-center text-center ${compact ? 'px-4 py-6' : 'px-6 py-12'} ${className}`}
  >
    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-neg/10 text-neg">
      <AlertTriangle className="h-5 w-5" aria-hidden="true" />
    </div>
    <p className="text-body font-medium text-ink">{title}</p>
    {message && <p className="mt-1 max-w-md text-ui text-ink-2">{message}</p>}
    {onRetry && (
      <Button className="mt-4" size="sm" onClick={onRetry}>
        Try again
      </Button>
    )}
  </div>
);
