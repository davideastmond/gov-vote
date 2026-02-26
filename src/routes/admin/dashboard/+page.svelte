<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card';
	import type { UserRole } from '$lib/definitions/user.js';

	const { data } = $props();
	// Placeholder role. Replace with real auth data when available.
	const userRole: Omit<UserRole, 'voter'> = data?.session?.user?.role || 'admin';

	const adminActions = [
		{
			id: 'manage-admins',
			label: 'Manage Admins',
			description: 'Create, edit, and deactivate admin accounts',
			urls: [{ label: 'Manage Admins', url: '/admin/dashboard/admins/manage' }],
			accessLevel: ['super_admin']
		},
		{
			id: 'create-polling-stations',
			label: 'Create Polling Stations',
			description: 'View, add and batch-add new polling stations to the system via JSON upload',
			urls: [
				{ label: 'View Polling Stations', url: '/admin/dashboard/polling-stations/view' },
				{
					label: 'Create Polling Stations',
					url: '/admin/dashboard/polling-stations/create'
				}
			],
			accessLevel: ['admin', 'super_admin']
		},
		{
			id: 'contest-groups',
			label: 'Contest Groups',
			description: 'Search, view, create election contest groups',
			urls: [
				{ label: 'View Contest Groups', url: '/admin/dashboard/contest-groups/view' },
				{
					label: 'Create Contest Group',
					url: '/admin/dashboard/contest-groups/create'
				}
			],
			accessLevel: ['admin', 'super_admin']
		},
		{
			id: 'create-voters',
			label: 'Create Voters',
			description: 'Batch add new voters to the system via JSON upload',
			urls: [{ label: 'Create Voters', url: '/admin/dashboard/voters/create' }],
			accessLevel: ['admin', 'super_admin']
		},
		{
			id: 'create-voter-eligibility',
			label: 'Create Voter Eligibility',
			description: 'Batch create voter eligibility records via JSON upload',
			urls: [
				{ label: 'Create Voter Eligibility', url: '/admin/dashboard/voter-eligibility/create' }
			],
			accessLevel: ['admin', 'super_admin']
		}
	];
</script>

<svelte:head>
	<title>Admin Dashboard - Gov Vote</title>
</svelte:head>

<main class="min-h-[calc(100vh-8rem)] bg-[var(--bg-primary)] px-6 py-8">
	<div class="mx-auto flex w-full max-w-6xl flex-col gap-8">
		<header class="flex flex-wrap items-center justify-between gap-4">
			<div>
				<h1 class="mb-2 text-3xl font-bold text-[var(--text-primary)]">Admin Dashboard</h1>
				<p class="text-[var(--text-secondary)]">
					Manage contest groups, monitor activity, and administer settings.
				</p>
			</div>
		</header>

		<Card>
			<CardHeader>
				<CardTitle>Admin Options</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{#each adminActions as adminAction}
						{#if adminAction.accessLevel.includes(userRole as string)}
							<Card class="h-full">
								<CardHeader class="pb-3">
									<CardTitle class="text-base">{adminAction.label}</CardTitle>
								</CardHeader>
								<CardContent>
									<p class="text-sm text-[var(--text-secondary)]">{adminAction.description}</p>
								</CardContent>
								<CardFooter>
									<div class="flex w-full flex-col gap-2">
										{#if adminAction.urls && adminAction.urls.length > 0}
											{#each adminAction.urls as urlObj}
												<Button variant="outline" href={urlObj.url} class="w-full"
													>{urlObj.label}</Button
												>
											{/each}
										{:else}
											<Button variant="outline" href="#" class="w-full">Open</Button>
										{/if}
									</div>
								</CardFooter>
							</Card>
						{/if}
					{/each}
				</div>
			</CardContent>
		</Card>
	</div>
</main>
