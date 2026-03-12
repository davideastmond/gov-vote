import { db } from '$lib/server/db';
import { address, user, userAddress } from '$lib/server/db/schema';
import { adminAuthorizationGuard } from '$lib/server/utils/admin-authorization-guard';
import { extractValidationErrors } from '$lib/server/utils/extract-validation-errors';
import {
	batchCreateUserValidator,
	type UserEntry
} from '$lib/validators/batch-create-user.validator';
import { json } from '@sveltejs/kit';
import bcrypt from 'bcrypt';
import { and, eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

// POST request handler for creating new voter users in batch
// The request body should contain an array of voter objects.

// Authenticated users hitting this endpoint from within the web app don't need bearer token auth.
// External clients (e.g. scripts, Postman) must provide a valid bearer token in the Authorization header as well as username and password in the headers for basic auth. This is to prevent abuse of the endpoint by unauthorized parties while still allowing internal use without extra friction.
export const POST: RequestHandler = async (event) => {
	// Security layer

	try {
		await adminAuthorizationGuard(event);
	} catch (error) {
		return json(
			{
				success: false,
				error: 'Unauthorized',
				message:
					'You must be an authenticated admin user or provide valid authentication credentials to access this endpoint.',
				details: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 400 }
		);
	}
	// Validation of request body
	const requestBody: Array<UserEntry> = await event.request.json();
	try {
		batchCreateUserValidator.parse(requestBody);
	} catch (err) {
		return json(extractValidationErrors(err), { status: 400 });
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
