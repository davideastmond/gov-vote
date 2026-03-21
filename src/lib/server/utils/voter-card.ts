import type { NullableAddressInput } from '$lib/definitions/address';
import type { VoterCardStatus } from '$lib/definitions/enums';

export type VoterCardBaseFields = NullableAddressInput & {
	id: string;
	cardNumber: string;
	status: VoterCardStatus;
	firstName: string;
	lastName: string;
	contestGroupName: string;
};

export type VoterCardListRow = VoterCardBaseFields & {
	createdAt: Date;
};

export type VoterCardDetailRow = VoterCardBaseFields & {
	contestGroupId: string;
	createdAt: Date;
	pollingStationName: string;
	pollingStationStreet: string;
	pollingStationCity: string;
	pollingStationState: string;
	pollingStationZip: string;
	updatedAt: Date;
};

export function normalizeVoterCardListRows(rows: VoterCardListRow[]): VoterCardListRow[] {
	const voterCardsById = new Map<string, VoterCardListRow>();

	for (const row of rows) {
		const existing = voterCardsById.get(row.id);
		if (!existing) {
			voterCardsById.set(row.id, { ...row });
			continue;
		}

		if (!existing.streetAddress && row.streetAddress) {
			existing.streetAddress = row.streetAddress;
			existing.city = row.city;
			existing.state = row.state;
			existing.zipCode = row.zipCode;
		}
	}

	return Array.from(voterCardsById.values());
}

export function normalizeVoterCardDetailRows(
	rows: VoterCardDetailRow[]
): VoterCardDetailRow | null {
	if (!rows.length) return null;

	const details: VoterCardDetailRow = { ...rows[0] };

	if (!details.streetAddress) {
		for (const row of rows) {
			if (row.streetAddress) {
				details.streetAddress = row.streetAddress;
				details.city = row.city;
				details.state = row.state;
				details.zipCode = row.zipCode;
				break;
			}
		}
	}

	return details;
}
