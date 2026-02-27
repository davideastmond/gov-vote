import z from 'zod';

export const tokenRequestValidator = z.object({
	voterCardCode: z.uuid('Voter card code is required')
});
