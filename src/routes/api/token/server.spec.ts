import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockDb, mockSignJWT, mockVerifyJWT, mockInnerJoin, mockCookiesGet, mockCookiesSet } =
	vi.hoisted(() => {
		const mockInnerJoin = vi.fn();
		const mockWhere = vi.fn(() => ({ innerJoin: mockInnerJoin }));
		const mockFrom = vi.fn(() => ({ where: mockWhere }));
		const mockSelect = vi.fn(() => ({ from: mockFrom }));

		return {
			mockDb: {
				select: mockSelect
			},
			mockSignJWT: vi.fn(),
			mockVerifyJWT: vi.fn(),
			mockInnerJoin,
			mockCookiesGet: vi.fn(),
			mockCookiesSet: vi.fn()
		};
	});

vi.mock('$env/dynamic/private', () => ({
	env: {
		JWT_EXPIRES_IN: '20'
	}
}));

vi.mock('$lib/server/db', () => ({
	db: mockDb
}));

vi.mock('$lib/server/utils/jwt/jwt', () => ({
	signJWT: mockSignJWT,
	verifyJWT: mockVerifyJWT
}));

vi.mock('drizzle-orm', () => ({
	and: (...args: unknown[]) => ({ type: 'and', args }),
	eq: (...args: unknown[]) => ({ type: 'eq', args }),
	or: (...args: unknown[]) => ({ type: 'or', args })
}));

import { POST } from './+server';

describe('/api/token POST', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockCookiesGet.mockReturnValue(undefined);

		// The endpoint chains 4 innerJoin calls. Return a promise on the final one.
		mockInnerJoin.mockReset();
		mockInnerJoin.mockReturnValueOnce({ innerJoin: mockInnerJoin });
		mockInnerJoin.mockReturnValueOnce({ innerJoin: mockInnerJoin });
		mockInnerJoin.mockReturnValueOnce({ innerJoin: mockInnerJoin });
		mockInnerJoin.mockResolvedValueOnce([]);
	});

	it('returns 400 when request payload is invalid', async () => {
		const request = new Request('http://localhost/api/token', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({})
		});

		const response = await POST({
			request,
			cookies: { get: mockCookiesGet, set: mockCookiesSet }
		} as never);
		const body = await response.json();

		expect(response.status).toBe(400);
		expect(body.success).toBe(false);
		expect(body.error).toBe('Bad Request');
		expect(body.message).toBe('Invalid request data');
	});

	it('returns 403 when voter is not eligible', async () => {
		const request = new Request('http://localhost/api/token', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ voterCardCode: '11111111-1111-4111-8111-111111111111' })
		});

		const response = await POST({
			request,
			cookies: { get: mockCookiesGet, set: mockCookiesSet }
		} as never);
		const body = await response.json();

		expect(response.status).toBe(403);
		expect(body).toEqual({ success: false, message: 'Request denied' });
		expect(mockSignJWT).not.toHaveBeenCalled();
		expect(mockCookiesSet).not.toHaveBeenCalled();
	});

	it('returns 200 when existing voter token is still valid', async () => {
		mockInnerJoin.mockReset();
		mockInnerJoin.mockReturnValueOnce({ innerJoin: mockInnerJoin });
		mockInnerJoin.mockReturnValueOnce({ innerJoin: mockInnerJoin });
		mockInnerJoin.mockReturnValueOnce({ innerJoin: mockInnerJoin });
		mockInnerJoin.mockResolvedValueOnce([{ ok: true }]);

		mockCookiesGet.mockReturnValue('existing-token');
		mockVerifyJWT.mockResolvedValue({ exp: Math.floor(Date.now() / 1000) + 300 });

		const request = new Request('http://localhost/api/token', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ voterCardCode: '22222222-2222-4222-8222-222222222222' })
		});

		const response = await POST({
			request,
			cookies: { get: mockCookiesGet, set: mockCookiesSet }
		} as never);
		const body = await response.json();

		expect(response.status).toBe(200);
		expect(body).toEqual({ success: true });
		expect(mockVerifyJWT).toHaveBeenCalledWith('existing-token');
		expect(mockSignJWT).not.toHaveBeenCalled();
		expect(mockCookiesSet).not.toHaveBeenCalled();
	});

	it('signs a token and sets voter_token cookie when eligible and no valid token exists', async () => {
		mockInnerJoin.mockReset();
		mockInnerJoin.mockReturnValueOnce({ innerJoin: mockInnerJoin });
		mockInnerJoin.mockReturnValueOnce({ innerJoin: mockInnerJoin });
		mockInnerJoin.mockReturnValueOnce({ innerJoin: mockInnerJoin });
		mockInnerJoin.mockResolvedValueOnce([{ ok: true }]);

		mockSignJWT.mockResolvedValue('new-jwt-token');

		const request = new Request('http://localhost/api/token', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ voterCardCode: '33333333-3333-4333-8333-333333333333' })
		});

		const response = await POST({
			request,
			cookies: { get: mockCookiesGet, set: mockCookiesSet }
		} as never);
		const body = await response.json();

		expect(response.status).toBe(200);
		expect(body).toEqual({ success: true, message: 'Token generated successfully' });
		expect(mockSignJWT).toHaveBeenCalledWith(
			{ sub: '33333333-3333-4333-8333-333333333333' },
			{ exp: '20m' }
		);
		expect(mockCookiesSet).toHaveBeenCalledWith(
			'voter_token',
			'new-jwt-token',
			expect.objectContaining({
				httpOnly: true,
				path: '/',
				maxAge: 1200
			})
		);
	});
});
