/**
 * RENDERING STRATEGY REFERENCE
 * =============================
 * Strategy     | Pages                   | Config
 * -------------|-------------------------|---------------------------
 * SSG          | /about, /faq, /terms    | dynamic = 'force-static'
 * ISR          | /plans, /countries      | revalidate = 300
 * SSR          | /dashboard/*            | dynamic = 'force-dynamic'
 * Streaming    | Dashboard home          | React Suspense boundaries
 * Edge SSR     | /api/* route handlers   | runtime = 'edge'
 */
export {};
