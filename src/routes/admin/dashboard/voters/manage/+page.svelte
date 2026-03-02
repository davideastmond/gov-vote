<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { formatDate } from '$lib/utils/date';
	import { getVoterCardFullAddress } from '$lib/utils/voter-card';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const searchInput = $derived(data.searchQuery);

	function handleSearchChange(e: Event) {
		const form = (e.target as HTMLInputElement).form;
		if (form) {
			form.submit();
		}
	}

	function getDisplayName(firstName: string, lastName: string): string {
		return `${firstName} ${lastName}`;
	}
</script>

<svelte:head>
	<title>Manage Voters - Gov Vote</title>
</svelte:head>

<main class="min-h-[calc(100vh-8rem)] bg-(--bg-primary) px-6 py-8">
	<div class="mx-auto w-full max-w-6xl">
		<header class="mb-8">
			<a
				href="/admin/dashboard"
				class="mb-2 inline-block text-sm text-(--text-secondary) hover:text-(--text-primary)"
			>
				← Back to Dashboard
			</a>
			<h1 class="mb-2 text-3xl font-bold text-(--text-primary)">Manage Voters</h1>
			<p class="text-(--text-secondary)">
				Search voters by name or user ID and open their details page.
			</p>
		</header>

		<section class="mb-8">
			<Card>
				<CardHeader>
					<CardTitle>Search Voters</CardTitle>
				</CardHeader>
				<CardContent>
					<form class="flex flex-col gap-3 sm:flex-row">
						<div class="flex flex-1 flex-col gap-2">
							<Label for="voter-search">Name or User ID</Label>
							<Input
								id="voter-search"
								type="text"
								name="q"
								value={searchInput}
								onchange={handleSearchChange}
								placeholder="Search by first name, last name, or user ID..."
							/>
						</div>
						<Button type="submit" class="sm:mt-6">Search</Button>
					</form>
					{#if data.hasSearched}
						<p class="mt-3 text-sm text-(--text-secondary)">
							Found {data.totalCount} result{data.totalCount !== 1 ? 's' : ''} for "{data.searchQuery}"
						</p>
					{/if}
				</CardContent>
			</Card>
		</section>

		{#if !data.hasSearched}
			<Card>
				<CardContent class="py-12 text-center">
					<p class="text-(--text-secondary)">Enter a voter name or user ID to begin searching.</p>
				</CardContent>
			</Card>
		{:else if data.voters.length === 0}
			<Card>
				<CardContent class="py-12 text-center">
					<p class="text-(--text-secondary)">No voters found matching your search.</p>
				</CardContent>
			</Card>
		{:else}
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
				{#each data.voters as voter (voter.id)}
					<a href="/admin/dashboard/voters/{voter.id}" class="block">
						<Card class="h-full transition hover:border-(--text-secondary)">
							<CardHeader>
								<CardTitle>{getDisplayName(voter.firstName, voter.lastName)}</CardTitle>
							</CardHeader>
							<CardContent class="flex flex-col gap-3">
								<div>
									<p class="text-xs font-semibold text-(--text-secondary)">USER ID</p>
									<p class="truncate font-mono text-sm text-(--text-primary)">{voter.id}</p>
								</div>

								<div>
									<p class="text-xs font-semibold text-(--text-secondary)">EMAIL</p>
									<p class="truncate text-sm text-(--text-primary)">{voter.email}</p>
								</div>
								<div>
									<p class="text-xs font-semibold text-(--text-secondary)">ADDRESS</p>
									<p class="text-sm text-(--text-primary)">
										{getVoterCardFullAddress(
											voter.streetAddress,
											voter.city,
											voter.state,
											voter.zipCode
										)}
									</p>
								</div>
								<div>
									<p class="text-xs font-semibold text-(--text-secondary)">CREATED</p>
									<p class="text-sm text-(--text-secondary)">{formatDate(voter.createdAt)}</p>
								</div>
							</CardContent>
						</Card>
					</a>
				{/each}
			</div>
		{/if}
	</div>
</main>
