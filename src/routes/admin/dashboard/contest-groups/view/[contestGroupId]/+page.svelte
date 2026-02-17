<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Separator } from '$lib/components/ui/separator';

	let { data } = $props();

	// Extract contest group basic info from the first row (all rows have the same contest group data)
	const contestGroupInfo = data.contestGroupBasics?.[0];

	// Group polling stations (deduplicate by polling station ID)
	const pollingStations = data.contestGroupBasics?.reduce(
		(acc, row) => {
			if (!acc.find((ps) => ps.id === row.pollingStationId)) {
				acc.push({
					id: row.pollingStationId,
					name: row.pollingStationName,
					streetAddress: row.pollingStationStreetAddress,
					city: row.pollingStationCity,
					state: row.pollingStationState,
					zipCode: row.pollingStationZipCode
				});
			}
			return acc;
		},
		[] as Array<{
			id: string;
			name: string | null;
			streetAddress: string;
			city: string;
			state: string;
			zipCode: string;
		}>
	);

	// Group ballot contests by contest title
	const contests = data.ballotContests?.reduce(
		(acc, row) => {
			let contest = acc.find((c) => c.title === row.contestTitle);
			if (!contest) {
				contest = {
					title: row.contestTitle,
					description: row.contestDescription,
					items: []
				};
				acc.push(contest);
			}
			contest.items.push({
				id: row.contestItemId,
				title: row.contestItemTitle,
				auxiliaryText: row.contestItemAuxiliaryText,
				type: row.contestItemType
			});
			return acc;
		},
		[] as Array<{
			title: string;
			description: string | null;
			items: Array<{
				id: string;
				title: string;
				auxiliaryText: string | null;
				type: 'candidate' | 'initiative' | 'other';
			}>;
		}>
	);
</script>

<svelte:head>
	<title>{contestGroupInfo?.contestGroupTitle || 'Contest Group'} - Admin Dashboard</title>
</svelte:head>

<main class="min-h-[calc(100vh-8rem)] bg-[var(--bg-primary)] px-6 py-8">
	<div class="mx-auto flex w-full max-w-6xl flex-col gap-6">
		<!-- Header -->
		<div class="flex flex-wrap items-center justify-between gap-4">
			<div>
				<a
					href="/admin/dashboard"
					class="mb-2 inline-block text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
				>
					← Back to Dashboard
				</a>
				<h1 class="text-3xl font-bold text-[var(--text-primary)]">
					{contestGroupInfo?.contestGroupTitle || 'Contest Group'}
				</h1>
				{#if contestGroupInfo?.contestGroupDescription}
					<p class="mt-1 text-[var(--text-secondary)]">
						{contestGroupInfo.contestGroupDescription}
					</p>
				{/if}
			</div>
			<Button variant="outline">Edit Contest Group</Button>
		</div>

		<!-- Polling Stations -->
		<Card>
			<CardHeader>
				<CardTitle>Polling Stations</CardTitle>
			</CardHeader>
			<CardContent>
				{#if pollingStations && pollingStations.length > 0}
					<div class="space-y-3">
						{#each pollingStations as station}
							<div class="rounded-md border p-3">
								{#if station.name}
									<p class="font-medium text-[var(--text-primary)]">{station.name}</p>
								{/if}
								<p class="text-sm text-[var(--text-secondary)]">
									{station.streetAddress}, {station.city}, {station.state}
									{station.zipCode}
								</p>
							</div>
						{/each}
					</div>
				{:else}
					<p class="text-sm text-[var(--text-secondary)]">No polling stations configured.</p>
				{/if}
			</CardContent>
		</Card>

		<!-- Contests -->
		<Card>
			<CardHeader>
				<CardTitle>Contests ({contests?.length || 0})</CardTitle>
			</CardHeader>
			<CardContent>
				{#if contests && contests.length > 0}
					<div class="space-y-6">
						{#each contests as contest, idx}
							<div>
								{#if idx > 0}
									<Separator class="mb-6" />
								{/if}
								<h3 class="mb-1 text-lg font-semibold text-[var(--text-primary)]">
									{contest.title}
								</h3>
								{#if contest.description}
									<p class="mb-3 text-sm text-[var(--text-secondary)]">{contest.description}</p>
								{/if}
								<div class="space-y-2">
									{#each contest.items as item}
										<div class="flex items-center justify-between rounded-md border p-3">
											<div>
												<p class="font-medium text-[var(--text-primary)]">{item.title}</p>
												{#if item.auxiliaryText}
													<p class="text-sm text-[var(--text-secondary)]">{item.auxiliaryText}</p>
												{/if}
											</div>
											<Badge variant="secondary" class="capitalize">
												{item.type}
											</Badge>
										</div>
									{/each}
								</div>
							</div>
						{/each}
					</div>
				{:else}
					<p class="text-sm text-[var(--text-secondary)]">No contests configured.</p>
				{/if}
			</CardContent>
		</Card>
	</div>
</main>
