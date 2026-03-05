export type VoterCardStatus = 'generated' | 'active' | 'inactive';

export function getVoterCardFullName(firstName: string, lastName: string): string {
	return `${firstName} ${lastName}`;
}

export type AggregatedContestDetails = {
	id: string;
	title: string;
	description: string | null;
	status: 'upcoming' | 'active' | 'closed';
	contestItemId: string | null;
	contestItemTitle: string | null;
	contestItemAuxiliaryText: string | null;
	contestItemType: 'candidate' | 'initiative' | 'other' | null;
};
export function getVoterCardFullAddress(
	streetAddress: string | null,
	city: string | null,
	state: string | null,
	zipCode: string | null
): string {
	if (!streetAddress || !city || !state || !zipCode) {
		return 'Address not available';
	}

	return `${streetAddress}, ${city}, ${state} ${zipCode}`;
}

export function formatVoterCardStatus(status: VoterCardStatus) {
	return status.charAt(0).toUpperCase() + status.slice(1);
}

export function getVoterCardStatusVariant(status: VoterCardStatus) {
	if (status === 'inactive') return 'destructive' as const;
	if (status === 'generated') return 'secondary' as const;
	return 'default' as const;
}
