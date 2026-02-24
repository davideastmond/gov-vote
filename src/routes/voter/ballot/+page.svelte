<script lang="ts">
	import { goto } from '$app/navigation';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { submitVoterBallot } from '$lib/remotes/submit-voter-ballot.remote';
	import { onDestroy } from 'svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	type Contest = PageData['contests'][number];

	const contests = $derived(data.contests ?? []);

	let selectedChoices = $state<Record<string, string[]>>({});
	let submitted = $state(false);
	let isSubmitting = $state(false);
	let submitErrors = $state<string[]>([]);
	let redirectTimeout: ReturnType<typeof setTimeout> | null = null;

	function updateSelection(contest: Contest, itemId: string) {
		const current = selectedChoices[contest.id] ?? [];

		if (contest.maxChoices === 1) {
			selectedChoices = {
				...selectedChoices,
				[contest.id]: [itemId]
			};
			return;
		}

		if (current.includes(itemId)) {
			selectedChoices = {
				...selectedChoices,
				[contest.id]: current.filter((choice) => choice !== itemId)
			};
			return;
		}

		if (current.length < contest.maxChoices) {
			selectedChoices = {
				...selectedChoices,
				[contest.id]: [...current, itemId]
			};
		}
	}

	function isItemSelected(contestId: string, itemId: string) {
		return (selectedChoices[contestId] ?? []).includes(itemId);
	}

	function getSelectedLabels(contest: Contest) {
		const selectedIds = selectedChoices[contest.id] ?? [];
		return contest.items
			.filter((item) => selectedIds.includes(item.id))
			.map((item) => item.label)
			.join(', ');
	}

	const completedContests = $derived(
		contests.filter((contest) => (selectedChoices[contest.id] ?? []).length > 0).length
	);
	const allContestsSelected = $derived(
		contests.length > 0 && completedContests === contests.length
	);

	function endSession() {
		goto('/voter/start');
	}

	function scheduleAutoRedirect() {
		if (redirectTimeout) {
			clearTimeout(redirectTimeout);
		}

		redirectTimeout = setTimeout(() => {
			goto('/voter/start');
		}, 15000);
	}

	onDestroy(() => {
		if (redirectTimeout) {
			clearTimeout(redirectTimeout);
		}
	});

	async function submitBallot() {
		submitted = false;
		submitErrors = [];
		isSubmitting = true;

		const result = await submitVoterBallot(selectedChoices);

		if (!result?.success) {
			submitErrors = Object.values(result?.errors ?? { unknown: 'Failed to submit ballot.' });
			isSubmitting = false;
			return;
		}

		submitted = true;
		isSubmitting = false;
		scheduleAutoRedirect();
	}
</script>

<svelte:head>
	<title>Ballot - Gov Vote</title>
</svelte:head>

<main class="min-h-[calc(100vh-8rem)] bg-(--bg-primary) px-6 py-8">
	<div class="mx-auto flex w-full max-w-4xl flex-col gap-6">
		{#if submitted}
			<Card>
				<CardHeader>
					<CardTitle>Ballot submitted successfully.</CardTitle>
				</CardHeader>
				<CardContent class="text-sm text-(--text-secondary)">
					Your session will end automatically in 15 seconds.
				</CardContent>
				<CardFooter>
					<Button type="button" onclick={endSession}>End Session</Button>
				</CardFooter>
			</Card>
		{:else}
			<header class="space-y-2">
				<h1 class="text-3xl font-bold text-(--text-primary)">Your Ballot</h1>
				<p class="text-(--text-secondary)">
					Review each contest and select your choice before submitting.
				</p>
				<Badge variant="secondary">{completedContests}/{contests.length} contests completed</Badge>
			</header>

			{#if contests.length === 0}
				<Card>
					<CardContent class="py-8 text-sm text-(--text-secondary)">
						No contests are currently available for this ballot.
					</CardContent>
				</Card>
			{:else}
				{#each contests as contest}
					<Card>
						<CardHeader class="gap-2">
							<div class="flex items-center gap-2">
								<CardTitle>{contest.title}</CardTitle>
								<Badge variant="outline" class="capitalize">{contest.type}</Badge>
							</div>
							{#if contest.description}
								<p class="text-sm text-(--text-secondary)">{contest.description}</p>
							{/if}
							<p class="text-sm text-(--text-secondary)">
								{contest.maxChoices === 1
									? 'Select one option'
									: `Select up to ${contest.maxChoices} options`}
							</p>
						</CardHeader>
						<CardContent>
							<ul class="m-0 flex list-none flex-col gap-3 p-0" role="list">
								{#each contest.items as item}
									<li>
										<label
											class="flex cursor-pointer items-start gap-3 rounded-md border border-(--border-color) bg-(--bg-secondary) p-4 transition-colors hover:border-primary"
										>
											<input
												type={contest.maxChoices === 1 ? 'radio' : 'checkbox'}
												name={contest.id}
												checked={isItemSelected(contest.id, item.id)}
												onchange={() => updateSelection(contest, item.id)}
												disabled={!isItemSelected(contest.id, item.id) &&
													contest.maxChoices > 1 &&
													(selectedChoices[contest.id] ?? []).length >= contest.maxChoices}
												class="mt-1"
											/>
											<span class="flex flex-col gap-1">
												<span class="text-lg font-bold text-(--text-primary)">{item.label}</span>
												{#if item.description}
													<span class="text-sm text-(--text-secondary)">{item.description}</span>
												{/if}
											</span>
										</label>
									</li>
								{/each}
							</ul>
						</CardContent>
						<CardFooter class="text-sm text-(--text-secondary)">
							{#if (selectedChoices[contest.id] ?? []).length > 0}
								Selected: {getSelectedLabels(contest)}
							{:else}
								No selection yet
							{/if}
						</CardFooter>
					</Card>
				{/each}
			{/if}

			<Card>
				<CardHeader>
					<CardTitle>Submit Ballot</CardTitle>
				</CardHeader>
				<CardContent class="text-sm text-(--text-secondary)">
					{#if allContestsSelected}
						All contests have a selection. You can now submit your ballot.
					{:else}
						Please make a selection in each contest before submitting.
					{/if}
				</CardContent>
				<CardFooter class="flex flex-col items-start gap-3">
					<form
						onsubmit={(event) => {
							event.preventDefault();
							submitBallot();
						}}
					>
						<Button type="submit" disabled={!allContestsSelected || isSubmitting}>
							{#if isSubmitting}
								Submitting...
							{:else}
								Submit Ballot
							{/if}
						</Button>
					</form>
					{#if submitErrors.length > 0}
						<div class="w-full rounded-md border border-red-500/40 bg-red-500/10 p-3">
							<p class="m-0 mb-2 text-sm font-semibold text-red-600">Submission failed</p>
							<ul class="m-0 ml-5 list-disc p-0 text-sm text-red-600">
								{#each submitErrors as err}
									<li>{err}</li>
								{/each}
							</ul>
						</div>
					{/if}
				</CardFooter>
			</Card>
		{/if}
	</div>
</main>
