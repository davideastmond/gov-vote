import { db } from '$lib/server/db';
import { address, user, userAddress } from '$lib/server/db/schema';
import { createAuthenticatedApiHandler } from '$lib/server/utils/create-authenticated-api-handler';
import { findAddressByComponents } from '$lib/server/utils/find-address-by-components';
import {
	batchCreateUserValidator,
	type UserEntry
} from '$lib/validators/batch-create-user.validator';
import { json } from '@sveltejs/kit';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = createAuthenticatedApiHandler({
	requireAuth: true,
	validator: batchCreateUserValidator,
	handler: async (requestBody: unknown, event) => {
		const insertedUserIds: string[] = [];
		const insertedAddressIds: string[] = [];
		const userEntries = requestBody as UserEntry[];

		for (const userEntry of userEntries) {
			const foundAddress = await findAddressByComponents({
				streetAddress: userEntry.streetAddress,
				city: userEntry.city,
				state: userEntry.state,
				zipCode: userEntry.zipCode
			});

			if (!foundAddress) {
				const { addressId, userId } = await insertAllNewData(userEntry);
				insertedAddressIds.push(addressId);
				insertedUserIds.push(userId);
				continue;
			}

			const existingUserAddress = await db
				.select({ userId: userAddress.userId })
				.from(userAddress)
				.where(eq(userAddress.addressId, foundAddress.id))
				.limit(1);

			if (existingUserAddress.length === 0) {
				const userId = await insertUser(userEntry);
				await insertUserAddress(userId, foundAddress.id);
				insertedUserIds.push(userId);
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
	}
});

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

async function insertAllNewData(
	userEntry: UserEntry
): Promise<{ addressId: string; userId: string }> {
	const addressId = await insertAddress(userEntry);
	const userId = await insertUser(userEntry);
	await insertUserAddress(userId, addressId);
	return { addressId, userId };
}
