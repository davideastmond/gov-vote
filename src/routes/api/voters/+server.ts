import { db } from '$lib/server/db';
import { address, user, userAddress } from '$lib/server/db/schema';
import { createAuthenticatedApiHandler } from '$lib/server/utils/create-authenticated-api-handler';
import {
	batchCreateUserValidator,
	type UserEntry
} from '$lib/validators/batch-create-user.validator';
import { json } from '@sveltejs/kit';
import bcrypt from 'bcrypt';
import { and, eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = createAuthenticatedApiHandler({
	requireAuth: true,
	validator: batchCreateUserValidator,
	handler: async (requestBody: unknown, event) => {
		const insertedUserIds: string[] = [];
		const insertedAddressIds: string[] = [];
		const userEntries = requestBody as UserEntry[];

		for await (const userEntry of userEntries) {
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
	}
});
