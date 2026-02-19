import { db } from '$lib/server/db';
import { SvelteKitAuth, type DefaultSession } from '@auth/sveltekit';
import Credentials from '@auth/sveltekit/providers/credentials';

import bcrypt from 'bcrypt';

declare module '@auth/sveltekit' {
	interface Session {
		user: {
			role: 'admin' | 'voter' | 'super_admin';
			username: string;
			firstName: string;
			lastName: string;
			/**
			 * By default, TypeScript merges new interface properties and overwrites existing ones.
			 * In this case, the default session user properties will be overwritten,
			 * with the new ones defined above. To keep the default session user properties,
			 * you need to add them back into the newly declared interface.
			 */
		} & DefaultSession['user'];
	}
}
export const { signIn, signOut, handle } = SvelteKitAuth({
	providers: [
		Credentials({
			credentials: {
				username: { label: 'Username', type: 'text' },
				password: { label: 'Password', type: 'password' }
			},
			async authorize(credentials) {
				if (!credentials || !credentials.username || !credentials.password) return null;

				// Find the user in the database and check their password
				const targetUser = await db.query.user.findFirst({
					where: (users, { eq, and, or }) =>
						and(
							eq(users.username, credentials.username as string),
							or(eq(users.role, 'admin'), eq(users.role, 'super_admin'))
						)
				});
				if (!targetUser) {
					throw new Error(
						"Please check your credentials and try again. If you don't have an account, please contact the administrator."
					);
				}

				const isValidPassword = await bcrypt.compare(
					credentials.password as string,
					targetUser.hashedPassword
				);
				if (!isValidPassword) {
					throw new Error(
						"Invalid username or password. Please check your credentials and try again. If you don't have an account, please contact the administrator."
					);
				}
				return targetUser;
			}
		})
	],
	callbacks: {
		jwt: async ({ token, user }) => {
			if (user) {
				token = {
					...token,
					id: user.id,
					username: (user as any).username as string,
					firstName: (user as any).firstName as string,
					lastName: (user as any).lastName as string,
					role: (user as any).role as string
					// Add any other user properties you want to include in the token
				};
			}
			return token;
		},
		session: async ({ session, token }) => {
			session = {
				...session,
				user: {
					id: token.id as string,
					username: token.username as string,
					firstName: token.firstName as string,
					lastName: token.lastName as string,
					role: token.role as string
				} as any
			};
			return session;
		}
	},
	pages: {
		signIn: '/admin/login'
	},
	session: {
		strategy: 'jwt'
	}
});
