<script lang="ts">
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card';
	import type { UserRole } from '$lib/definitions/user.js';

	const { data } = $props();
	// Placeholder role. Replace with real auth data when available.
	const userRole: Omit<UserRole, 'voter'> = data?.session?.user?.role || 'admin';

	const superAdminActions = [
		{
			id: 'manage-admins',
			label: 'Manage Admins',
			description: 'Create, edit, and deactivate admin accounts',
			urls: [{ label: 'Manage Admins', url: '/admin/dashboard/admins/manage' }]
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
			]
		},
		{
			id: 'contest-groups',
			label: 'Contest Groups',
			description: 'Search, view, create election contest groups',
			urls: [{ label: 'View Contest Groups', url: '/admin/dashboard/contest-groups/view' }]
		},
		{
			id: 'create-voters',
			label: 'Create Voters',
			description: 'Batch add new voters to the system via JSON upload',
			urls: [{ label: 'Create Voters', url: '/admin/dashboard/voters/create' }]
		},
		{
			id: 'create-voter-eligibility',
			label: 'Create Voter Eligibility',
			description: 'Batch create voter eligibility records via JSON upload',
			urls: [
				{ label: 'Create Voter Eligibility', url: '/admin/dashboard/voter-eligibility/create' }
			]
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
		{#if userRole === 'super_admin'}
			<Card>
				<CardHeader>
					<CardTitle>Super Admin Options</CardTitle>
				</CardHeader>
				<CardContent>
					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{#each superAdminActions as action}
							<Card class="h-full">
								<CardHeader class="pb-3">
									<CardTitle class="text-base">{action.label}</CardTitle>
								</CardHeader>
								<CardContent>
									<p class="text-sm text-[var(--text-secondary)]">{action.description}</p>
								</CardContent>
								<CardFooter>
									<div class="flex w-full flex-col gap-2">
										{#if action.urls && action.urls.length > 0}
											{#each action.urls as urlObj}
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
						{/each}
					</div>
				</CardContent>
			</Card>
		{:else}
			<Card>
				<CardHeader>
					<CardTitle>Admin Options</CardTitle>
				</CardHeader>
				<CardContent>
					<p class="mb-4 text-sm text-[var(--text-secondary)]">
						Admin tools will appear here once configured.
					</p>
					<Alert>
						<AlertTitle>Standard admin actions placeholder</AlertTitle>
						<AlertDescription>
							Placeholder for standard admin actions (e.g., review contests, update content, manage
							voters).
						</AlertDescription>
					</Alert>
				</CardContent>
			</Card>
		{/if}
	</div>
</main>
