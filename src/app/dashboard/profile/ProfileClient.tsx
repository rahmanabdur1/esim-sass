'use client';
import React, { useState } from 'react';
import { useActionState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle, User2 } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { Avatar } from '@/components/atoms/index';
import { updateProfileAction } from '@/lib/server/actions';
import { useCurrentUser, useUpdateProfile } from '@/hooks';
import type { User } from '@/types';
import { profileSchema, type ProfileFormValues } from '@/lib/validations';

interface Props { initialUser: User | null }

export function ProfileClient({ initialUser }: Props) {
  const { data } = useCurrentUser();
  const user = data ?? initialUser;
  const [saved, setSaved] = useState(false);

  const { mutate: update, isPending } = useUpdateProfile();

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? '', email: user?.email ?? '', phone: user?.phone ?? '' },
  });

  const onSubmit = (data: ProfileFormValues) => {
    update(data, {
      onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 3000); },
    });
  };

  return (
    <div className="max-w-xl">
      {/* Avatar */}
      <div className="flex items-center gap-4 mb-8 p-5 rounded-xl border bg-card">
        <Avatar name={user?.name ?? 'User'} size="lg" alt={user?.name ?? 'User'} />
        <div>
          <p className="font-semibold">{user?.name}</p>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>
      </div>

      {saved && (
        <div role="status" className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-700">
          <CheckCircle className="h-4 w-4" /> Profile updated successfully!
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} aria-label="Profile form" className="space-y-5">
        <div>
          <label htmlFor="profile-name" className="block text-sm font-medium mb-1.5">Full Name</label>
          <input id="profile-name" type="text" autoComplete="name"
            aria-invalid={!!errors.name} aria-describedby={errors.name ? 'name-error' : undefined}
            className="h-10 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            {...register('name')} />
          {errors.name && <p id="name-error" role="alert" className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div>
          <label htmlFor="profile-email" className="block text-sm font-medium mb-1.5">Email Address</label>
          <input id="profile-email" type="email" autoComplete="email"
            aria-invalid={!!errors.email} aria-describedby={errors.email ? 'email-error' : undefined}
            className="h-10 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            {...register('email')} />
          {errors.email && <p id="email-error" role="alert" className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="profile-phone" className="block text-sm font-medium mb-1.5">Phone Number <span className="text-muted-foreground font-normal">(optional)</span></label>
          <input id="profile-phone" type="tel" autoComplete="tel"
            className="h-10 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            {...register('phone')} />
        </div>

        <Button type="submit" variant="gradient" isLoading={isPending} className="h-11">
          {isPending ? 'Saving…' : 'Save Changes'}
        </Button>
      </form>
    </div>
  );
}
