import { redirect } from '@sveltejs/kit';

export async function requireAdminSession(locals: App.Locals) {
	const session = await locals.auth();

	if (!session || !session.user?.id || !['admin', 'super_admin'].includes(session.user?.role)) {
		throw redirect(302, '/admin/login');
	}

	return session;
}
