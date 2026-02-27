export const load = async ({ locals }) => {
	const session = await locals.auth();
	if (!session || !['admin', 'super_admin'].includes(session.user?.role)) {
		return {
			username: null,
			role: null
		};
	}
	return {
		username: session.user.username,
		role: session.user.role
	};
};
