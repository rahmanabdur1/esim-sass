'use server';
/**
 * SERVER ACTIONS — server-side mutations with automatic CSRF protection.
 * Called from Client Components without a separate API endpoint.
 */
import { revalidateTag, revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.esimplatform.com/v1';

async function getAuthToken(): Promise<string> {
  const cookieStore = await cookies();
  return cookieStore.get('esim_access_token')?.value ?? '';
}

/** Purchase a plan */
export async function purchasePlanAction(planId: string, couponCode?: string) {
  const token = await getAuthToken();
  if (!token) throw new Error('Not authenticated');
  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ planId, couponCode }),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error((await res.json()).message ?? 'Purchase failed');
  revalidateTag('orders');
  revalidateTag('esims');
  return res.json();
}

/** Update user profile */
export async function updateProfileAction(formData: FormData) {
  const token = await getAuthToken();
  if (!token) throw new Error('Not authenticated');
  const res = await fetch(`${API_BASE}/users/me`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name: formData.get('name'), email: formData.get('email') }),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Profile update failed');
  revalidatePath('/dashboard/profile');
  return res.json();
}

/** Submit support ticket */
export async function submitTicketAction(formData: FormData) {
  const token = await getAuthToken();
  if (!token) throw new Error('Not authenticated');
  const res = await fetch(`${API_BASE}/support/tickets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      subject: formData.get('subject'),
      description: formData.get('description'),
    }),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Ticket submission failed');
  revalidatePath('/dashboard/support');
  return res.json();
}

/** On-demand cache revalidation */
export async function revalidatePlansAction() {
  revalidateTag('plans');
  revalidateTag('countries');
  return { revalidated: true, timestamp: new Date().toISOString() };
}
