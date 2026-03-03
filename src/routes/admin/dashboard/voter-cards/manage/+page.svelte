<script lang="ts">
	import AdminNavToolbar from '$lib/components/AdminNavToolbar.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import {
		formatVoterCardStatus,
		getVoterCardFullAddress,
		getVoterCardFullName,
		getVoterCardStatusVariant
	} from '$lib/utils/voter-card';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const searchInput = $derived(data.searchQuery);
	const selectedStatus = $derived(data.selectedStatus);

	function handleSearch(e: Event) {
		const form = (e.target as HTMLInputElement | HTMLSelectElement).form;
		if (form) {
			form.submit();
		}
	}
</script>

<svelte:head>
	<title>Manage Voter Cards - Gov Vote</title>
</svelte:head>

<main class="min-h-[calc(100vh-8rem)] bg-(--bg-primary) px-6 py-8">
	<div class="mx-auto w-full max-w-6xl">
		<AdminNavToolbar primary={{ label: '← Back to Admin Dashboard', href: '/admin/dashboard' }} />

		<header class="mb-8">
			<h1 class="mb-2 text-3xl font-bold text-(--text-primary)">Voter Cards</h1>
			<p class="text-(--text-secondary)">
				Search and manage voter cards ({data.totalCount} total)
			</p>
		</header>

		<section class="mb-8">
			<Card>
				<CardHeader>
					<CardTitle>Search and Filter</CardTitle>
				</CardHeader>
				<CardContent>
					<form class="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_220px_auto] sm:items-end">
						<div class="flex flex-col gap-2">
							<Label for="voter-card-search">Search</Label>
							<Input
								id="voter-card-search"
								type="text"
								name="q"
								value={searchInput}
								onchange={handleSearch}
								placeholder="Search by name, address, card number, or contest group..."
							/>
						</div>

						<div class="flex flex-col gap-2">
							<Label for="status-filter">Voter Card Status</Label>
							<select
								id="status-filter"
								name="status"
								class="h-10 rounded-md border border-(--border-primary) bg-(--bg-primary) px-3 text-sm text-(--text-primary)"
								value={selectedStatus}
								onchange={handleSearch}
							>
								{#each data.statusFilters as status}
									<option value={status}>
										{status === 'all' ? 'All statuses' : formatVoterCardStatus(status)}
									</option>
								{/each}
							</select>
						</div>

						<div class="flex gap-2">
							<Button type="submit">Search</Button>
							{#if data.searchQuery || data.selectedStatus !== 'all'}
								<Button variant="outline" href="/admin/dashboard/voter-cards/manage">
									Reset filters
								</Button>
							{/if}
						</div>
					</form>

					{#if data.searchQuery || data.selectedStatus !== 'all'}
						<p class="mt-3 text-sm text-(--text-secondary)">
							Showing {data.totalCount} result{data.totalCount !== 1 ? 's' : ''}
							{#if data.searchQuery}
								for "{data.searchQuery}"
							{/if}
							{#if data.selectedStatus !== 'all'}
								with status "{formatVoterCardStatus(data.selectedStatus)}"
							{/if}
						</p>
					{/if}
				</CardContent>
			</Card>
		</section>

		{#if data.voterCards.length === 0}
			<Card>
				<CardContent class="py-12 text-center">
					<p class="text-(--text-secondary)">
						No voter cards found for the current search and filter.
					</p>
				</CardContent>
			</Card>
		{:else}
			<div class="mb-8 space-y-4">
				{#each data.voterCards as card (card.id)}
					<Card>
						<CardHeader>
							<div class="flex flex-wrap items-start justify-between gap-3">
								<div>
									<CardTitle class="font-mono text-base">{card.cardNumber}</CardTitle>
									<p class="mt-1 text-sm text-(--text-secondary)">
										{getVoterCardFullName(card.firstName, card.lastName)}
									</p>
								</div>
								<div class="flex items-center gap-2">
									<Badge variant={getVoterCardStatusVariant(card.status)} class="capitalize">
										{formatVoterCardStatus(card.status)}
									</Badge>
									<Button
										variant="outline"
										size="icon-sm"
										href="/admin/dashboard/voter-cards/manage/{card.id}"
										aria-label="View voter card details"
									>
										<ChevronRightIcon class="size-4" />
									</Button>
								</div>
							</div>
						</CardHeader>
						<CardContent class="grid grid-cols-1 gap-3 md:grid-cols-2">
							<div>
								<p class="text-xs font-semibold text-(--text-secondary)">CONTEST GROUP</p>
								<p class="text-sm text-(--text-primary)">{card.contestGroupName}</p>
							</div>
							<div>
								<p class="text-xs font-semibold text-(--text-secondary)">ADDRESS</p>
								<p class="text-sm text-(--text-primary)">
									{getVoterCardFullAddress(card.streetAddress, card.city, card.state, card.zipCode)}
								</p>
							</div>
						</CardContent>
					</Card>
				{/each}
			</div>

			{#if data.totalPages > 1}
				<Card>
					<CardFooter class="flex flex-wrap items-center justify-between gap-3">
						<div class="text-sm text-(--text-secondary)">
							Page {data.currentPage} of {data.totalPages}
						</div>
						<div class="flex flex-wrap gap-2">
							{#if data.currentPage > 1}
								<Button
									variant="outline"
									size="sm"
									href="?q={encodeURIComponent(
										data.searchQuery
									)}&status={data.selectedStatus}&page={data.currentPage - 1}"
								>
									← Previous
								</Button>
							{/if}

							{#each { length: data.totalPages } as _, i}
								{@const pageNum = i + 1}
								{#if pageNum === data.currentPage}
									<Button size="sm" disabled>{pageNum}</Button>
								{:else if Math.abs(pageNum - data.currentPage) <= 1 || pageNum === 1 || pageNum === data.totalPages}
									<Button
										variant="outline"
										size="sm"
										href="?q={encodeURIComponent(
											data.searchQuery
										)}&status={data.selectedStatus}&page={pageNum}"
									>
										{pageNum}
									</Button>
								{:else if pageNum === 2 && data.currentPage > 3}
									<span class="px-2 py-1.5 text-(--text-secondary)">…</span>
								{/if}
							{/each}

							{#if data.currentPage < data.totalPages}
								<Button
									variant="outline"
									size="sm"
									href="?q={encodeURIComponent(
										data.searchQuery
									)}&status={data.selectedStatus}&page={data.currentPage + 1}"
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
