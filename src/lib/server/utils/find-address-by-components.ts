import { db } from '$lib/server/db';

export type AddressComponents = {
	streetAddress: string;
	city: string;
	state: string;
	zipCode: string;
};

export async function findAddressByComponents({
	streetAddress,
	city,
	state,
	zipCode
}: AddressComponents) {
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
