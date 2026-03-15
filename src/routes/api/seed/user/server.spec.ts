import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
	mockInsert,
	mockValues,
	mockReturning,
	mockGetAuthTokenFromHeader,
	mockCheckAuthToken,
	mockBcryptHash
} = vi.hoisted(() => {
	const mockReturning = vi.fn();
	const mockValues = vi.fn(() => ({ returning: mockReturning }));
	const mockInsert = vi.fn(() => ({ values: mockValues }));

	return {
		mockInsert,
		mockValues,
		mockReturning,
		mockGetAuthTokenFromHeader: vi.fn(),
		mockCheckAuthToken: vi.fn(),
		mockBcryptHash: vi.fn()
	};
});

vi.mock('$lib/server/db', () => ({
	db: {
		insert: mockInsert
	}
}));

vi.mock('$lib/server/db/schema', () => ({
	user: { __table: 'user' }
}));

vi.mock('$lib/server/utils/header-request', () => ({
	getAuthTokenFromHeader: mockGetAuthTokenFromHeader,
	checkAuthToken: mockCheckAuthToken
}));

vi.mock('bcrypt', () => ({
	default: {
		hash: mockBcryptHash
	}
}));

import { POST } from './+server';

describe('/api/seed/user POST', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockGetAuthTokenFromHeader.mockReturnValue('valid-token');
		mockCheckAuthToken.mockReturnValue(true);
		mockBcryptHash.mockImplementation(async (password: string) => `hashed-${password}`);
	});

	it('returns 403 when auth token is invalid', async () => {
		mockCheckAuthToken.mockReturnValue(false);

		const request = new Request('http://localhost/api/seed/user', {
			method: 'POST',
			headers: { Authorization: 'Bearer invalid-token', 'content-type': 'application/json' },
			body: JSON.stringify([])
		});

		const response = await POST({ request } as never);
		const body = await response.json();

		expect(response.status).toBe(403);
		expect(body).toEqual({
			error: 'Forbidden',
			message: 'Invalid authentication token'
		});
		expect(mockInsert).not.toHaveBeenCalled();
	});

	it('returns 400 when request body is not valid JSON', async () => {
		const request = new Request('http://localhost/api/seed/user', {
			method: 'POST',
			headers: { Authorization: 'Bearer valid-token', 'content-type': 'application/json' },
			body: '{ invalid-json'
		});

		const response = await POST({ request } as never);
		const body = await response.json();

		expect(response.status).toBe(400);
		expect(body).toEqual({
			success: false,
			error: 'Bad Request',
			message: 'Request body must be valid JSON.'
		});
		expect(mockInsert).not.toHaveBeenCalled();
	});

	it('returns 400 for invalid payload shape when body is not an array', async () => {
		const request = new Request('http://localhost/api/seed/user', {
			method: 'POST',
			headers: { Authorization: 'Bearer valid-token', 'content-type': 'application/json' },
			body: JSON.stringify({ username: 'single-user' })
		});

		const response = await POST({ request } as never);
		const body = await response.json();

		expect(response.status).toBe(400);
		expect(body.success).toBe(false);
		expect(body.error).toBe('Bad Request');
		expect(body.message).toBe('Invalid request data');
		expect(mockInsert).not.toHaveBeenCalled();
	});

	it('creates multiple users from array payload and omits hashedPassword in response', async () => {
		const createdUsers = [
			{
				id: 'user-1',
				email: 'admin@example.com',
				username: 'admin',
				hashedPassword: 'hashed-adminpassword',
				firstName: 'Admin',
				lastName: 'User',
				role: 'admin'
			},
			{
				id: 'user-2',
				email: 'voter@example.com',
				username: 'voter1',
				hashedPassword: 'hashed-voterpassword',
				firstName: 'Jane',
				lastName: 'Voter',
				role: 'voter'
			}
		];
		mockReturning.mockResolvedValue(createdUsers);

		const request = new Request('http://localhost/api/seed/user', {
			method: 'POST',
			headers: { Authorization: 'Bearer valid-token', 'content-type': 'application/json' },
			body: JSON.stringify([
				{
					username: 'admin',
					email: 'admin@example.com',
					password: 'adminpassword',
					firstName: 'Admin',
					lastName: 'User',
					role: 'admin'
				},
				{
					username: 'voter1',
					email: 'voter@example.com',
					password: 'voterpassword',
					firstName: 'Jane',
					lastName: 'Voter',
					role: 'voter'
				}
			])
		});

		const response = await POST({ request } as never);
		const body = await response.json();

		expect(response.status).toBe(201);
		expect(body.success).toBe(true);
		expect(body.message).toBe('Successfully seeded users');
		expect(body.data.users).toEqual([
			{
				id: 'user-1',
				email: 'admin@example.com',
				username: 'admin',
				firstName: 'Admin',
				lastName: 'User',
				role: 'admin'
			},
			{
				id: 'user-2',
				email: 'voter@example.com',
				username: 'voter1',
				firstName: 'Jane',
				lastName: 'Voter',
				role: 'voter'
			}
		]);

		expect(mockBcryptHash).toHaveBeenCalledTimes(2);
		expect(mockValues).toHaveBeenCalledTimes(1);

		const valueCalls = mockValues.mock.calls as unknown[][];
		const insertValuesArg = valueCalls[0]?.[0];
		expect(insertValuesArg).toBeDefined();
		if (!Array.isArray(insertValuesArg)) {
			throw new Error('Expected values payload to be an array');
		}

		expect(insertValuesArg).toHaveLength(2);
		expect(insertValuesArg[0]).toMatchObject({
			email: 'admin@example.com',
			username: 'admin',
			hashedPassword: 'hashed-adminpassword'
		});
		expect(insertValuesArg[1]).toMatchObject({
			email: 'voter@example.com',
			username: 'voter1',
			hashedPassword: 'hashed-voterpassword'
		});
	});
});
