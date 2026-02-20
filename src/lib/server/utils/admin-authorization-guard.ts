import { db } from '$lib/server/db';
import { type RequestEvent } from '@sveltejs/kit';
import bcrypt from 'bcrypt';
import {
	checkAuthToken,
	getAdminUserNameAndPasswordFromHeader,
	getAuthTokenFromHeader
} from './header-request';

export async function adminAuthorizationGuard(event: RequestEvent) {
	const session = await event.locals.auth();

	if (session?.user) {
		if (!['admin', 'super_admin'].includes(session.user.role)) {
			throw new Error('Forbidden: You do not have permission to access this resource.');
		}
	} else {
		// Require credentials in the request headers for external clients
		const bearerToken = getAuthTokenFromHeader(event.request);
		if (!checkAuthToken(bearerToken as string)) {
			// Return an error response if the token is invalid
			throw new Error('Forbidden: Invalid authentication token');
		}

		// Extract username and password from headers
		const data = getAdminUserNameAndPasswordFromHeader(event.request);
		if (!data) {
			throw new Error(
				'Unauthorized: Missing admin credentials in headers. Expected X-Admin-Username and X-Admin-Password.'
			);
		}
		const { username, password } = data;

		const adminUser = await db.query.user.findFirst({
			where: (users, { eq }) => eq(users.username, username)
		});
		if (!adminUser) {
			throw new Error('Unauthorized: Admin user not found with the provided username.');
		}
		// check password
		if (!bcrypt.compareSync(password, adminUser.hashedPassword)) {
			throw new Error('Unauthorized: Invalid credentials.');
		}
	}
}
