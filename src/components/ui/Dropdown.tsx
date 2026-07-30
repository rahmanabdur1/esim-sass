'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/utils';

export interface DropdownOption<T extends string = string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface DropdownProps<T extends string = string> {
  options: DropdownOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export function Dropdown<T extends string = string>({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  label,
  error,
  disabled = false,
  className,
}: DropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const [activeIdx, setActive] = useState(-1);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const id = label ? `dropdown-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined;
  const errorId = id ? `${id}-error` : undefined;

  const selected = options.find((o) => o.value === value);

  const close = useCallback(() => {
    setOpen(false);
    setActive(-1);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (!triggerRef.current?.parentElement?.contains(e.target as Node)) close();
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open, close]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!open) {
          setOpen(true);
          setActive(0);
        } else {
          setActive((i) => Math.min(i + 1, options.length - 1));
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (open) setActive((i) => Math.max(i - 1, 0));
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (!open) {
          setOpen(true);
        } else if (activeIdx >= 0 && activeIdx < options.length) {
          const opt = options[activeIdx];
          if (opt && !opt.disabled) {
            onChange(opt.value);
            close();
          }
        }
        break;
      case 'Escape':
        close();
        triggerRef.current?.focus();
        break;
      case 'Tab':
        close();
        break;
    }
  };

  useEffect(() => {
    if (open && activeIdx >= 0) {
      listRef.current
        ?.querySelector(`[data-idx="${activeIdx}"]`)
        ?.scrollIntoView({ block: 'nearest' });
    }
  }, [open, activeIdx]);

  return (
    <div className={cn('relative', className)}>
      {label && (
        <label id={`${id}-label`} className="mb-1.5 block text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <button
        ref={triggerRef}
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={label ? `${id}-label ${id}` : undefined}
        aria-describedby={error && errorId ? errorId : undefined}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-md border bg-background px-3 text-sm transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          disabled && 'cursor-not-allowed opacity-50',
          error && 'border-destructive focus-visible:ring-destructive',
        )}
      >
        <span
          className={cn('flex items-center gap-2 truncate', !selected && 'text-muted-foreground')}
        >
          {selected?.icon}
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform',
            open && 'rotate-180',
          )}
          aria-hidden="true"
        />
      </button>

      {error && (
        <p id={errorId} role="alert" className="mt-1 text-xs text-destructive">
          {error}
        </p>
      )}

      <AnimatePresence>
        {open && (
          <motion.ul
            ref={listRef}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            role="listbox"
            aria-labelledby={label ? `${id}-label` : undefined}
            className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover py-1 shadow-lg"
          >
            {options.map((opt, idx) => (
              /* eslint-disable-next-line jsx-a11y/click-events-have-key-events */
              <li
                key={opt.value}
                data-idx={idx}
                role="option"
                aria-selected={opt.value === value}
                aria-disabled={opt.disabled}
                onClick={() => {
                  if (!opt.disabled) {
                    onChange(opt.value);
                    close();
                  }
                }}
                onMouseEnter={() => setActive(idx)}
                className={cn(
                  'flex cursor-pointer items-center gap-2 px-3 py-2 text-sm transition-colors',
                  idx === activeIdx && 'bg-accent',
                  opt.value === value && 'font-medium text-primary',
                  opt.disabled && 'cursor-not-allowed opacity-50',
                )}
              >
                {opt.icon}
                <span className="flex-1">{opt.label}</span>
                {opt.value === value && (
                  <Check className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
                )}
              </li>
            ))}
            {options.length === 0 && (
              <li className="px-3 py-2 text-sm text-muted-foreground">No options available</li>
            )}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
