import { env } from '$env/dynamic/private';
export function getAuthTokenFromHeader(request: Request): string | null {
	const authHeader = request.headers.get('Authorization');

	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		throw new Error('Missing or invalid Authorization header. Expected format: Bearer <token>');
	}

	// Extract token from header
	const token = authHeader.substring(7); // Remove 'Bearer ' prefix
	if (token && token.length > 0) return token;
	throw new Error('Authorization token is empty');
}

export function getAdminUserNameAndPasswordFromHeader(
	request: Request
): { username: string; password: string } | null {
	const username = request.headers.get('X-Admin-Username');
	const password = request.headers.get('X-Admin-Password');

	if (!username || !password) {
		throw new Error(
			'Missing admin credentials in headers. Expected X-Admin-Username and X-Admin-Password.'
		);
	}

	return { username, password };
}

export function checkAuthToken(token: string): boolean {
	const expectedToken = env.SEED_AUTH_TOKEN;
	if (!expectedToken) {
		console.error('SEED_AUTH_TOKEN is not configured in environment variables');
		throw new Error('Seed endpoint is not properly configured');
	}
	return token === expectedToken;
}
