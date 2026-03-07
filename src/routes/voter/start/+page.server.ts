import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
	cookies.delete('voter_token', { path: '/' });

	return {};
};
