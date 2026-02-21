import { z } from 'zod';
import { addressValidator } from './address.validator';

export const createPollingStationValidator = addressValidator.extend({
	name: z.string().min(1, 'Polling station name is required')
});

export const batchCreatePollingStationValidator = z
	.array(createPollingStationValidator)
	.min(1, 'At least one polling station entry is required');

export type PollingStationEntry = z.infer<typeof createPollingStationValidator>;
