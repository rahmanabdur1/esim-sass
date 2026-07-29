'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar';
import { Button } from '@/components/atoms/Button';
import { Badge, Skeleton } from '@/components/atoms/index';
import { useSupportTickets } from '@/hooks';
import { userService } from '@/services/user.service';
import { useQueryClient } from '@tanstack/react-query';
import { supportTicketSchema, type SupportTicketFormValues } from '@/lib/validations';
// import { QUERY_KEYS, TICKET_STATUS_CONFIG } from '@/constants';
import { QUERY_KEYS } from '@/constants';
import { formatRelativeDate } from '@/utils';
import { Headphones, Plus, X } from 'lucide-react';
import {
  TicketAttachmentUpload,
  type TicketAttachment,
} from '@/features/support/TicketAttachmentUpload';
import { LiveChatWidget } from '@/features/support/LiveChatWidget';
import Link from 'next/link';
import { ROUTES } from '@/constants';

const TICKET_STATUS_CONFIG_LOCAL = {
  open: { label: 'Open', color: 'text-blue-600', bg: 'bg-blue-50' },
  in_progress: { label: 'In Progress', color: 'text-yellow-600', bg: 'bg-yellow-50' },
  resolved: { label: 'Resolved', color: 'text-green-600', bg: 'bg-green-50' },
  closed: { label: 'Closed', color: 'text-gray-600', bg: 'bg-gray-50' },
};

export default function SupportPage() {
  const { data, isLoading } = useSupportTickets();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [attachments, setAttachments] = useState<TicketAttachment[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SupportTicketFormValues>({
    resolver: zodResolver(supportTicketSchema),
    defaultValues: { priority: 'medium' },
  });

  const onSubmit = async (data: SupportTicketFormValues) => {
    setSubmitting(true);
    try {
      await userService.createSupportTicket(data);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SUPPORT_TICKETS });
      setSuccess(true);
      reset();
      setAttachments([]);
      setTimeout(() => {
        setShowForm(false);
        setSuccess(false);
      }, 2000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar />
      <main id="main-content" className="max-w-4xl flex-1 overflow-y-auto p-6 md:p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold">Support</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Get help from our team ·{' '}
              <Link href={ROUTES.KNOWLEDGE_BASE} className="text-primary hover:underline">
                Browse Knowledge Base
              </Link>
            </p>
          </div>
          <Button
            variant="gradient"
            onClick={() => setShowForm(true)}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            New Ticket
          </Button>
        </div>

        {/* New Ticket Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-xl border bg-card p-6"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-semibold">Create Support Ticket</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Close form"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            {success && (
              <div
                role="status"
                className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700"
              >
                ✅ Ticket submitted! We'll respond within 24 hours.
              </div>
            )}
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
              <div>
                <label htmlFor="subject" className="mb-1.5 block text-sm font-medium">
                  Subject{' '}
                  <span className="text-destructive" aria-hidden="true">
                    *
                  </span>
                </label>
                <input
                  id="subject"
                  type="text"
                  aria-required="true"
                  aria-invalid={!!errors.subject}
                  placeholder="Brief description of your issue"
                  className="flex h-10 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  {...register('subject')}
                />
                {errors.subject && (
                  <p role="alert" className="mt-1 text-xs text-destructive">
                    {errors.subject.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="priority" className="mb-1.5 block text-sm font-medium">
                  Priority
                </label>
                <select
                  id="priority"
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  {...register('priority')}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label htmlFor="description" className="mb-1.5 block text-sm font-medium">
                  Description{' '}
                  <span className="text-destructive" aria-hidden="true">
                    *
                  </span>
                </label>
                <textarea
                  id="description"
                  rows={5}
                  aria-required="true"
                  aria-invalid={!!errors.description}
                  placeholder="Please describe your issue in detail..."
                  className="flex w-full resize-none rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  {...register('description')}
                />
                {errors.description && (
                  <p role="alert" className="mt-1 text-xs text-destructive">
                    {errors.description.message}
                  </p>
                )}
              </div>
              <TicketAttachmentUpload
                attachments={attachments}
                onChange={setAttachments}
                maxFiles={5}
              />
              <div className="flex gap-3">
                <Button type="submit" isLoading={submitting} variant="gradient">
                  Submit Ticket
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Tickets List */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : !data?.data.length ? (
          <div className="py-20 text-center">
            <Headphones
              className="mx-auto mb-3 h-12 w-12 text-muted-foreground"
              aria-hidden="true"
            />
            <p className="mb-1 font-semibold">No tickets yet</p>
            <p className="mb-4 text-sm text-muted-foreground">
              Need help? Create your first support ticket.
            </p>
            <Button variant="gradient" onClick={() => setShowForm(true)}>
              Open a Ticket
            </Button>
          </div>
        ) : (
          <ul className="space-y-3" aria-label="Support tickets">
            {data.data.map((ticket) => {
              const cfg = TICKET_STATUS_CONFIG_LOCAL[ticket.status];
              return (
                <li
                  key={ticket.id}
                  className="rounded-xl border bg-card p-5 transition-shadow hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <p className="truncate text-sm font-medium">{ticket.subject}</p>
                        <Badge className={`${cfg.bg} ${cfg.color} flex-shrink-0 border-0 text-xs`}>
                          {cfg.label}
                        </Badge>
                      </div>
                      <p className="line-clamp-2 text-xs text-muted-foreground">
                        {ticket.description}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {ticket.messages.length} message{ticket.messages.length !== 1 ? 's' : ''} ·
                        Opened {formatRelativeDate(ticket.createdAt)}
                      </p>
                    </div>
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-medium capitalize ${ticket.priority === 'urgent' ? 'bg-red-50 text-red-600' : ticket.priority === 'high' ? 'bg-orange-50 text-orange-600' : 'bg-muted text-muted-foreground'}`}
                    >
                      {ticket.priority}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>
      <LiveChatWidget />
    </div>
  );
}
