'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Avatar, Badge } from '@/components/atoms/index';
import { cn } from '@/utils';
import type { User } from '@/types';

interface UserCardProps {
  user: User;
  className?: string;
  compact?: boolean;
}

export function UserCard({ user, className, compact = false }: UserCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={cn('flex items-center gap-3 rounded-xl border bg-card p-4', className)}
    >
      <Avatar src={user.avatar} alt={user.name} name={user.name} size={compact ? 'sm' : 'md'} />
      {!compact && (
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{user.name}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </div>
      )}
      {!compact && (
        <Badge
          variant={user.emailVerified ? 'success' : 'warning'}
          className="flex-shrink-0 text-xs"
        >
          {user.emailVerified ? 'Verified' : 'Unverified'}
        </Badge>
      )}
    </motion.div>
  );
}
