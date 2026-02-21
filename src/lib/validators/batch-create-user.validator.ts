import z from 'zod';

const userEntry = z.object({
	firstName: z.string().min(1, 'First name is required'),
	lastName: z.string().min(1, 'Last name is required'),
	streetAddress: z.string().min(1, 'Street address is required'),
	city: z.string().min(1, 'City is required'),
	state: z.string().min(1, 'State is required'),
	zipCode: z.string().min(1, 'Zip code is required')
});

export const batchCreateUserValidator = z
	.array(userEntry)
	.min(1, 'At least one user entry is required');

// Export a type from userEntry for use in other parts of the codebase
export type UserEntry = z.infer<typeof userEntry>;
