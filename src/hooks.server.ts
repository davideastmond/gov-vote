import { verifyJWT } from '$lib/server/utils/jwt/jwt';
import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { handle as authJjHandle } from './lib/auth/auth';

const jwtHandler: Handle = async ({ event, resolve }) => {
	const baseTokenPath = ['/api/token', '/api/voter'];

	if (!baseTokenPath.some((path) => event.url.pathname.startsWith(path))) {
		return resolve(event);
	}
	const voterToken = event.cookies.get('voter_token');

	if (voterToken) {
		await verifyJWT(voterToken as string);
	}

	// Right now the default is going to hit the /api/token endpoint and try to assign a valid token
	const response = await resolve(event);
	return response;
};

export const handle = sequence(authJjHandle, jwtHandler);
