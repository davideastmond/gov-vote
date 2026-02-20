import { z } from 'zod';

const eligibilityEntry = z.object({
	userId: z.uuid(),
	pollingStationId: z.uuid(),
	contestGroupId: z.uuid(),
	contestId: z.uuid(),
	isEligible: z.boolean(),
	isComplete: z.boolean()
});

export const eligibilityValidator = z.array(eligibilityEntry).min(1);
export type EligibilityEntry = z.infer<typeof eligibilityEntry>;
