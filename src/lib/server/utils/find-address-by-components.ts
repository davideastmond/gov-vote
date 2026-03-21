import type { AddressInput } from '$lib/definitions/address';
import { db } from '$lib/server/db';

export async function findAddressByComponents({
	streetAddress,
	city,
	state,
	zipCode
}: AddressInput) {
	return db.query.address.findFirst({
		where: (addr, { and, eq }) =>
			and(
				eq(addr.streetAddress, streetAddress),
				eq(addr.city, city),
				eq(addr.state, state),
				eq(addr.zipCode, zipCode)
			)
	});
}
