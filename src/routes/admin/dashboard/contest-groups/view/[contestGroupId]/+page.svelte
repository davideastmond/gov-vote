<script lang="ts">
	import AdminNavToolbar from '$lib/components/AdminNavToolbar.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Separator } from '$lib/components/ui/separator';

	let { data } = $props();

	// Extract contest group basic info from the first row (all rows have the same contest group data)

	// svelte-ignore state_referenced_locally
	const { contestGroupData, ballotContests } = data;

	// Group polling stations (deduplicate by polling station ID)
	const pollingStations = contestGroupData?.reduce(
		(acc, row) => {
			if (!acc.find((ps) => ps.id === row.pollingStationId)) {
				acc.push({
					id: row.pollingStationId as string,
					name: row.pollingStationName,
					streetAddress: row.pollingStationStreetAddress as string,
					city: row.pollingStationCity as string,
					state: row.pollingStationState as string,
					zipCode: row.pollingStationZipCode as string
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
	const contests = ballotContests?.reduce(
		(acc, row) => {
			let contest = acc.find((c) => c.title === row.contestTitle);
			if (!contest) {
				contest = {
					title: row.contestTitle,
					description: row.contestDescription,
					status: row.contestStatus,
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
			status: 'upcoming' | 'active' | 'closed' | null;
			items: Array<{
				id: string;
				title: string;
				auxiliaryText: string | null;
				type: 'candidate' | 'initiative' | 'other';
			}>;
		}>
	);

	function displayAttribute(value: string | null | undefined) {
		if (!value || value.trim().length === 0) return 'not specified';
		return value;
	}

	function formatStatus(status: 'upcoming' | 'active' | 'closed' | null | undefined) {
		if (!status) return 'Not specified';
		return status.charAt(0).toUpperCase() + status.slice(1);
	}

	function statusVariant(status: 'upcoming' | 'active' | 'closed' | null | undefined) {
		if (status === 'closed') return 'destructive' as const;
		if (status === 'upcoming') return 'secondary' as const;
		return 'default' as const;
	}
</script>

<svelte:head>
	<title>{contestGroupData[0]?.contestGroupTitle || 'Contest Group'} - Admin Dashboard</title>
</svelte:head>

<main class="min-h-[calc(100vh-8rem)] bg-[var(--bg-primary)] px-6 py-8">
	<div class="mx-auto flex w-full max-w-6xl flex-col gap-6">
		<AdminNavToolbar
			primary={{ label: '← Back to Admin Dashboard', href: '/admin/dashboard' }}
			secondary={{ label: 'Back to Contest Groups', href: '/admin/dashboard/contest-groups/view' }}
		/>

		<!-- Header -->
		<div class="flex flex-wrap items-center justify-between gap-4">
			<div>
				<h1 class="text-3xl font-bold text-[var(--text-primary)]">
					{contestGroupData[0]?.contestGroupTitle || 'Contest Group'}
				</h1>
				{#if contestGroupData[0]?.contestGroupDescription}
					<p class="mt-1 text-[var(--text-secondary)]">
						{contestGroupData[0].contestGroupDescription}
					</p>
				{/if}
			</div>
			{#if contestGroupData.length > 0}
				<Button
					variant="outline"
					href={`/admin/dashboard/contest-groups/edit/${contestGroupData[0]?.contestGroupId}`}
				>
					Edit Contest Group</Button
				>
			{/if}
		</div>

		<!-- Status -->
		<Card>
			<CardHeader>
				<CardTitle>Status</CardTitle>
			</CardHeader>
			<CardContent>
				<Badge variant={statusVariant(contestGroupData[0]?.contestGroupStatus)} class="capitalize">
					{formatStatus(contestGroupData[0]?.contestGroupStatus)}
				</Badge>
			</CardContent>
		</Card>

		<!-- Polling Stations -->
		<Card>
			<CardHeader>
				<CardTitle>Polling Stations</CardTitle>
			</CardHeader>
			<CardContent>
				{#if pollingStations && pollingStations.length > 0}
					<div class="space-y-3">
						{#each pollingStations as station}
							<div class="space-y-3 rounded-md border p-3">
								<section class="space-y-1">
									<p
										class="text-xs font-semibold tracking-wide text-[var(--text-secondary)] uppercase"
									>
										Name
									</p>
									<p class="text-sm text-[var(--text-primary)]">
										{displayAttribute(station.name)}
									</p>
								</section>
								<section class="space-y-1">
									<p
										class="text-xs font-semibold tracking-wide text-[var(--text-secondary)] uppercase"
									>
										Street Address
									</p>
									<p class="text-sm text-[var(--text-primary)]">
										{displayAttribute(station.streetAddress)}
									</p>
								</section>
								<section class="space-y-1">
									<p
										class="text-xs font-semibold tracking-wide text-[var(--text-secondary)] uppercase"
									>
										City
									</p>
									<p class="text-sm text-[var(--text-primary)]">{displayAttribute(station.city)}</p>
								</section>
								<section class="space-y-1">
									<p
										class="text-xs font-semibold tracking-wide text-[var(--text-secondary)] uppercase"
									>
										State
									</p>
									<p class="text-sm text-[var(--text-primary)]">
										{displayAttribute(station.state)}
									</p>
								</section>
								<section class="space-y-1">
									<p
										class="text-xs font-semibold tracking-wide text-[var(--text-secondary)] uppercase"
									>
										Zip Code
									</p>
									<p class="text-sm text-[var(--text-primary)]">
										{displayAttribute(station.zipCode)}
									</p>
								</section>
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
								<div class="mb-1 flex items-center justify-between gap-3">
									<h3 class="text-lg font-semibold text-[var(--text-primary)]">{contest.title}</h3>
									<Badge variant={statusVariant(contest.status)} class="capitalize">
										{formatStatus(contest.status)}
									</Badge>
								</div>
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
