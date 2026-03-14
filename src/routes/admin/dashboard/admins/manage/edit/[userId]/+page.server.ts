import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { requireAdminSession } from '$lib/server/utils/require-admin-session';
import { error, fail, redirect } from '@sveltejs/kit';
import { and, eq, ne, or } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

function getString(formData: FormData, field: string) {
	return String(formData.get(field) ?? '').trim();
}

async function requireSuperAdmin(locals: App.Locals) {
	const session = await requireAdminSession(locals);

	if (session.user.role !== 'super_admin') {
		throw redirect(302, '/admin/login');
	}

	return session;
}

export const load: PageServerLoad = async ({ params, locals }) => {
	await requireSuperAdmin(locals);

	const adminUser = await db.query.user.findFirst({
		where: (u, { and, eq }) => and(eq(u.id, params.userId), eq(u.role, 'admin'))
	});

	if (!adminUser) {
		throw error(404, 'Admin not found');
	}

	return {
		admin: {
			id: adminUser.id,
			username: adminUser.username,
			email: adminUser.email,
			firstName: adminUser.firstName,
			lastName: adminUser.lastName,
			role: adminUser.role,
			createdAt: adminUser.createdAt,
			updatedAt: adminUser.updatedAt
		}
	};
};

export const actions: Actions = {
	updateAdmin: async ({ request, params, locals }) => {
		await requireSuperAdmin(locals);

		const formData = await request.formData();
		const username = getString(formData, 'username');
		const email = getString(formData, 'email');
		const firstName = getString(formData, 'firstName');
		const lastName = getString(formData, 'lastName');
		const role = getString(formData, 'role');

		if (!username || !email || !firstName || !lastName || !role) {
			return fail(400, {
				action: 'updateAdmin',
				success: false,
				message: 'Username, email, first name, last name, and role are required.'
			});
		}

		if (!['admin', 'voter'].includes(role)) {
			return fail(400, {
				action: 'updateAdmin',
				success: false,
				message: 'Role must be either admin or voter.'
			});
		}

		const foundAdmin = await db.query.user.findFirst({
			where: (u, { and, eq }) => and(eq(u.id, params.userId), eq(u.role, 'admin'))
		});

		if (!foundAdmin) {
			throw error(404, 'Admin not found');
		}

		const conflictingUser = await db.query.user.findFirst({
			where: or(
				and(eq(user.username, username), ne(user.id, params.userId)),
				and(eq(user.email, email), ne(user.id, params.userId))
			)
		});

		if (conflictingUser) {
			const isUsernameConflict = conflictingUser.username === username;
			return fail(409, {
				action: 'updateAdmin',
				success: false,
				message: isUsernameConflict
					? 'That username is already in use.'
					: 'That email is already in use.'
			});
		}

		await db
			.update(user)
			.set({
				username,
				email,
				firstName,
				lastName,
				role: role as 'admin' | 'voter',
				updatedAt: new Date()
			})
			.where(and(eq(user.id, params.userId), eq(user.role, 'admin')));

		return {
			action: 'updateAdmin',
			success: true,
			message: 'Admin details updated successfully.'
		};
	}
};
