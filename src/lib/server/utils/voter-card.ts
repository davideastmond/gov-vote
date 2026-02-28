import type { VoterCardStatus } from '$lib/utils/voter-card';

type VoterCardBaseFields = {
	id: string;
	cardNumber: string;
	status: VoterCardStatus;
	firstName: string;
	lastName: string;
	streetAddress: string | null;
	city: string | null;
	state: string | null;
	zipCode: string | null;
	contestGroupName: string;
};

export type VoterCardListRow = VoterCardBaseFields & {
	createdAt: Date;
};

export type VoterCardDetailRow = VoterCardBaseFields & {
	contestGroupId: string;
	createdAt: Date;
	updatedAt: Date;
};

export type VoterCardListItem = VoterCardListRow;

export type VoterCardDetail = VoterCardDetailRow;

export function normalizeVoterCardListRows(rows: VoterCardListRow[]): VoterCardListItem[] {
	const voterCardsById = new Map<string, VoterCardListItem>();

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

export function normalizeVoterCardDetailRows(rows: VoterCardDetailRow[]): VoterCardDetail | null {
	if (!rows.length) return null;

	const details: VoterCardDetail = { ...rows[0] };

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
