<script lang="ts">
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card';

	type AdminRole = 'admin' | 'super_admin';

	const { data } = $props();
	// Placeholder role. Replace with real auth data when available.
	const userRole: Omit<AdminRole, 'voter'> = data?.session?.user?.role || 'admin';

	const superAdminActions = [
		{
			id: 'manage-admins',
			label: 'Manage Admins',
			description: 'Create, edit, and deactivate admin accounts',
			url: '/admin/dashboard/admins/manage'
		},
		{
			id: 'audit-logs',
			label: 'Audit Logs',
			description: 'Review security and access logs'
		},
		{
			id: 'system-settings',
			label: 'System Settings',
			description: 'Configure global voting settings'
		},
		{
			id: 'data-export',
			label: 'Data Export',
			description: 'Export contest data and reports'
		},
		{
			id: 'access-policies',
			label: 'Access Policies',
			description: 'Set role permissions and access rules'
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
			<Card class="min-w-[200px]">
				<CardHeader class="pb-2">
					<CardTitle class="text-sm text-muted-foreground">Signed in as</CardTitle>
				</CardHeader>
				<CardContent class="pt-0">
					<Badge variant="secondary" class="capitalize">
						{userRole}
					</Badge>
				</CardContent>
			</Card>
		</header>

		<Card>
			<CardHeader class="flex flex-wrap items-center justify-between gap-3">
				<CardTitle>Contest Groups</CardTitle>
				<Button type="button" class="gap-2">
					<span aria-hidden="true">➕</span>
					Create New Contest Group
				</Button>
			</CardHeader>
			<CardContent>
				<Alert>
					<AlertTitle>Contest group list placeholder</AlertTitle>
					<AlertDescription>
						This area will display all contest groups once data is connected.
					</AlertDescription>
				</Alert>
			</CardContent>
		</Card>

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
									<Button variant="outline" href={action.url || '#'} class="w-full">Open</Button>
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
