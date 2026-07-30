import {
  escapeHtml,
  stripTags,
  sanitizeInput,
  enforceMaxLength,
  sanitizeFilename,
  validateFile,
  detectTokenTampering,
  buildStrictCSP,
  isTrustedScriptSrc,
} from '@/lib/security';

describe('escapeHtml', () => {
  it('escapes < and >', () => {
    expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
  });
  it('escapes & character', () => {
    expect(escapeHtml('Tom & Jerry')).toBe('Tom &amp; Jerry');
  });
  it('escapes quotes', () => {
    expect(escapeHtml('"hello"')).toContain('&quot;');
  });
  it('leaves plain text unchanged', () => {
    expect(escapeHtml('Hello World')).toBe('Hello World');
  });
});

describe('stripTags', () => {
  it('removes HTML tags', () => {
    expect(stripTags('<p>Hello <b>World</b></p>')).toBe('Hello World');
  });
  it('removes script tags', () => {
    expect(stripTags('<script>alert(1)</script>text')).toBe('text');
  });
  it('trims whitespace', () => {
    expect(stripTags('  hello  ')).toBe('hello');
  });
});

describe('sanitizeInput', () => {
  it('removes script tags', () => {
    expect(sanitizeInput('<script>evil()</script>safe')).toBe('safe');
  });
  it('removes event handlers', () => {
    expect(sanitizeInput('text onclick="bad()"')).not.toContain('onclick');
  });
  it('removes javascript: protocol', () => {
    expect(sanitizeInput('javascript:alert(1)')).not.toContain('javascript:');
  });
  it('leaves plain text unchanged', () => {
    expect(sanitizeInput('Hello World')).toBe('Hello World');
  });
});

describe('enforceMaxLength', () => {
  it('truncates email to 254 chars', () => {
    const long = 'a'.repeat(300) + '@b.com';
    expect(enforceMaxLength(long, 'email').length).toBe(254);
  });
  it('does not truncate short input', () => {
    expect(enforceMaxLength('hi@b.com', 'email')).toBe('hi@b.com');
  });
});

describe('sanitizeFilename', () => {
  it('replaces spaces with underscores', () => {
    expect(sanitizeFilename('my file.pdf')).toBe('my_file.pdf');
  });
  it('removes path traversal', () => {
    expect(sanitizeFilename('../etc/passwd')).not.toContain('..');
  });
  it('removes leading dots', () => {
    expect(sanitizeFilename('.hidden')).toBe('_hidden');
  });
  it('replaces special chars', () => {
    expect(sanitizeFilename('file<>name.pdf')).not.toMatch(/[<>]/);
  });
});

describe('validateFile', () => {
  const makeFile = (name: string, type: string, size: number): File =>
    new File([new ArrayBuffer(size)], name, { type });

  it('accepts valid PDF', async () => {
    const f = makeFile('doc.pdf', 'application/pdf', 50000);
    const result = await validateFile(f);
    expect(result.valid).toBe(true);
  });

  it('rejects file over size limit', async () => {
    const f = makeFile('big.pdf', 'application/pdf', 11 * 1024 * 1024);
    const result = await validateFile(f);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('limit');
  });

  it('rejects disallowed MIME type', async () => {
    const f = makeFile('script.exe', 'application/x-msdownload', 1000);
    const result = await validateFile(f);
    expect(result.valid).toBe(false);
  });

  it('rejects blocked extension', async () => {
    const f = makeFile('malware.exe', 'image/jpeg', 1000);
    const result = await validateFile(f);
    expect(result.valid).toBe(false);
  });

  it('rejects empty file', async () => {
    const f = makeFile('empty.pdf', 'application/pdf', 0);
    const result = await validateFile(f);
    expect(result.valid).toBe(false);
  });

  it('rejects double extension attack', async () => {
    const f = makeFile('image.pdf.exe', 'application/pdf', 1000);
    const result = await validateFile(f);
    expect(result.valid).toBe(false);
  });
});

describe('detectTokenTampering', () => {
  const validToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJleHAiOjk5OTk5OTk5OTl9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

  it('does not flag a valid JWT', () => {
    expect(detectTokenTampering(validToken)).toBe(false);
  });

  it('flags malformed token', () => {
    expect(detectTokenTampering('not.a.jwt.at.all')).toBe(true);
  });

  it('flags single-part token', () => {
    expect(detectTokenTampering('justonepart')).toBe(true);
  });
});

describe('isTrustedScriptSrc', () => {
  it('allows Stripe', () => {
    expect(isTrustedScriptSrc('https://js.stripe.com/v3/')).toBe(true);
  });
  it('allows Google reCAPTCHA', () => {
    expect(isTrustedScriptSrc('https://www.google.com/recaptcha/api.js')).toBe(true);
  });
  it('blocks unknown origin', () => {
    expect(isTrustedScriptSrc('https://evil.com/script.js')).toBe(false);
  });
  it('blocks data: URL', () => {
    expect(isTrustedScriptSrc('data:text/javascript,alert(1)')).toBe(false);
  });
});

describe('buildStrictCSP', () => {
  it('includes nonce in script-src', () => {
    const csp = buildStrictCSP('abc123');
    expect(csp).toContain("'nonce-abc123'");
  });
  it('includes frame-ancestors none', () => {
    const csp = buildStrictCSP('abc123');
    expect(csp).toContain("frame-ancestors 'none'");
  });
  it('includes upgrade-insecure-requests', () => {
    const csp = buildStrictCSP('abc123');
    expect(csp).toContain('upgrade-insecure-requests');
  });
  it('adds unsafe-eval in dev mode', () => {
    const csp = buildStrictCSP('abc123', true);
    expect(csp).toContain("'unsafe-eval'");
  });
  it('does not add unsafe-eval in production', () => {
    const csp = buildStrictCSP('abc123', false);
    expect(csp).not.toContain("'unsafe-eval'");
  });
});
