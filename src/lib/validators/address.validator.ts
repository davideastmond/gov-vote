import { z } from 'zod';
export const addressValidator = z.object({
	name: z.string().optional(),
	streetAddress: z.string().min(1, 'Street address is required'),
	city: z.string().min(1, 'City is required'),
	state: z.string().min(1, 'State is required'),
	zipCode: z.string().min(1, 'Zip code is required')
});
