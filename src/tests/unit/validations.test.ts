import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  contactSchema,
} from '@/lib/validations';

describe('loginSchema', () => {
  it('passes with valid data', () => {
    const result = loginSchema.safeParse({ email: 'test@example.com', password: 'password123' });
    expect(result.success).toBe(true);
  });
  it('fails with invalid email', () => {
    const result = loginSchema.safeParse({ email: 'bad', password: 'password123' });
    expect(result.success).toBe(false);
  });
  it('fails with short password', () => {
    const result = loginSchema.safeParse({ email: 'a@b.com', password: 'short' });
    expect(result.success).toBe(false);
  });
});

describe('registerSchema', () => {
  const valid = {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'MyP@ss1!',
    confirmPassword: 'MyP@ss1!',
  };
  it('passes with valid data', () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });
  it('fails when passwords do not match', () => {
    expect(registerSchema.safeParse({ ...valid, confirmPassword: 'different' }).success).toBe(
      false,
    );
  });
  it('fails with weak password', () => {
    expect(
      registerSchema.safeParse({ ...valid, password: 'weakpass', confirmPassword: 'weakpass' })
        .success,
    ).toBe(false);
  });
});

describe('forgotPasswordSchema', () => {
  it('passes with valid email', () => {
    expect(forgotPasswordSchema.safeParse({ email: 'x@y.com' }).success).toBe(true);
  });
  it('fails with invalid email', () => {
    expect(forgotPasswordSchema.safeParse({ email: 'notvalid' }).success).toBe(false);
  });
});

describe('contactSchema', () => {
  const valid = {
    name: 'Jo',
    email: 'a@b.com',
    subject: 'Hello there',
    message: 'This is a test message that is long enough.',
  };
  it('passes with valid data', () => {
    expect(contactSchema.safeParse(valid).success).toBe(true);
  });
  it('fails with short message', () => {
    expect(contactSchema.safeParse({ ...valid, message: 'short' }).success).toBe(false);
  });
});
