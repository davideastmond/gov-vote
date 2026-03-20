import { db } from '$lib/server/db';
import { address, contestGroup, user, userAddress, voterIdPhoto } from '$lib/server/db/schema';
import { findAddressByComponents } from '$lib/server/utils/find-address-by-components';
import { requireAdminSession } from '$lib/server/utils/require-admin-session';
import { error, fail } from '@sveltejs/kit';
import { and, desc, eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

function getString(formData: FormData, field: string) {
	return String(formData.get(field) ?? '').trim();
}

export const load: PageServerLoad = async ({ params, locals }) => {
	await requireAdminSession(locals);

	const rows = await db
		.select({
			id: user.id,
			firstName: user.firstName,
			lastName: user.lastName,
			username: user.username,
			email: user.email,
			streetAddress: address.streetAddress,
			city: address.city,
			state: address.state,
			zipCode: address.zipCode,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
			addressId: address.id,
			userAddressId: userAddress.id
		})
		.from(user)
		.leftJoin(userAddress, eq(userAddress.userId, user.id))
		.leftJoin(address, eq(address.id, userAddress.addressId))
		.where(and(eq(user.id, params.userId), eq(user.role, 'voter')));

	if (!rows.length) {
		throw error(404, 'Voter not found');
	}

	const voter = rows.find((row) => row.streetAddress) ?? rows[0];

	const voterIdPhotos = await db
		.select({
			id: voterIdPhoto.id,
			contestGroupId: voterIdPhoto.contestGroupId,
			contestGroupTitle: contestGroup.title,
			photoUrl: voterIdPhoto.photoUrl,
			uploadedAt: voterIdPhoto.updatedAt
		})
		.from(voterIdPhoto)
		.innerJoin(contestGroup, eq(contestGroup.id, voterIdPhoto.contestGroupId))
		.where(eq(voterIdPhoto.userId, params.userId))
		.orderBy(desc(voterIdPhoto.updatedAt));

	const voterIdPhotosWithProxyUrl = voterIdPhotos.map((photo) => ({
		...photo,
		photoProxyUrl: `/api/admin/voter-id-photo/${photo.id}`
	}));

	return {
		voter,
		voterIdPhotos: voterIdPhotosWithProxyUrl
	};
};

export const actions: Actions = {
	updateVoter: async ({ request, params, locals }) => {
		await requireAdminSession(locals);

		const formData = await request.formData();
		const firstName = getString(formData, 'firstName');
		const lastName = getString(formData, 'lastName');
		const streetAddress = getString(formData, 'streetAddress');
		const city = getString(formData, 'city');
		const state = getString(formData, 'state');
		const zipCode = getString(formData, 'zipCode');

		if (!firstName || !lastName || !streetAddress || !city || !state || !zipCode) {
			return fail(400, {
				action: 'updateVoter',
				success: false,
				message: 'First name, last name, and full address are required.'
			});
		}

		const foundVoter = await db.query.user.findFirst({
			where: (u, { and, eq }) => and(eq(u.id, params.userId), eq(u.role, 'voter'))
		});

		if (!foundVoter) {
			throw error(404, 'Voter not found');
		}

		await db
			.update(user)
			.set({
				firstName,
				lastName,
				updatedAt: new Date()
			})
			.where(eq(user.id, params.userId));

		const foundUserAddress = await db.query.userAddress.findFirst({
			where: (ua, { eq }) => eq(ua.userId, params.userId)
		});

		const matchingAddress = await findAddressByComponents({
			streetAddress,
			city,
			state,
			zipCode
		});

		let nextAddressId = matchingAddress?.id;

		if (!nextAddressId) {
			nextAddressId = crypto.randomUUID();
			await db.insert(address).values({
				id: nextAddressId,
				streetAddress,
				city,
				state,
				zipCode
			});
		}

		if (foundUserAddress) {
			if (foundUserAddress.addressId !== nextAddressId) {
				await db
					.update(userAddress)
					.set({
						addressId: nextAddressId,
						updatedAt: new Date()
					})
					.where(eq(userAddress.id, foundUserAddress.id));
			}
		} else {
			await db.insert(userAddress).values({
				id: crypto.randomUUID(),
				userId: params.userId,
				addressId: nextAddressId
			});
		}

		return {
			action: 'updateVoter',
			success: true,
			message: 'Voter details updated.'
		};
	}
};
