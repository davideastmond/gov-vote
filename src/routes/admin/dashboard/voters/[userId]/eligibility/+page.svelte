<script lang="ts">
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let modal = $state<HTMLDialogElement | null>(null);
	let searchTerm = $state('');
	let selectedGroup = $state<PageData['contestGroups'][number] | null>(null);
	let selectedContestIds = $state<string[]>([]);

	const eligibleContestGroups = $derived(
		data.contestGroups.filter((group) => group.selectedContestIds.length > 0)
	);

	const filteredContestGroups = $derived.by(() => {
		const normalized = searchTerm.trim().toLowerCase();
		if (!normalized) return data.contestGroups;

		return data.contestGroups.filter(
			(group) =>
				group.title.toLowerCase().includes(normalized) ||
				group.id.toLowerCase().includes(normalized)
		);
	});

	function openGroupModal(group: PageData['contestGroups'][number]) {
		selectedGroup = group;
		selectedContestIds = [...group.selectedContestIds];
		modal?.showModal();
	}

	function closeModal() {
		modal?.close();
	}

	function onDialogCancel(event: Event) {
		event.preventDefault();
		closeModal();
	}

	function onDialogClick(event: MouseEvent) {
		if (event.target === modal) {
			closeModal();
		}
	}

	$effect(() => {
		if (form?.action === 'updateEligibility' && form?.success && modal?.open) {
			closeModal();
		}
	});
</script>

<svelte:head>
	<title>Edit Voter Eligibilities - Gov Vote</title>
</svelte:head>

<main class="min-h-[calc(100vh-8rem)] bg-(--bg-primary) px-6 py-8">
	<div class="mx-auto flex w-full max-w-6xl flex-col gap-6">
		<header>
			<a
				href="/admin/dashboard/voters/{data.voter.id}"
				class="mb-2 inline-block text-sm text-(--text-secondary) hover:text-(--text-primary)"
			>
				← Back to Voter Details
			</a>
			<h1 class="text-3xl font-bold text-(--text-primary)">Edit Voter Eligibilities</h1>
			<p class="mt-1 text-(--text-secondary)">
				{data.voter.firstName}
				{data.voter.lastName} ({data.voter.id})
			</p>
		</header>

		{#if form?.message}
			<Alert variant={form.success ? 'default' : 'destructive'}>
				<AlertTitle>{form.success ? 'Success' : 'Update failed'}</AlertTitle>
				<AlertDescription>{form.message}</AlertDescription>
			</Alert>
		{/if}

		<Card>
			<CardHeader>
				<CardTitle>Voter Details</CardTitle>
			</CardHeader>
			<CardContent class="grid grid-cols-1 gap-4 md:grid-cols-3">
				<div>
					<p class="text-xs font-semibold text-(--text-secondary)">NAME</p>
					<p class="text-sm text-(--text-primary)">
						{data.voter.firstName}
						{data.voter.lastName}
					</p>
				</div>
				<div>
					<p class="text-xs font-semibold text-(--text-secondary)">VOTER ID</p>
					<p class="truncate font-mono text-sm text-(--text-primary)">{data.voter.id}</p>
				</div>
				<div>
					<p class="text-xs font-semibold text-(--text-secondary)">EMAIL</p>
					<p class="truncate text-sm text-(--text-primary)">{data.voter.email}</p>
				</div>
			</CardContent>
		</Card>

		<Card>
			<CardHeader>
				<CardTitle>Eligible Contest Groups</CardTitle>
			</CardHeader>
			<CardContent>
				{#if eligibleContestGroups.length === 0}
					<p class="text-sm text-(--text-secondary)">
						This voter is not currently eligible for any contest groups.
					</p>
				{:else}
					<div class="space-y-3">
						{#each eligibleContestGroups as group (group.id)}
							<div class="rounded-md border border-(--border-primary) p-3">
								<p class="text-sm font-semibold text-(--text-primary)">{group.title}</p>
								<p class="truncate font-mono text-xs text-(--text-secondary)">{group.id}</p>
								<p class="mt-1 text-xs text-(--text-secondary)">
									Eligible contests: {group.selectedContestIds.length}
								</p>
							</div>
						{/each}
					</div>
				{/if}
			</CardContent>
		</Card>

		<Card>
			<CardHeader>
				<CardTitle>Search Contest Groups</CardTitle>
			</CardHeader>
			<CardContent class="space-y-2">
				<Label for="contest-group-search">Contest Group Name or ID</Label>
				<Input
					id="contest-group-search"
					type="text"
					bind:value={searchTerm}
					placeholder="Type to filter contest groups by name or ID..."
				/>
				<p class="text-sm text-(--text-secondary)">
					Showing {filteredContestGroups.length} of {data.contestGroups.length} contest groups
				</p>
			</CardContent>
		</Card>

		{#if filteredContestGroups.length === 0}
			<Card>
				<CardContent class="py-12 text-center text-(--text-secondary)">
					No contest groups match your search.
				</CardContent>
			</Card>
		{:else}
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
				{#each filteredContestGroups as group (group.id)}
					<button type="button" class="text-left" onclick={() => openGroupModal(group)}>
						<Card class="h-full transition hover:border-(--text-secondary)">
							<CardHeader class="space-y-2">
								<div class="flex items-center justify-between gap-2">
									<CardTitle class="text-base">{group.title}</CardTitle>
									<Badge variant="outline" class="capitalize">{group.status}</Badge>
								</div>
							</CardHeader>
							<CardContent class="space-y-2">
								<p class="text-xs font-semibold text-(--text-secondary)">CONTEST GROUP ID</p>
								<p class="truncate font-mono text-sm text-(--text-primary)">{group.id}</p>
								<p class="text-xs font-semibold text-(--text-secondary)">CONTESTS</p>
								<p class="text-sm text-(--text-primary)">{group.contests.length}</p>
								<p class="text-xs font-semibold text-(--text-secondary)">ELIGIBLE CONTESTS</p>
								<p class="text-sm text-(--text-primary)">{group.selectedContestIds.length}</p>
							</CardContent>
						</Card>
					</button>
				{/each}
			</div>
		{/if}
	</div>
</main>

<dialog
	bind:this={modal}
	oncancel={onDialogCancel}
	onclick={onDialogClick}
	class="w-full max-w-2xl rounded-lg border border-(--border-primary) bg-(--bg-primary) p-0 text-(--text-primary)"
>
	{#if selectedGroup}
		<div class="bg-white p-6 dark:bg-black">
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-xl font-semibold">{selectedGroup.title}</h2>
				<Button type="button" variant="outline" size="sm" onclick={closeModal}>Close</Button>
			</div>

			<div class="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2">
				<div>
					<p class="text-xs font-semibold text-(--text-secondary)">CONTEST GROUP ID</p>
					<p class="font-mono text-sm text-(--text-primary)">{selectedGroup.id}</p>
				</div>
				<div>
					<p class="text-xs font-semibold text-(--text-secondary)">POLLING STATION</p>
					<p class="text-sm text-(--text-primary)">
						{selectedGroup.pollingStationName ?? 'No polling station configured'}
					</p>
				</div>
			</div>

			{#if selectedGroup.description}
				<p class="mb-4 text-sm text-(--text-secondary)">{selectedGroup.description}</p>
			{/if}

			<form method="POST" action="?/updateEligibility" class="space-y-4">
				<input type="hidden" name="contestGroupId" value={selectedGroup.id} />
				<input type="hidden" name="pollingStationId" value={selectedGroup.pollingStationId ?? ''} />

				<div class="space-y-2">
					<p class="text-sm font-semibold text-(--text-primary)">Contest Eligibilities</p>
					<div
						class="max-h-72 space-y-2 overflow-y-auto rounded-md border border-(--border-primary) p-3"
					>
						{#each selectedGroup.contests as groupContest (groupContest.id)}
							<label
								for={groupContest.id}
								class="flex cursor-pointer items-start gap-2 rounded-sm p-1 hover:bg-(--bg-secondary)"
							>
								<input
									id={groupContest.id}
									type="checkbox"
									name="contestIds"
									value={groupContest.id}
									bind:group={selectedContestIds}
								/>
								<span class="flex-1">
									<span class="block text-sm text-(--text-primary)">{groupContest.title}</span>
									{#if groupContest.description}
										<span class="text-xs text-(--text-secondary)">{groupContest.description}</span>
									{/if}
								</span>
							</label>
						{/each}
					</div>
				</div>

				{#if !selectedGroup.pollingStationId}
					<Alert variant="destructive">
						<AlertTitle>Missing polling station</AlertTitle>
						<AlertDescription>
							This contest group has no polling station assignment, so eligibilities cannot be
							updated.
						</AlertDescription>
					</Alert>
				{/if}

				<div class="flex flex-wrap gap-2 pt-2">
					<Button
						type="submit"
						name="actionType"
						value="update"
						variant="outline"
						disabled={!selectedGroup.pollingStationId}
					>
						Update eligibilities
					</Button>
					<Button
						type="submit"
						name="actionType"
						value="updateAndGenerateCard"
						disabled={!selectedGroup.pollingStationId}
					>
						Update eligibilities and generate voterCard
					</Button>
				</div>
			</form>
		</div>
	{/if}
</dialog>
