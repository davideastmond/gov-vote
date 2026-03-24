import { CONTEST_ITEM_TYPE_VALUES, CONTEST_STATUS_VALUES } from '$lib/definitions/enums';
import { z } from 'zod';
import { addressValidator } from './address.validator';

export const contestGroupBasicValidator = z.object({
	id: z.uuid(),
	title: z.string().min(1, 'Title is required'),
	description: z.string().optional()
});

const adminIdsValidator = z.array(z.string().min(1, 'Admin ID cannot be empty')).optional();

export const contestItemsValidator = z.object({
	id: z.uuid(),
	title: z.string().min(1, 'Contest item title is required'),
	auxiliaryText: z.string().optional(),
	contestItemType: z.enum(CONTEST_ITEM_TYPE_VALUES)
});

export const baseContestsValidator = z.object({
	id: z.uuid(),
	title: z.string().min(1, 'Contest title is required'),
	description: z.string().optional(),
	contestStatus: z.enum(CONTEST_STATUS_VALUES),
	items: z.array(contestItemsValidator).min(1, 'At least one contest item is required')
});
export const contestsValidator = z
	.array(baseContestsValidator)
	.min(1, 'At least one contest is required')
	.refine(
		(contests) =>
			contests.some((contest) => ['active', 'upcoming'].includes(contest.contestStatus)),
		{
			message: 'At least one contest must be active or upcoming',
			path: ['contests']
		}
	);

const pollingStationAddressesValidator = z
	.array(addressValidator)
	.min(1, 'At least one polling station address is required');

export const createContestGroupValidator = z.object({
	...contestGroupBasicValidator.shape,
	adminIds: adminIdsValidator,
	contests: contestsValidator,
	pollingStationAddresses: pollingStationAddressesValidator
});
