import { z } from 'zod';
import { addressValidator } from './address.validator';

const contestGroupBasicValidator = z.object({
	id: z.uuid(),
	title: z.string().min(1, 'Title is required'),
	description: z.string().optional()
});

const adminIdsValidator = z.array(z.string().min(1, 'Admin ID cannot be empty')).optional();
const contestItemsValidator = z.object({
	id: z.uuid(),
	title: z.string().min(1, 'Contest item title is required'),
	auxiliaryText: z.string().optional(),
	contestItemType: z.enum(['candidate', 'initiative', 'other'])
});

const contestsValidator = z
	.array(
		z.object({
			id: z.uuid(),
			title: z.string().min(1, 'Contest title is required'),
			description: z.string().optional(),
			contestStatus: z.enum(['upcoming', 'active', 'closed']),
			items: z.array(contestItemsValidator).min(1, 'At least one contest item is required')
		})
	)
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
