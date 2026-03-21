<script lang="ts">
	import AdminNavToolbar from '$lib/components/AdminNavToolbar.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import type { ContestStatus } from '$lib/definitions/enums';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let searchInput = $derived(data.searchQuery);

	function handleSearch(e: Event) {
		const form = (e.target as HTMLInputElement).form;
		if (form) {
			form.submit();
		}
	}

	function formatStatus(status: ContestStatus | null | undefined) {
		if (!status) return 'Not specified';
		return status.charAt(0).toUpperCase() + status.slice(1);
	}

	function statusVariant(status: ContestStatus | null | undefined) {
		if (status === 'closed') return 'destructive' as const;
		if (status === 'upcoming') return 'secondary' as const;
		return 'default' as const;
	}
</script>

<svelte:head>
	<title>View Contest Groups - Gov Vote</title>
</svelte:head>

<main class="min-h-[calc(100vh-8rem)] bg-[var(--bg-primary)] px-6 py-8">
	<div class="mx-auto w-full max-w-6xl">
		<AdminNavToolbar primary={{ label: '← Back to Admin Dashboard', href: '/admin/dashboard' }} />

		<!-- Header -->
		<header class="mb-8">
			<div class="flex flex-wrap items-center justify-between gap-4">
				<div>
					<h1 class="mb-2 text-3xl font-bold text-[var(--text-primary)]">Contest Groups</h1>
					<p class="text-[var(--text-secondary)]">
						Search and manage contest groups ({data.totalCount} total)
					</p>
				</div>
				<div class="flex flex-wrap gap-2">
					<Button href="/admin/dashboard/contest-groups/create" variant="outline">
						Create Contest Group
					</Button>
					<Button href="/admin/dashboard/contest-groups/create-batch" variant="outline">
						Batch Create
					</Button>
				</div>
			</div>
		</header>

		<!-- Search Bar -->
		<section class="mb-8">
			<Card>
				<CardHeader>
					<CardTitle>Search Contest Groups</CardTitle>
				</CardHeader>
				<CardContent>
					<form class="flex flex-col gap-3 sm:flex-row">
						<div class="flex flex-1 flex-col gap-2">
							<Label for="contest-group-search">Search</Label>
							<Input
								id="contest-group-search"
								type="text"
								name="q"
								value={searchInput}
								onchange={handleSearch}
								placeholder="Search by ID, title, or description..."
							/>
						</div>
						<Button type="submit" class="sm:mt-6">Search</Button>
					</form>
					{#if data.searchQuery}
						<p class="mt-3 text-sm text-[var(--text-secondary)]">
							Found {data.totalCount} result{data.totalCount !== 1 ? 's' : ''} for "{data.searchQuery}"
						</p>
					{/if}
				</CardContent>
			</Card>
		</section>

		<!-- Contest Groups Grid -->
		{#if data.contestGroups.length === 0}
			<Card>
				<CardContent class="py-12 text-center">
					<p class="text-[var(--text-secondary)]">
						{data.searchQuery
							? 'No contest groups found matching your search.'
							: 'No contest groups found.'}
					</p>
				</CardContent>
			</Card>
		{:else}
			<div class="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
				{#each data.contestGroups as group (group.id)}
					<a href="/admin/dashboard/contest-groups/view/{group.id}">
						<Card class="transition-colors hover:bg-[var(--bg-secondary)]">
							<CardHeader>
								<div class="flex items-start justify-between gap-2">
									<CardTitle class="line-clamp-2">{group.title}</CardTitle>
									<Badge
										variant={statusVariant(group.contestGroupStatus)}
										class="shrink-0 capitalize"
									>
										{formatStatus(group.contestGroupStatus)}
									</Badge>
								</div>
							</CardHeader>
							<CardContent class="flex flex-1 flex-col gap-3">
								<div>
									<p class="text-xs font-semibold text-[var(--text-secondary)]">ID</p>
									<p class="truncate font-mono text-sm text-[var(--text-primary)]">{group.id}</p>
								</div>
								{#if group.description}
									<div>
										<p class="text-xs font-semibold text-[var(--text-secondary)]">DESCRIPTION</p>
										<p class="line-clamp-3 text-sm text-[var(--text-primary)]">
											{group.description}
										</p>
									</div>
								{/if}
							</CardContent>
						</Card>
					</a>
				{/each}
			</div>

			<!-- Pagination -->
			{#if data.totalPages > 1}
				<Card>
					<CardFooter class="flex flex-wrap items-center justify-between gap-3">
						<div class="text-sm text-[var(--text-secondary)]">
							Page {data.currentPage} of {data.totalPages}
						</div>
						<div class="flex flex-wrap gap-2">
							{#if data.currentPage > 1}
								<Button
									variant="outline"
									size="sm"
									href="?q={encodeURIComponent(data.searchQuery)}&page={data.currentPage - 1}"
								>
									← Previous
								</Button>
							{/if}

							{#each { length: data.totalPages } as _, i}
								{@const pageNum = i + 1}
								{#if pageNum === data.currentPage}
									<Button size="sm" disabled>
										{pageNum}
									</Button>
								{:else if Math.abs(pageNum - data.currentPage) <= 1 || pageNum === 1 || pageNum === data.totalPages}
									<Button
										variant="outline"
										size="sm"
										href="?q={encodeURIComponent(data.searchQuery)}&page={pageNum}"
									>
										{pageNum}
									</Button>
								{:else if pageNum === 2 && data.currentPage > 3}
									<span class="px-2 py-1.5 text-[var(--text-secondary)]">…</span>
								{/if}
							{/each}

							{#if data.currentPage < data.totalPages}
								<Button
									variant="outline"
									size="sm"
									href="?q={encodeURIComponent(data.searchQuery)}&page={data.currentPage + 1}"
								>
									Next →
								</Button>
							{/if}
						</div>
					</CardFooter>
				</Card>
			{/if}
		{/if}
	</div>
</main>
