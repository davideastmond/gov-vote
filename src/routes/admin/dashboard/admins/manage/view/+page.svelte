<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let searchInput = $state(data.searchQuery);

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
			<a
				href="/admin/dashboard/admins/manage"
				class="mb-2 inline-block text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
			>
				&larr; Back to Manage Admins
			</a>
			<h1 class="mb-2 text-3xl font-bold text-[var(--text-primary)]">Edit Admins</h1>
			<p class="text-[var(--text-secondary)]">
				Search and view admin accounts ({data.totalCount} total)
			</p>
		</header>

		<!-- Search Bar -->
		<section class="mb-8">
			<Card>
				<CardHeader>
					<CardTitle>Search Admins</CardTitle>
				</CardHeader>
				<CardContent>
					<form class="flex flex-col gap-3 sm:flex-row">
						<div class="flex flex-1 flex-col gap-2">
							<Label for="admin-search">Search</Label>
							<Input
								id="admin-search"
								type="text"
								name="q"
								value={searchInput}
								onchange={handleSearch}
								placeholder="Search by username, name, or email..."
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

		<!-- Admins Grid -->
		{#if data.admins.length === 0}
			<Card>
				<CardContent class="py-12 text-center">
					<p class="text-[var(--text-secondary)]">
						{data.searchQuery ? 'No admins found matching your search.' : 'No admins found.'}
					</p>
				</CardContent>
			</Card>
		{:else}
			<div class="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
				{#each data.admins as admin (admin.id)}
					<Card>
						<CardHeader>
							<CardTitle>{getDisplayName(admin.firstName, admin.lastName)}</CardTitle>
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
								<Button size="sm" variant="outline" class="flex-1">Edit</Button>
								<Button size="sm" variant="destructive" class="flex-1">Deactivate</Button>
							</div>
						</CardContent>
					</Card>
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
