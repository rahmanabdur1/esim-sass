'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar';
import { Button } from '@/components/atoms/Button';
import { Skeleton, Badge } from '@/components/atoms/index';
import { usePaymentMethods } from '@/hooks';
// import { usePaymentMethods, useRemovePaymentMethod } from '@/hooks';
import { userService } from '@/services/user.service';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants';
import { CreditCard, Plus, Trash2, Star, Shield } from 'lucide-react';

const CARD_BRAND_COLORS: Record<string, string> = {
  visa: 'bg-blue-600',
  mastercard: 'bg-red-500',
  amex: 'bg-green-600',
  discover: 'bg-orange-500',
};

export default function PaymentMethodsPage() {
  const { data: methods, isLoading } = usePaymentMethods();
  const queryClient = useQueryClient();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [settingDefault, setSettingDefault] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this payment method?')) return;
    setDeleting(id);
    try {
      await userService.deletePaymentMethod(id);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PAYMENT_METHODS });
    } finally {
      setDeleting(null);
    }
  };

  const handleSetDefault = async (id: string) => {
    setSettingDefault(id);
    try {
      await userService.setDefaultPaymentMethod(id);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PAYMENT_METHODS });
    } finally {
      setSettingDefault(null);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar />
      <main id="main-content" className="max-w-3xl flex-1 overflow-y-auto p-6 md:p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold">Payment Methods</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your saved cards and wallets
            </p>
          </div>
          <Button variant="gradient" leftIcon={<Plus className="h-4 w-4" />}>
            Add New Card
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        ) : !methods?.length ? (
          <div className="rounded-xl border-2 border-dashed bg-card p-12 text-center">
            <CreditCard
              className="mx-auto mb-3 h-12 w-12 text-muted-foreground"
              aria-hidden="true"
            />
            <p className="mb-1 font-semibold">No payment methods</p>
            <p className="mb-4 text-sm text-muted-foreground">
              Add a card to make purchases faster.
            </p>
            <Button variant="gradient" leftIcon={<Plus className="h-4 w-4" />}>
              Add Your First Card
            </Button>
          </div>
        ) : (
          <ul className="space-y-4" aria-label="Saved payment methods">
            <AnimatePresence>
              {methods.map((pm) => {
                const brandColor =
                  CARD_BRAND_COLORS[pm.brand?.toLowerCase() ?? ''] ?? 'bg-gray-600';
                return (
                  <motion.li
                    key={pm.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`rounded-xl border bg-card p-5 transition-all ${pm.isDefault ? 'border-primary ring-1 ring-primary' : ''}`}
                    aria-label={`${pm.brand} card ending in ${pm.last4}${pm.isDefault ? ', default' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Card icon */}
                        <div
                          className={`flex h-12 w-16 items-center justify-center rounded-lg ${brandColor} text-xs font-bold uppercase text-white shadow-sm`}
                        >
                          {pm.brand ?? 'Card'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold">•••• •••• •••• {pm.last4}</p>
                            {pm.isDefault && (
                              <Badge className="flex items-center gap-1 border-0 bg-primary/10 text-xs text-primary">
                                <Star className="h-2.5 w-2.5" aria-hidden="true" /> Default
                              </Badge>
                            )}
                          </div>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            Expires {String(pm.expiryMonth).padStart(2, '0')}/{pm.expiryYear}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!pm.isDefault && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSetDefault(pm.id)}
                            isLoading={settingDefault === pm.id}
                            aria-label="Set as default"
                          >
                            Set Default
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(pm.id)}
                          isLoading={deleting === pm.id}
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          aria-label={`Remove card ending in ${pm.last4}`}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      </div>
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        )}

        {/* Security note */}
        <div className="mt-6 flex items-start gap-3 rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
          <Shield className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" aria-hidden="true" />
          <p>
            Your payment details are encrypted and stored securely. We never store full card numbers
            and comply with PCI-DSS standards.
          </p>
        </div>
      </main>
    </div>
  );
}
