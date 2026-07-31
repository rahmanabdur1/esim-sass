'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { DashboardSidebar } from '@/components/organisms/DashboardSidebar';
import { Button } from '@/components/atoms/Button';
import { Spinner } from '@/components/atoms/index';
import { useCartStore } from '@/store';
import { usePaymentMethods, useCreateOrder, useApplyCoupon } from '@/hooks';
import { couponSchema, type CouponFormValues } from '@/lib/validations';
import { formatCurrency, formatDataGB, formatValidity } from '@/utils';
import { ROUTES } from '@/constants';
import { Tag, CreditCard, ShieldCheck, Wifi, Clock, CheckCircle } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { item, couponCode, discount, getFinalPrice, clearCart } = useCartStore();
  const { data: paymentMethods, isLoading: pmLoading } = usePaymentMethods();
  const { mutate: createOrder, isPending: ordering } = useCreateOrder();
  const { mutate: applyCoupon, isPending: applyingCoupon, error: couponError } = useApplyCoupon();
  const [selectedPayment, setSelectedPayment] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CouponFormValues>({
    resolver: zodResolver(couponSchema),
  });

  if (!item) {
    router.push(ROUTES.BUY_PLAN);
    return null;
  }

  const finalPrice = getFinalPrice();

  const onApplyCoupon = (data: CouponFormValues) => {
    applyCoupon({ couponCode: data.code, planId: item.planId });
  };

  const onPlaceOrder = () => {
    if (!selectedPayment) return;
    createOrder(
      {
        planId: item.planId,
        couponCode: couponCode || undefined,
        paymentMethodId: selectedPayment,
      },
      {
        onSuccess: () => {
          clearCart();
          router.push(`${ROUTES.MY_ESIMS}?purchased=true`);
        },
        onError: (err: unknown) => {
          console.error('[Checkout] Order failed:', err);
        },
      },
    );
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar />
      <main id="main-content" className="flex-1 overflow-y-auto p-6 md:p-8">
        <h1 className="mb-1 font-display text-2xl font-bold">Checkout</h1>
        <p className="mb-8 text-sm text-muted-foreground">Review your order and complete payment</p>

        <div className="grid max-w-5xl grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left — Payment */}
          <div className="space-y-6 lg:col-span-2">
            {/* Payment Methods */}
            <section aria-labelledby="payment-heading" className="rounded-xl border bg-card p-6">
              <h2 id="payment-heading" className="mb-5 flex items-center gap-2 font-semibold">
                <CreditCard className="h-4 w-4 text-primary" aria-hidden="true" /> Payment Method
              </h2>
              {pmLoading ? (
                <div className="flex justify-center py-6">
                  <Spinner />
                </div>
              ) : !paymentMethods?.length ? (
                <div className="rounded-lg border-2 border-dashed p-6 text-center">
                  <CreditCard
                    className="mx-auto mb-2 h-8 w-8 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <p className="mb-3 text-sm text-muted-foreground">No payment methods saved</p>
                  <Button variant="outline" size="sm" asChild>
                    <a href={ROUTES.PAYMENT_METHODS}>Add Payment Method</a>
                  </Button>
                </div>
              ) : (
                <fieldset>
                  <legend className="sr-only">Select a payment method</legend>
                  <div className="space-y-3">
                    {paymentMethods.map((pm) => (
                      <label
                        key={pm.id}
                        className={`flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition-all ${selectedPayment === pm.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={pm.id}
                          checked={selectedPayment === pm.id}
                          onChange={() => setSelectedPayment(pm.id)}
                          className="h-4 w-4 text-primary focus:ring-primary"
                          aria-label={`${pm.brand} ending in ${pm.last4}`}
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium capitalize">
                            {pm.brand} •••• {pm.last4}
                          </p>
                          {pm.expiryMonth && (
                            <p className="text-xs text-muted-foreground">
                              Expires {pm.expiryMonth}/{pm.expiryYear}
                            </p>
                          )}
                        </div>
                        {pm.isDefault && (
                          <span className="text-xs font-medium text-primary">Default</span>
                        )}
                      </label>
                    ))}
                  </div>
                </fieldset>
              )}
            </section>

            {/* Coupon */}
            <section aria-labelledby="coupon-heading" className="rounded-xl border bg-card p-6">
              <h2 id="coupon-heading" className="mb-4 flex items-center gap-2 font-semibold">
                <Tag className="h-4 w-4 text-primary" aria-hidden="true" /> Coupon Code
              </h2>
              {couponCode ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-3"
                >
                  <CheckCircle
                    className="h-5 w-5 flex-shrink-0 text-green-600"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      Coupon <strong>{couponCode}</strong> applied!
                    </p>
                    <p className="text-xs text-green-600">
                      You saved {formatCurrency(discount, item.currency)}
                    </p>
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit(onApplyCoupon)} noValidate className="flex gap-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Enter coupon code"
                      aria-label="Coupon code"
                      aria-invalid={!!errors.code || !!couponError}
                      className="h-10 w-full rounded-md border bg-background px-3 text-sm uppercase tracking-wider focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      {...register('code')}
                    />
                    {(errors.code || couponError) && (
                      <p role="alert" className="mt-1 text-xs text-destructive">
                        {errors.code?.message || 'Invalid or expired coupon code.'}
                      </p>
                    )}
                  </div>
                  <Button type="submit" variant="outline" isLoading={applyingCoupon}>
                    Apply
                  </Button>
                </form>
              )}
            </section>

            {/* Security note */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 flex-shrink-0 text-green-600" aria-hidden="true" />
              <span>
                Your payment is secured with 256-bit SSL encryption. We never store your card
                details.
              </span>
            </div>
          </div>

          {/* Right — Order Summary */}
          <div>
            <div className="sticky top-6 rounded-xl border bg-card p-6">
              <h2 className="mb-5 font-semibold">Order Summary</h2>

              {/* Plan details */}
              <div className="mb-5 rounded-lg bg-muted/50 p-4">
                <p className="mb-1 text-sm font-medium">{item.planName}</p>
                <p className="mb-3 text-xs text-muted-foreground">{item.countryName}</p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs">
                    <Wifi className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                    <span>{formatDataGB(item.data)} data</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Clock className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                    <span>{formatValidity(item.validity)} validity</span>
                  </div>
                </div>
              </div>

              {/* Price breakdown */}
              <dl className="mb-5 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd>{formatCurrency(item.price, item.currency)}</dd>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <dt>Discount ({couponCode})</dt>
                    <dd>−{formatCurrency(discount, item.currency)}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Tax</dt>
                  <dd>$0.00</dd>
                </div>
                <div className="mt-2 flex justify-between border-t pt-2 text-base font-bold">
                  <dt>Total</dt>
                  <dd>{formatCurrency(finalPrice, item.currency)}</dd>
                </div>
              </dl>

              <Button
                className="w-full"
                variant="gradient"
                size="lg"
                onClick={onPlaceOrder}
                isLoading={ordering}
                disabled={!selectedPayment || ordering}
                aria-label={`Place order for ${formatCurrency(finalPrice, item.currency)}`}
              >
                {ordering ? 'Processing…' : `Pay ${formatCurrency(finalPrice, item.currency)}`}
              </Button>

              <button
                onClick={() => {
                  clearCart();
                  router.push(ROUTES.BUY_PLAN);
                }}
                className="mt-3 w-full text-center text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                Cancel and go back
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
