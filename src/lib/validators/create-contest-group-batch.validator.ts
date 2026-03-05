import z from 'zod';
import { addressValidator } from './address.validator';
import {
	baseContestsValidator,
	contestGroupBasicValidator,
	contestItemsValidator
} from './create-contest-group.validator';

export const createContestGroupBatchValidator = z.object({
	contestGroups: z
		.array(
			contestGroupBasicValidator.omit({ id: true }).extend({
				adminIds: z.array(z.uuid().min(1, 'Admin ID cannot be empty')).optional(),
				contests: z
					.array(
						baseContestsValidator.omit({ id: true }).extend({
							items: z.array(contestItemsValidator.omit({ id: true }))
						})
					)
					.min(1, 'At least one contest is required'),
				pollingStationAddresses: z
					.array(addressValidator)
					.min(1, 'At least one polling station address is required')
			})
		)
		.min(1, 'At least one contest group is required')
});
