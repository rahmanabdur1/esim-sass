'use server';
/**
 * SERVER ACTIONS
 * ==============
 * Called directly from Client Components — no separate API endpoint needed.
 * Built-in CSRF protection by Next.js. Runs only on the server.
 * Uses revalidateTag() to bust ISR cache after mutations.
 */
import { revalidatePath, revalidateTag } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ROUTES } from '@/constants';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true' || !process.env.NEXT_PUBLIC_API_URL;
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.esimplatform.com/v1';

// ── Helper ────────────────────────────────────────────────────
async function getToken() {
  const store = await cookies();
  return store.get('esim_access_token')?.value ?? '';
}

async function apiFetch<T>(path: string, init: RequestInit): Promise<T> {
  const token = await getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init.headers ?? {}),
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error((err as { message?: string }).message ?? `Error ${res.status}`);
  }
  const data = await res.json();
  return (data.data ?? data) as T;
}

// ── AUTH ACTIONS ──────────────────────────────────────────────

/** Login — sets HttpOnly JWT cookie server-side */
export async function loginAction(
  _prevState: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  const email    = formData.get('email')    as string;
  const password = formData.get('password') as string;

  if (!email || !password) return { error: 'Email and password are required.' };
  if (!email.includes('@'))  return { error: 'Please enter a valid email address.' };
  if (password.length < 8)   return { error: 'Password must be at least 8 characters.' };

  try {
    if (USE_MOCK) {
      const valid = (email === 'demo@esimplatform.com' && password === 'Demo1234!')
        || (email.includes('@') && password.length >= 8);
      if (!valid) return { error: 'Invalid email or password.' };
      const cookieStore = await cookies();
      cookieStore.set('esim_access_token', `mock_jwt_${Date.now()}`, {
        httpOnly: true,
        secure:   process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path:     '/',
        maxAge:   60 * 60 * 24 * 30,
      });
    } else {
      const data = await apiFetch<{ token: string }>('/auth/login', {
        method: 'POST',
        body:   JSON.stringify({ email, password }),
      });
      const cookieStore = await cookies();
      cookieStore.set('esim_access_token', data.token, {
        httpOnly: true,
        secure:   process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path:     '/',
        maxAge:   60 * 60 * 24 * 30,
      });
    }
  } catch (e: unknown) {
    return { error: (e as Error).message ?? 'Login failed. Please try again.' };
  }

  redirect(ROUTES.DASHBOARD);
}

/** Register — creates account + sets cookie */
export async function registerAction(
  _prevState: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  const name            = formData.get('name')            as string;
  const email           = formData.get('email')           as string;
  const password        = formData.get('password')        as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!name || !email || !password)           return { error: 'All fields are required.' };
  if (password !== confirmPassword)            return { error: 'Passwords do not match.' };
  if (password.length < 8)                    return { error: 'Password must be at least 8 characters.' };
  if (!/[A-Z]/.test(password))               return { error: 'Password must contain an uppercase letter.' };
  if (!/[0-9]/.test(password))               return { error: 'Password must contain a number.' };

  try {
    if (USE_MOCK) {
      const cookieStore = await cookies();
      cookieStore.set('esim_access_token', `mock_jwt_${Date.now()}`, {
        httpOnly: true, secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 30,
      });
    } else {
      const data = await apiFetch<{ token: string }>('/auth/register', {
        method: 'POST',
        body:   JSON.stringify({ name, email, password }),
      });
      const cookieStore = await cookies();
      cookieStore.set('esim_access_token', data.token, {
        httpOnly: true, secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 30,
      });
    }
  } catch (e: unknown) {
    return { error: (e as Error).message ?? 'Registration failed.' };
  }

  redirect(`${ROUTES.VERIFY_EMAIL}?email=${encodeURIComponent(email)}`);
}

/** Logout — clears HttpOnly cookie */
export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set('esim_access_token', '', {
    httpOnly: true, secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', path: '/', maxAge: 0,
  });
  if (!USE_MOCK) {
    try { await apiFetch('/auth/logout', { method: 'POST' }); } catch { /* ignore */ }
  }
  redirect(ROUTES.LOGIN);
}

/** Forgot password */
export async function forgotPasswordAction(
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const email = formData.get('email') as string;
  if (!email || !email.includes('@')) return { error: 'Please enter a valid email address.' };
  if (USE_MOCK) return { success: true };
  try {
    await apiFetch('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
    return { success: true };
  } catch (e: unknown) {
    return { error: (e as Error).message };
  }
}

/** Reset password */
export async function resetPasswordAction(
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const token           = formData.get('token')           as string;
  const password        = formData.get('password')        as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (password !== confirmPassword) return { error: 'Passwords do not match.' };
  if (password.length < 8)          return { error: 'Password must be at least 8 characters.' };
  if (USE_MOCK) return { success: true };
  try {
    await apiFetch('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, password }) });
    return { success: true };
  } catch (e: unknown) {
    return { error: (e as Error).message };
  }
}

// ── PROFILE ACTIONS ───────────────────────────────────────────

/** Update profile — revalidates user cache */
export async function updateProfileAction(
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const name  = formData.get('name')  as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string | null;

  if (!name || !email) return { error: 'Name and email are required.' };
  if (!email.includes('@')) return { error: 'Please enter a valid email address.' };

  if (!USE_MOCK) {
    try {
      await apiFetch('/users/me', { method: 'PATCH', body: JSON.stringify({ name, email, phone }) });
    } catch (e: unknown) {
      return { error: (e as Error).message };
    }
  }

  revalidatePath('/dashboard/profile');
  return { success: true };
}

/** Change password */
export async function changePasswordAction(
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const currentPassword = formData.get('currentPassword') as string;
  const newPassword     = formData.get('newPassword')     as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (newPassword !== confirmPassword) return { error: 'New passwords do not match.' };
  if (newPassword.length < 8)          return { error: 'Password must be at least 8 characters.' };
  if (newPassword === currentPassword)  return { error: 'New password must differ from current password.' };

  if (!USE_MOCK) {
    try {
      await apiFetch('/users/me/password', {
        method: 'PUT',
        body:   JSON.stringify({ currentPassword, newPassword }),
      });
    } catch (e: unknown) {
      return { error: (e as Error).message ?? 'Current password is incorrect.' };
    }
  }

  revalidatePath('/dashboard/security');
  return { success: true };
}

// ── ORDER ACTIONS ─────────────────────────────────────────────

/** Purchase a plan */
export async function purchasePlanAction(
  _prevState: { error?: string; orderId?: string } | null,
  formData: FormData,
): Promise<{ error?: string; orderId?: string }> {
  const planId     = formData.get('planId')     as string;
  const couponCode = formData.get('couponCode') as string | null;

  if (!planId) return { error: 'Plan ID is required.' };

  if (USE_MOCK) {
    const orderId = `ord-${Date.now()}`;
    revalidateTag('orders');
    revalidateTag('esims');
    return { orderId };
  }

  try {
    const order = await apiFetch<{ id: string }>('/orders', {
      method: 'POST',
      body:   JSON.stringify({ planId, ...(couponCode ? { couponCode } : {}) }),
    });
    revalidateTag('orders');
    revalidateTag('esims');
    return { orderId: order.id };
  } catch (e: unknown) {
    return { error: (e as Error).message };
  }
}

/** Validate coupon code */
export async function validateCouponAction(
  code: string,
  planId: string,
): Promise<{ discount: number; type: 'percentage' | 'fixed'; error?: string }> {
  if (USE_MOCK) {
    const valid: Record<string, { discount: number; type: 'percentage' | 'fixed' }> = {
      WELCOME15: { discount: 1.35, type: 'percentage' },
      SAVE10:    { discount: 0.90, type: 'percentage' },
      FLAT5:     { discount: 5.00, type: 'fixed'      },
      NEWUSER:   { discount: 2.00, type: 'fixed'      },
    };
    const result = valid[code.toUpperCase()];
    if (!result) return { discount: 0, type: 'fixed', error: 'Invalid coupon code.' };
    return result;
  }
  try {
    return await apiFetch('/coupons/validate', {
      method: 'POST',
      body:   JSON.stringify({ couponCode: code, planId }),
    });
  } catch (e: unknown) {
    return { discount: 0, type: 'fixed', error: (e as Error).message };
  }
}

// ── SUPPORT ACTIONS ───────────────────────────────────────────

/** Submit support ticket */
export async function submitTicketAction(
  _prevState: { error?: string; success?: boolean; ticketId?: string } | null,
  formData: FormData,
): Promise<{ error?: string; success?: boolean; ticketId?: string }> {
  const subject     = formData.get('subject')     as string;
  const description = formData.get('description') as string;
  const priority    = (formData.get('priority') as string) ?? 'medium';

  if (!subject || subject.length < 5)        return { error: 'Subject must be at least 5 characters.' };
  if (!description || description.length < 20) return { error: 'Description must be at least 20 characters.' };

  if (USE_MOCK) {
    revalidatePath('/dashboard/support');
    return { success: true, ticketId: `tkt-${Date.now()}` };
  }

  try {
    const ticket = await apiFetch<{ id: string }>('/support/tickets', {
      method: 'POST',
      body:   JSON.stringify({ subject, description, priority }),
    });
    revalidatePath('/dashboard/support');
    return { success: true, ticketId: ticket.id };
  } catch (e: unknown) {
    return { error: (e as Error).message };
  }
}

// ── ACCOUNT ACTIONS ───────────────────────────────────────────

/** Delete account */
export async function deleteAccountAction(
  _prevState: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string }> {
  const confirm = formData.get('confirm') as string;
  if (confirm !== 'DELETE') return { error: 'Please type DELETE to confirm.' };

  if (!USE_MOCK) {
    try {
      await apiFetch('/user/account', { method: 'DELETE' });
    } catch (e: unknown) {
      return { error: (e as Error).message };
    }
  }

  const cookieStore = await cookies();
  cookieStore.set('esim_access_token', '', { maxAge: 0, path: '/' });
  redirect(ROUTES.HOME);
}

/** Request data export */
export async function requestDataExportAction(): Promise<{
  downloadUrl?: string;
  error?: string;
}> {
  if (USE_MOCK) return { downloadUrl: '#mock-export' };
  try {
    const result = await apiFetch<{ downloadUrl: string }>('/users/me/export', { method: 'GET' });
    return { downloadUrl: result.downloadUrl };
  } catch (e: unknown) {
    return { error: (e as Error).message };
  }
}

/** Update settings */
export async function updateSettingsAction(
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const settings = Object.fromEntries(formData.entries());
  if (!USE_MOCK) {
    try {
      await apiFetch('/user/settings', { method: 'PATCH', body: JSON.stringify(settings) });
    } catch (e: unknown) {
      return { error: (e as Error).message };
    }
  }
  revalidatePath('/dashboard/settings');
  return { success: true };
}

/** Newsletter subscribe */
export async function subscribeNewsletterAction(
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const email = formData.get('email') as string;
  if (!email || !email.includes('@')) return { error: 'Please enter a valid email.' };
  if (USE_MOCK) return { success: true };
  try {
    await apiFetch('/newsletter/subscribe', { method: 'POST', body: JSON.stringify({ email }) });
    return { success: true };
  } catch (e: unknown) {
    return { error: (e as Error).message };
  }
}

/** Contact form */
export async function contactFormAction(
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const name    = formData.get('name')    as string;
  const email   = formData.get('email')   as string;
  const subject = formData.get('subject') as string;
  const message = formData.get('message') as string;

  if (!name || !email || !subject || !message) return { error: 'All fields are required.' };
  if (!email.includes('@'))                     return { error: 'Invalid email address.' };
  if (message.length < 10)                      return { error: 'Message is too short.' };
  if (USE_MOCK) return { success: true };

  try {
    await apiFetch('/contact', { method: 'POST', body: JSON.stringify({ name, email, subject, message }) });
    return { success: true };
  } catch (e: unknown) {
    return { error: (e as Error).message };
  }
}

/** On-demand cache revalidation (admin use) */
export async function revalidateCacheAction(tag: string): Promise<void> {
  revalidateTag(tag);
}
