<script lang="ts">
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
			<div
				class="rounded-lg border bg-[var(--bg-secondary)] px-4 py-3"
				style="border-color: var(--border-color);"
			>
				<p class="text-sm font-medium text-[var(--text-secondary)]">Signed in as</p>
				<p class="text-base font-semibold text-[var(--text-primary)]">{userRole}</p>
			</div>
		</header>

		<section
			class="rounded-xl border bg-[var(--bg-secondary)] p-6"
			style="border-color: var(--border-color);"
		>
			<div class="mb-4 flex flex-wrap items-center justify-between gap-3">
				<h2 class="text-xl font-bold text-[var(--text-primary)]">Contest Groups</h2>
				<button
					class="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-blue-600 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-blue-500 dark:bg-blue-600 dark:hover:bg-blue-700"
					type="button"
				>
					<span aria-hidden="true">➕</span>
					Create New Contest Group
				</button>
			</div>
			<div
				class="rounded-lg border bg-[var(--bg-primary)] px-4 py-8 text-center"
				style="border-color: var(--border-color);"
			>
				<p class="mb-2 text-sm font-medium text-[var(--text-primary)]">
					Contest group list placeholder
				</p>
				<p class="text-sm text-[var(--text-secondary)]">
					This area will display all contest groups once data is connected.
				</p>
			</div>
		</section>

		{#if userRole === 'super_admin'}
			<section
				class="rounded-xl border bg-[var(--bg-secondary)] p-6"
				style="border-color: var(--border-color);"
			>
				<h2 class="mb-4 text-xl font-bold text-[var(--text-primary)]">Super Admin Options</h2>
				<div class="flex flex-wrap gap-4 sm:flex-col">
					{#each superAdminActions as action}
						<button
							type="button"
							class="flex flex-col items-start gap-2 rounded-lg border bg-[var(--bg-primary)] px-4 py-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-blue-500"
							style="border-color: var(--border-color);"
						>
							<a href={action.url || '#'} class="w-full">
								<span class="text-base font-semibold text-[var(--text-primary)]">
									{action.label}
								</span>
								<span class="text-sm text-[var(--text-secondary)]">
									{action.description}
								</span>
							</a>
						</button>
					{/each}
				</div>
			</section>
		{:else}
			<section
				class="rounded-xl border bg-[var(--bg-secondary)] p-6"
				style="border-color: var(--border-color);"
			>
				<h2 class="mb-2 text-xl font-bold text-[var(--text-primary)]">Admin Options</h2>
				<p class="mb-4 text-sm text-[var(--text-secondary)]">
					Admin tools will appear here once configured.
				</p>
				<div
					class="rounded-lg border bg-[var(--bg-primary)] px-4 py-6"
					style="border-color: var(--border-color);"
				>
					<p class="text-sm text-[var(--text-secondary)]">
						Placeholder for standard admin actions (e.g., review contests, update content, manage
						voters).
					</p>
				</div>
			</section>
		{/if}
	</div>
</main>
