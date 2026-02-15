<script lang="ts">
	import { Card, CardContent, CardHeader } from '$lib/components/ui/card';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let searchInput = $state(data.searchQuery);
	let isSearching = $state(false);

	function handleSearch(e: Event) {
		const form = (e.target as HTMLInputElement).form;
		if (form) {
			form.submit();
		}
	}

	function getDisplayName(firstName: string, lastName: string): string {
		return `${firstName} ${lastName}`;
	}

	function formatDate(date: Date | string): string {
		return new Date(date).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>View Admins - Gov Vote</title>
</svelte:head>

<main class="min-h-[calc(100vh-8rem)] bg-[var(--bg-primary)] px-6 py-8">
	<div class="mx-auto w-full max-w-6xl">
		<!-- Header -->
		<header class="mb-8">
			<h1 class="mb-2 text-3xl font-bold text-[var(--text-primary)]">Manage Admins</h1>
			<p class="text-[var(--text-secondary)]">
				Search and view admin accounts ({data.totalCount} total)
			</p>
		</header>

		<!-- Search Bar -->
		<section class="mb-8">
			<form class="flex flex-col gap-3 sm:flex-row">
				<div class="flex flex-1 gap-2">
					<input
						type="text"
						name="q"
						value={searchInput}
						onchange={handleSearch}
						placeholder="Search by username, name, or email..."
						class="flex-1 rounded-lg border bg-[var(--bg-primary)] px-4 py-2.5 text-base text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
						style="border-color: var(--border-color);"
					/>
				</div>
				<button
					type="submit"
					class="rounded-lg bg-blue-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-600 focus:outline-2 focus:outline-offset-2 focus:outline-blue-500"
				>
					Search
				</button>
			</form>
			{#if data.searchQuery}
				<p class="mt-2 text-sm text-[var(--text-secondary)]">
					Found {data.totalCount} result{data.totalCount !== 1 ? 's' : ''} for "{data.searchQuery}"
				</p>
			{/if}
		</section>

		<!-- Admins Grid -->
		{#if data.admins.length === 0}
			<div
				class="rounded-lg border-2 border-dashed bg-[var(--bg-secondary)] p-8 text-center"
				style="border-color: var(--border-color);"
			>
				<p class="text-[var(--text-secondary)]">
					{data.searchQuery ? 'No admins found matching your search.' : 'No admins found.'}
				</p>
			</div>
		{:else}
			<div class="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
				{#each data.admins as admin (admin.id)}
					<Card>
						<CardHeader>
							{getDisplayName(admin.firstName, admin.lastName)}
						</CardHeader>
						<CardContent class="flex flex-1 flex-col gap-3">
							<div>
								<p class="text-xs font-semibold text-[var(--text-secondary)]">USERNAME</p>
								<p class="text-sm text-[var(--text-primary)]">{admin.username}</p>
							</div>
							<div>
								<p class="text-xs font-semibold text-[var(--text-secondary)]">EMAIL</p>
								<p class="truncate text-sm text-[var(--text-primary)]">{admin.email}</p>
							</div>
							<div>
								<p class="text-xs font-semibold text-[var(--text-secondary)]">ROLE</p>
								<p class="text-sm text-[var(--text-primary)] capitalize">{admin.role}</p>
							</div>
							<div>
								<p class="text-xs font-semibold text-[var(--text-secondary)]">CREATED</p>
								<p class="text-sm text-[var(--text-secondary)]">{formatDate(admin.createdAt)}</p>
							</div>
							<div class="mt-auto flex gap-2 pt-3">
								<button
									type="button"
									class="flex-1 rounded-md border bg-[var(--bg-primary)] px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-secondary)] focus:outline-2 focus:outline-offset-1 focus:outline-blue-500"
									style="border-color: var(--border-color);"
								>
									Edit
								</button>
								<button
									type="button"
									class="flex-1 rounded-md border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100 focus:outline-2 focus:outline-offset-1 focus:outline-red-500 dark:border-red-600 dark:bg-red-900/20 dark:text-red-300 dark:hover:bg-red-900/30"
								>
									Deactivate
								</button>
							</div>
						</CardContent>
					</Card>
				{/each}
			</div>

			<!-- Pagination -->
			{#if data.totalPages > 1}
				<div
					class="flex items-center justify-between rounded-lg border bg-[var(--bg-secondary)] p-4"
					style="border-color: var(--border-color);"
				>
					<div class="text-sm text-[var(--text-secondary)]">
						Page {data.currentPage} of {data.totalPages}
					</div>
					<div class="flex gap-2">
						{#if data.currentPage > 1}
							<a
								href="?q={encodeURIComponent(data.searchQuery)}&page={data.currentPage - 1}"
								class="rounded-md border bg-[var(--bg-primary)] px-3 py-1.5 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-secondary)] focus:outline-2 focus:outline-offset-1 focus:outline-blue-500"
								style="border-color: var(--border-color);"
							>
								← Previous
							</a>
						{/if}

						{#each { length: data.totalPages } as _, i}
							{@const pageNum = i + 1}
							{#if pageNum === data.currentPage}
								<button
									type="button"
									disabled
									class="rounded-md bg-blue-500 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-70"
								>
									{pageNum}
								</button>
							{:else if Math.abs(pageNum - data.currentPage) <= 1 || pageNum === 1 || pageNum === data.totalPages}
								<a
									href="?q={encodeURIComponent(data.searchQuery)}&page={pageNum}"
									class="rounded-md border bg-[var(--bg-primary)] px-3 py-1.5 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-secondary)] focus:outline-2 focus:outline-offset-1 focus:outline-blue-500"
									style="border-color: var(--border-color);"
								>
									{pageNum}
								</a>
							{:else if pageNum === 2 && data.currentPage > 3}
								<span class="px-2 py-1.5 text-[var(--text-secondary)]">…</span>
							{/if}
						{/each}

						{#if data.currentPage < data.totalPages}
							<a
								href="?q={encodeURIComponent(data.searchQuery)}&page={data.currentPage + 1}"
								class="rounded-md border bg-[var(--bg-primary)] px-3 py-1.5 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-secondary)] focus:outline-2 focus:outline-offset-1 focus:outline-blue-500"
								style="border-color: var(--border-color);"
							>
								Next →
							</a>
						{/if}
					</div>
				</div>
			{/if}
		{/if}
	</div>
</main>
