import z from 'zod';

export const createAdminValidator = z.object({
	email: z.email(),
	firstName: z.string().min(2),
	lastName: z.string().min(2),
	password: z.string().min(8),
	username: z.string().min(3)
});
