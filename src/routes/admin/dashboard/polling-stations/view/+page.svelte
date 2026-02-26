<script lang="ts">
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import type { ActionData, PageData } from './$types';

	type PollingStationRow = PageData['pollingStations'][number];

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let editDialog = $state<HTMLDialogElement | null>(null);
	let editingStationId = $state('');
	let editingName = $state('');
	let editingStreetAddress = $state('');
	let editingCity = $state('');
	let editingState = $state('');
	let editingZipCode = $state('');
	let initialName = $state('');
	let initialStreetAddress = $state('');
	let initialCity = $state('');
	let initialState = $state('');
	let initialZipCode = $state('');

	const searchInput = $derived(data.searchQuery);

	function handleSearch(e: Event) {
		const form = (e.target as HTMLInputElement).form;
		if (form) {
			form.submit();
		}
	}

	function formatDate(date: Date | string): string {
		return new Date(date).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	function getFullAddress(
		streetAddress: string,
		city: string,
		state: string,
		zipCode: string
	): string {
		return `${streetAddress}, ${city}, ${state} ${zipCode}`;
	}

	function openEditModal(station: PollingStationRow) {
		editingStationId = station.id;
		editingName = station.name ?? '';
		editingStreetAddress = station.streetAddress;
		editingCity = station.city;
		editingState = station.state;
		editingZipCode = station.zipCode;
		initialName = editingName;
		initialStreetAddress = editingStreetAddress;
		initialCity = editingCity;
		initialState = editingState;
		initialZipCode = editingZipCode;
		editDialog?.showModal();
	}

	function hasUnsavedChanges() {
		return (
			editingName !== initialName ||
			editingStreetAddress !== initialStreetAddress ||
			editingCity !== initialCity ||
			editingState !== initialState ||
			editingZipCode !== initialZipCode
		);
	}

	function closeEditModal(force = false) {
		if (!force && hasUnsavedChanges()) {
			const shouldClose = window.confirm('Discard unsaved changes?');
			if (!shouldClose) return;
		}
		editDialog?.close();
	}

	function onEditDialogCancel(event: Event) {
		event.preventDefault();
		closeEditModal();
	}

	function onEditDialogClick(event: MouseEvent) {
		if (event.target === editDialog) {
			closeEditModal();
		}
	}

	$effect(() => {
		if (form?.action === 'updatePollingStation' && form?.success && editDialog?.open) {
			closeEditModal(true);
		}
	});
</script>

<svelte:head>
	<title>View Polling Stations - Gov Vote</title>
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
			<div class="flex flex-wrap items-center justify-between gap-4">
				<div>
					<h1 class="mb-2 text-3xl font-bold text-(--text-primary)">Polling Stations</h1>
					<p class="text-(--text-secondary)">
						Search and view polling stations ({data.totalCount} total)
					</p>
				</div>
				<Button href="/admin/dashboard/polling-stations/create" variant="outline">
					Create Polling Station
				</Button>
			</div>
		</header>

		{#if form?.message}
			<Alert variant={form.success ? 'default' : 'destructive'} class="mb-6">
				<AlertTitle>{form.success ? 'Success' : 'Update failed'}</AlertTitle>
				<AlertDescription>{form.message}</AlertDescription>
			</Alert>
		{/if}

		<section class="mb-8">
			<Card>
				<CardHeader>
					<CardTitle>Search by Address</CardTitle>
				</CardHeader>
				<CardContent>
					<form class="flex flex-col gap-3 sm:flex-row">
						<div class="flex flex-1 flex-col gap-2">
							<Label for="polling-station-search">Address Search</Label>
							<Input
								id="polling-station-search"
								type="text"
								name="q"
								value={searchInput}
								onchange={handleSearch}
								placeholder="Search by street, city, state, or zip code..."
							/>
						</div>
						<Button type="submit" class="sm:mt-6">Search</Button>
					</form>
					{#if data.searchQuery}
						<p class="mt-3 text-sm text-(--text-secondary)">
							Found {data.totalCount} result{data.totalCount !== 1 ? 's' : ''} for "{data.searchQuery}"
						</p>
					{/if}
				</CardContent>
			</Card>
		</section>

		{#if data.pollingStations.length === 0}
			<Card>
				<CardContent class="py-12 text-center">
					<p class="text-(--text-secondary)">
						{data.searchQuery
							? 'No polling stations found matching your address search.'
							: 'No polling stations found.'}
					</p>
				</CardContent>
			</Card>
		{:else}
			<div class="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
				{#each data.pollingStations as station (station.id)}
					<Card>
						<CardHeader>
							<CardTitle>{station.name || 'Unnamed Polling Station'}</CardTitle>
						</CardHeader>
						<CardContent class="flex flex-col gap-3">
							<div>
								<p class="text-xs font-semibold text-(--text-secondary)">STATION ID</p>
								<p class="truncate font-mono text-sm text-(--text-primary)">{station.id}</p>
							</div>
							<div>
								<p class="text-xs font-semibold text-(--text-secondary)">ADDRESS</p>
								<p class="text-sm text-(--text-primary)">
									{getFullAddress(
										station.streetAddress,
										station.city,
										station.state,
										station.zipCode
									)}
								</p>
							</div>
							<div>
								<p class="text-xs font-semibold text-(--text-secondary)">CREATED</p>
								<p class="text-sm text-(--text-secondary)">{formatDate(station.createdAt)}</p>
							</div>
						</CardContent>
						<CardFooter>
							<Button variant="outline" size="sm" onclick={() => openEditModal(station)}>
								Edit
							</Button>
						</CardFooter>
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
									<span class="px-2 py-1.5 text-(--text-secondary)">…</span>
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

<dialog
	bind:this={editDialog}
	oncancel={onEditDialogCancel}
	onclick={onEditDialogClick}
	class="w-full max-w-xl rounded-lg border border-(--border-primary) bg-(--bg-primary) p-0 text-(--text-primary)"
>
	<div class="bg-white p-6 dark:bg-black">
		<div class="mb-4 flex items-center justify-between">
			<h2 class="text-xl font-semibold">Edit Polling Station</h2>
			<Button type="button" variant="outline" size="sm" onclick={closeEditModal}>Close</Button>
		</div>
		<form method="POST" action="?/updatePollingStation" class="space-y-4">
			<input type="hidden" name="pollingStationId" value={editingStationId} />
			<div class="space-y-2">
				<Label for="edit-name">Name</Label>
				<Input id="edit-name" name="name" bind:value={editingName} />
			</div>
			<div class="space-y-2">
				<Label for="edit-street-address">Street Address</Label>
				<Input
					id="edit-street-address"
					name="streetAddress"
					bind:value={editingStreetAddress}
					required
				/>
			</div>
			<div class="grid grid-cols-1 gap-3 md:grid-cols-3">
				<div class="space-y-2 md:col-span-1">
					<Label for="edit-city">City</Label>
					<Input id="edit-city" name="city" bind:value={editingCity} required />
				</div>
				<div class="space-y-2 md:col-span-1">
					<Label for="edit-state">State</Label>
					<Input id="edit-state" name="state" bind:value={editingState} required />
				</div>
				<div class="space-y-2 md:col-span-1">
					<Label for="edit-zip-code">Zip Code</Label>
					<Input id="edit-zip-code" name="zipCode" bind:value={editingZipCode} required />
				</div>
			</div>
			<div class="flex justify-end gap-2 pt-2">
				<Button type="button" variant="outline" onclick={closeEditModal}>Cancel</Button>
				<Button type="submit">Save Changes</Button>
			</div>
		</form>
	</div>
</dialog>
