import { SignJWT } from 'jose';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockEnv } = vi.hoisted(() => ({
	mockEnv: {
		JWT_SECRET_KEY: 'test-secret-key'
	}
}));

vi.mock('$env/dynamic/private', () => ({
	env: mockEnv
}));

import { signJWT, verifyJWT } from './jwt';

describe('JWT utilities', () => {
	beforeEach(() => {
		mockEnv.JWT_SECRET_KEY = 'test-secret-key';
	});

	it('signs and verifies a token payload', async () => {
		const token = await signJWT({ sub: '12345678-1234-4234-8234-123456789abc' }, { exp: '5m' });

		const payload = await verifyJWT<{ sub: string; iat: number; exp: number }>(token);

		expect(typeof token).toBe('string');
		expect(payload.sub).toBe('12345678-1234-4234-8234-123456789abc');
		expect(payload.iat).toBeTypeOf('number');
		expect(payload.exp).toBeTypeOf('number');
	});

	it('throws when signing without a configured secret key', async () => {
		mockEnv.JWT_SECRET_KEY = '';

		await expect(
			signJWT({ sub: '12345678-1234-4234-8234-123456789abc' }, { exp: '5m' })
		).rejects.toThrow('JWT secret key is not defined in environment variables.');
	});

	it('throws when verifying without a configured secret key', async () => {
		mockEnv.JWT_SECRET_KEY = '';

		await expect(verifyJWT('not-a-real-token')).rejects.toThrow(
			'JWT secret key is not defined in environment variables.'
		);
	});

	it('throws when verifying an expired token', async () => {
		const secret = new TextEncoder().encode(mockEnv.JWT_SECRET_KEY);
		const expiredToken = await new SignJWT({ sub: 'expired-user' })
			.setProtectedHeader({ alg: 'HS256' })
			.setSubject('expired-user')
			.setIssuedAt(Math.floor(Date.now() / 1000) - 120)
			.setExpirationTime(Math.floor(Date.now() / 1000) - 60)
			.sign(secret);

		await expect(verifyJWT(expiredToken)).rejects.toThrow('Your token has expired.');
	});

	it('throws when verifying a malformed token', async () => {
		await expect(verifyJWT('malformed-token')).rejects.toThrow('Your token has expired.');
	});
});
