import { db } from '$lib/server/db';
import { address, user, userAddress } from '$lib/server/db/schema';
import {
	checkAuthToken,
	getAdminUserNameAndPasswordFromHeader,
	getAuthTokenFromHeader
} from '$lib/server/utils/header-request';
import {
	batchCreateUserValidator,
	type UserEntry
} from '$lib/validators/batch-create-user.validator';
import { json } from '@sveltejs/kit';
import bcrypt from 'bcrypt';
import { and, eq } from 'drizzle-orm';
import z from 'zod';
import type { RequestHandler } from './$types';

// POST request handler for creating new voter users in batch
// The request body should contain an array of voter objects.

// Authenticated users hitting this endpoint from within the web app don't need bearer token auth.
// External clients (e.g. scripts, Postman) must provide a valid bearer token in the Authorization header as well as username and password in the headers for basic auth. This is to prevent abuse of the endpoint by unauthorized parties while still allowing internal use without extra friction.
export const POST: RequestHandler = async (event) => {
	// Security layer
	try {
		const session = await event.locals.auth();

		if (session?.user) {
			if (!['admin', 'super_admin'].includes(session.user.role)) {
				return json(
					{
						success: false,
						error: 'Forbidden',
						message: 'You do not have permission to access this resource.'
					},
					{ status: 403 }
				);
			}
		} else {
			// Require credentials in the request headers for external clients
			const bearerToken = getAuthTokenFromHeader(event.request);
			if (!checkAuthToken(bearerToken as string)) {
				// Return an error response if the token is invalid
				return json(
					{
						success: false,
						error: 'Forbidden',
						message: 'Invalid authentication token'
					},
					{ status: 403 }
				);
			}

			// Extract username and password from headers
			const data = getAdminUserNameAndPasswordFromHeader(event.request);
			if (!data) {
				return json(
					{
						success: false,
						error: 'Unauthorized',
						message:
							'Missing admin credentials in headers. Expected X-Admin-Username and X-Admin-Password.'
					},
					{ status: 401 }
				);
			}
			const { username, password } = data;

			const adminUser = await db.query.user.findFirst({
				where: (users, { eq }) => eq(users.username, username)
			});
			if (!adminUser) {
				return json(
					{
						success: false,
						error: 'Unauthorized',
						message: 'Admin user not found with the provided username.'
					},
					{ status: 401 }
				);
			}
			// check password
			if (!bcrypt.compareSync(password, adminUser.hashedPassword)) {
				return json(
					{
						success: false,
						error: 'Unauthorized',
						message: 'Invalid credentials.'
					},
					{ status: 401 }
				);
			}
		}
	} catch (err) {
		console.error('Error processing batch create voters request:', err);
		return (
			json({
				success: false,
				error: 'Internal Server Error: ' + (err instanceof Error ? err.message : 'Unknown error'),
				message: 'An error occurred while processing the request.'
			}),
			{ status: 500, headers: { 'Content-Type': 'application/json' } }
		);
	}

	// Validation of request body
	const requestBody: Array<UserEntry> = await event.request.json();
	try {
		batchCreateUserValidator.parse(requestBody);
	} catch (err) {
		if (err instanceof z.ZodError) {
			const errors = err.issues.map((issue) => {
				const path = issue.path.join('.');
				return `${path || 'Root'}: ${issue.message}`;
			});
			return json(
				{
					success: false,
					error: 'Bad Request',
					message: 'Invalid request data',
					details: errors
				},
				{ status: 400 }
			);
		}
	}

	try {
		const insertedUserIds: string[] = [];
		const insertedAddressIds: string[] = [];
		for await (const userEntry of requestBody) {
			const userAddressData = await db
				.select()
				.from(address)
				.where(
					and(
						eq(address.streetAddress, userEntry.streetAddress),
						eq(address.city, userEntry.city),
						eq(address.state, userEntry.state),
						eq(address.zipCode, userEntry.zipCode)
					)
				)
				.leftJoin(userAddress, eq(address.id, userAddress.addressId))
				.leftJoin(user, eq(userAddress.userId, user.id));

			if (userAddressData.length === 0) {
				const { addressId, userId } = await insertAllNewData(userEntry);
				insertedAddressIds.push(addressId);
				insertedUserIds.push(userId);
			} else {
				// Address but no user - create user and link to existing address
				if (userAddressData[0].address && !userAddressData[0].user) {
					const userId = await insertUser(userEntry);
					await insertUserAddress(userId, userAddressData[0].address.id);
					insertedUserIds.push(userId);
				}
			}
		}
		return json(
			{
				success: true,
				data: {
					insertedUserIds,
					insertedAddressIds
				}
			},
			{ status: 201 }
		);
	} catch (err) {
		console.error('Error creating voters:', err);
		return json(
			{
				success: false,
				error: 'Internal Server Error',
				message: 'An error occurred while creating voters.',
				details: err instanceof Error ? err.message : 'Unknown error'
			},
			{ status: 500 }
		);
	}
};

async function insertAddress(userEntry: UserEntry): Promise<string> {
	const addressId = crypto.randomUUID();
	await db.insert(address).values({
		id: addressId,
		streetAddress: userEntry.streetAddress,
		city: userEntry.city,
		state: userEntry.state,
		zipCode: userEntry.zipCode
	});
	return addressId;
}

async function insertUser(userEntry: UserEntry): Promise<string> {
	const userId = crypto.randomUUID();
	await db.insert(user).values({
		id: userId,
		username: crypto.randomUUID(), // Generate a unique username since it's required and must be unique, but we don't actually have the user's username in the request body
		firstName: userEntry.firstName,
		lastName: userEntry.lastName,
		email: crypto.randomUUID() + '@example.com', // Generate a unique email since it's required and must be unique, but we don't actually have the user's email in the request body
		hashedPassword: bcrypt.hashSync(crypto.randomUUID(), 10),
		role: 'voter'
	});
	return userId;
}

async function insertUserAddress(userId: string, addressId: string): Promise<void> {
	await db.insert(userAddress).values({
		id: crypto.randomUUID(),
		userId,
		addressId
	});
}

/**
 * There is no address and no user. Create both and link them.
 * @param userEntry
 */
async function insertAllNewData(
	userEntry: UserEntry
): Promise<{ addressId: string; userId: string }> {
	const addressId = await insertAddress(userEntry);
	const userId = await insertUser(userEntry);
	await insertUserAddress(userId, addressId);
	return { addressId, userId };
}
