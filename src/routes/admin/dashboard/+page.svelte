<script lang="ts">
	// Placeholder data for contests
	let contests = $state([
		{
			id: 1,
			title: 'Presidential Election 2026',
			status: 'active',
			startDate: '2026-02-10',
			endDate: '2026-02-20',
			totalVotes: 15420,
			candidates: 4
		},
		{
			id: 2,
			title: 'Senate District 5',
			status: 'active',
			startDate: '2026-02-12',
			endDate: '2026-02-18',
			totalVotes: 8234,
			candidates: 3
		},
		{
			id: 3,
			title: 'City Council Ward 12',
			status: 'scheduled',
			startDate: '2026-02-25',
			endDate: '2026-03-05',
			totalVotes: 0,
			candidates: 5
		},
		{
			id: 4,
			title: 'School Board Position 3',
			status: 'completed',
			startDate: '2026-01-15',
			endDate: '2026-01-30',
			totalVotes: 12567,
			candidates: 2
		}
	]);

	let showCreateModal = $state(false);

	function handleCreateContest() {
		showCreateModal = true;
		console.log('Create new contest');
	}

	function handleEditContest(contestId: number) {
		console.log('Edit contest:', contestId);
	}

	function handleViewContest(contestId: number) {
		console.log('View contest:', contestId);
	}

	function getStatusColor(status: string) {
		switch (status) {
			case 'active':
				return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
			case 'scheduled':
				return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
			case 'completed':
				return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
			default:
				return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
		}
	}
</script>

<svelte:head>
	<title>Admin Dashboard - Gov Vote</title>
</svelte:head>

<main class="min-h-[calc(100vh-8rem)] bg-[var(--bg-primary)] px-6 py-8">
	<div class="mx-auto max-w-7xl">
		<!-- Header -->
		<div class="mb-8 flex flex-wrap items-center justify-between gap-4">
			<div>
				<h1 class="mb-2 text-3xl font-bold text-[var(--text-primary)]">Admin Dashboard</h1>
				<p class="text-[var(--text-secondary)]">Manage voting contests and monitor results</p>
			</div>
			<button
				onclick={handleCreateContest}
				class="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-6 py-3 font-semibold text-white transition-all hover:bg-blue-600 hover:shadow-md focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-blue-500 active:scale-95 dark:bg-blue-600 dark:hover:bg-blue-700"
			>
				<span aria-hidden="true" class="text-xl">➕</span>
				<span>Create New Contest</span>
			</button>
		</div>

		<!-- Stats Overview -->
		<div class="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
			<div
				class="rounded-lg border bg-[var(--bg-secondary)] p-6 transition-all hover:shadow-md"
				style="border-color: var(--border-color);"
			>
				<div class="mb-2 text-sm font-medium text-[var(--text-secondary)]">Total Contests</div>
				<div class="text-3xl font-bold text-[var(--text-primary)]">{contests.length}</div>
			</div>
			<div
				class="rounded-lg border bg-[var(--bg-secondary)] p-6 transition-all hover:shadow-md"
				style="border-color: var(--border-color);"
			>
				<div class="mb-2 text-sm font-medium text-[var(--text-secondary)]">Active Contests</div>
				<div class="text-3xl font-bold text-green-600 dark:text-green-400">
					{contests.filter((c) => c.status === 'active').length}
				</div>
			</div>
			<div
				class="rounded-lg border bg-[var(--bg-secondary)] p-6 transition-all hover:shadow-md"
				style="border-color: var(--border-color);"
			>
				<div class="mb-2 text-sm font-medium text-[var(--text-secondary)]">Total Votes Cast</div>
				<div class="text-3xl font-bold text-[var(--text-primary)]">
					{contests.reduce((sum, c) => sum + c.totalVotes, 0).toLocaleString()}
				</div>
			</div>
			<div
				class="rounded-lg border bg-[var(--bg-secondary)] p-6 transition-all hover:shadow-md"
				style="border-color: var(--border-color);"
			>
				<div class="mb-2 text-sm font-medium text-[var(--text-secondary)]">Scheduled</div>
				<div class="text-3xl font-bold text-blue-600 dark:text-blue-400">
					{contests.filter((c) => c.status === 'scheduled').length}
				</div>
			</div>
		</div>

		<!-- Contests List -->
		<div
			class="rounded-lg border bg-[var(--bg-secondary)] shadow-sm"
			style="border-color: var(--border-color);"
		>
			<div class="border-b px-6 py-4" style="border-color: var(--border-color);">
				<h2 class="text-xl font-bold text-[var(--text-primary)]">All Contests</h2>
			</div>

			<div class="overflow-x-auto">
				<table class="w-full">
					<thead class="border-b bg-[var(--bg-primary)]" style="border-color: var(--border-color);">
						<tr>
							<th class="px-6 py-3 text-left text-sm font-semibold text-[var(--text-primary)]">
								Contest
							</th>
							<th class="px-6 py-3 text-left text-sm font-semibold text-[var(--text-primary)]">
								Status
							</th>
							<th class="px-6 py-3 text-left text-sm font-semibold text-[var(--text-primary)]">
								Date Range
							</th>
							<th class="px-6 py-3 text-left text-sm font-semibold text-[var(--text-primary)]">
								Candidates
							</th>
							<th class="px-6 py-3 text-left text-sm font-semibold text-[var(--text-primary)]">
								Total Votes
							</th>
							<th class="px-6 py-3 text-left text-sm font-semibold text-[var(--text-primary)]">
								Actions
							</th>
						</tr>
					</thead>
					<tbody class="divide-y" style="border-color: var(--border-color);">
						{#each contests as contest}
							<tr class="transition-colors hover:bg-[var(--bg-primary)]">
								<td class="px-6 py-4">
									<div class="font-medium text-[var(--text-primary)]">{contest.title}</div>
								</td>
								<td class="px-6 py-4">
									<span
										class="inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize {getStatusColor(
											contest.status
										)}"
									>
										{contest.status}
									</span>
								</td>
								<td class="px-6 py-4 text-sm text-[var(--text-secondary)]">
									<div>{contest.startDate}</div>
									<div>to {contest.endDate}</div>
								</td>
								<td class="px-6 py-4 text-sm text-[var(--text-secondary)]">
									{contest.candidates}
								</td>
								<td class="px-6 py-4 text-sm font-medium text-[var(--text-primary)]">
									{contest.totalVotes.toLocaleString()}
								</td>
								<td class="px-6 py-4">
									<div class="flex gap-2">
										<button
											onclick={() => handleViewContest(contest.id)}
											class="rounded px-3 py-1 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 focus:outline focus:outline-2 focus:outline-blue-500 dark:text-blue-400 dark:hover:bg-blue-900/30"
											aria-label="View contest {contest.title}"
										>
											View
										</button>
										<button
											onclick={() => handleEditContest(contest.id)}
											class="rounded px-3 py-1 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 focus:outline focus:outline-2 focus:outline-gray-500 dark:text-gray-400 dark:hover:bg-gray-700/30"
											aria-label="Edit contest {contest.title}"
										>
											Edit
										</button>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

			{#if contests.length === 0}
				<div class="px-6 py-12 text-center">
					<div class="mb-2 text-4xl">📋</div>
					<p class="mb-4 text-lg font-medium text-[var(--text-primary)]">No contests yet</p>
					<p class="mb-6 text-sm text-[var(--text-secondary)]">
						Get started by creating your first voting contest
					</p>
					<button
						onclick={handleCreateContest}
						class="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-blue-600 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-blue-500 dark:bg-blue-600 dark:hover:bg-blue-700"
					>
						Create Contest
					</button>
				</div>
			{/if}
		</div>
	</div>
</main>

{#if showCreateModal}
	<!-- Modal Backdrop -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
		onclick={() => (showCreateModal = false)}
		role="dialog"
		aria-modal="true"
		aria-labelledby="modal-title"
	>
		<!-- Modal Content -->
		<div
			class="w-full max-w-md rounded-lg border bg-[var(--bg-primary)] p-6 shadow-xl"
			style="border-color: var(--border-color);"
			onclick={(e) => e.stopPropagation()}
		>
			<h2 id="modal-title" class="mb-4 text-2xl font-bold text-[var(--text-primary)]">
				Create New Contest
			</h2>
			<p class="mb-6 text-sm text-[var(--text-secondary)]">
				This is a placeholder modal. Contest creation functionality will be implemented with API
				integration.
			</p>
			<div class="flex justify-end gap-3">
				<button
					onclick={() => (showCreateModal = false)}
					class="rounded-lg border px-4 py-2 font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-secondary)] focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-gray-500"
					style="border-color: var(--border-color);"
				>
					Cancel
				</button>
				<button
					onclick={() => (showCreateModal = false)}
					class="rounded-lg bg-blue-500 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-600 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-blue-500 dark:bg-blue-600 dark:hover:bg-blue-700"
				>
					Create
				</button>
			</div>
		</div>
	</div>
{/if}
