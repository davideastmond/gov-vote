<script lang="ts">
	import { page } from '$app/state';
	import AdminNavToolbar from '$lib/components/AdminNavToolbar.svelte';

	const { children } = $props();

	const hiddenPathPrefixes = [
		'/admin/dashboard/admins/manage',
		'/admin/dashboard/contest-groups/create',
		'/admin/dashboard/contest-groups/edit',
		'/admin/dashboard/contest-groups/view',
		'/admin/dashboard/polling-stations/create',
		'/admin/dashboard/polling-stations/view',
		'/admin/dashboard/voter-cards/manage',
		'/admin/dashboard/voter-eligibility/create',
		'/admin/dashboard/voters/create',
		'/admin/dashboard/voters/manage',
		'/admin/dashboard/voters/'
	];

	const shouldShowToolbar = $derived.by(() => {
		const pathname = page.url.pathname;

		if (pathname === '/admin/dashboard') {
			return false;
		}

		return !hiddenPathPrefixes.some((prefix) => pathname.startsWith(prefix));
	});
</script>

{#if shouldShowToolbar}
	<div class="px-6 pt-6">
		<div class="mx-auto w-full max-w-6xl">
			<AdminNavToolbar primary={{ label: '← Back to Admin Dashboard', href: '/admin/dashboard' }} />
		</div>
	</div>
{/if}

{@render children()}
