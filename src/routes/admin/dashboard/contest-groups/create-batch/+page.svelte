<script lang="ts">
	import { goto } from '$app/navigation';
	import AdminNavToolbar from '$lib/components/AdminNavToolbar.svelte';
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Label } from '$lib/components/ui/label';
	import type { PollingStationAddress } from '$lib/definitions/address';
	import type { Contest } from '$lib/definitions/contest-group';

	const batchJsonPlaceholder = JSON.stringify(
		{
			contestGroups: [
				{
					title: '2026 General Election',
					description: 'Citywide elections',
					adminIds: [
						'11111111-1111-4111-8111-111111111111',
						'22222222-2222-4222-8222-222222222222'
					],
					contests: [
						{
							title: 'Mayor',
							contestStatus: 'upcoming',
							items: [{ title: 'Candidate A', contestItemType: 'candidate' }]
						}
					],
					pollingStationAddresses: [
						{
							name: 'Central High School',
							streetAddress: '123 Main St',
							city: 'Springfield',
							state: 'IL',
							zipCode: '62701'
						}
					]
				}
			]
		},
		null,
		2
	);

	type BatchContestGroupInput = {
		id?: string;
		title?: string;
		description?: string;
		adminIds?: string[];
		contests?: Contest[];
		pollingStationAddresses?: PollingStationAddress[];
	};

	type BatchContestGroupRequest = {
		contestGroups: BatchContestGroupInput[];
	};

	let batchJsonPayload = $state('');
	let isBatchSubmitting = $state(false);
	let batchSubmitError = $state<string | null>(null);
	let batchSubmitSummary = $state<{
		created: number;
		failed: number;
		createdIds: string[];
		errors: string[];
	} | null>(null);

	function parseBatchRequest(raw: string): BatchContestGroupRequest {
		const parsed = JSON.parse(raw) as unknown;

		if (!parsed || typeof parsed !== 'object' || !('contestGroups' in parsed)) {
			throw new Error('JSON must be an object with a contestGroups array.');
		}

		const contestGroups = (parsed as { contestGroups?: unknown }).contestGroups;
		if (!Array.isArray(contestGroups) || contestGroups.length === 0) {
			throw new Error('contestGroups must be a non-empty array.');
		}

		return { contestGroups: contestGroups as BatchContestGroupInput[] };
	}

	async function handleBatchSubmit() {
		batchSubmitError = null;
		batchSubmitSummary = null;

		if (!batchJsonPayload.trim()) {
			batchSubmitError = 'Paste a JSON payload before submitting.';
			return;
		}

		isBatchSubmitting = true;

		try {
			const parsed = parseBatchRequest(batchJsonPayload);
			const response = await fetch('/api/contest-groups', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(parsed)
			});

			const responseBody = (await response.json()) as {
				success?: boolean;
				message?: string;
				error?: string;
				details?: string[];
				data?: {
					createdContestGroupIds?: string[];
					failedContestGroups?: Array<{ index: number; title: string; error: string }>;
				};
			};

			const createdIds = responseBody.data?.createdContestGroupIds ?? [];
			const failedGroups = responseBody.data?.failedContestGroups ?? [];

			if (!response.ok) {
				const validationErrors = responseBody.details?.join(', ');
				batchSubmitError =
					validationErrors || responseBody.message || responseBody.error || 'Batch import failed.';
				return;
			}

			batchSubmitSummary = {
				created: createdIds.length,
				failed: failedGroups.length,
				createdIds,
				errors: failedGroups.map(
					(group) => `${group.title || `Group #${group.index + 1}`}: ${group.error}`
				)
			};

			if (createdIds.length === 0 && failedGroups.length === 0) {
				batchSubmitError = responseBody.message || 'No contest groups were created.';
			}
		} catch (error) {
			batchSubmitError = error instanceof Error ? error.message : 'Invalid JSON payload.';
		} finally {
			isBatchSubmitting = false;
		}
	}

	function handleLoadSampleJson() {
		batchJsonPayload = batchJsonPlaceholder;
		batchSubmitError = null;
		batchSubmitSummary = null;
	}

	async function handleOpenFirstCreatedGroup() {
		const firstCreatedId = batchSubmitSummary?.createdIds[0];
		if (!firstCreatedId) return;
		await goto(`/admin/dashboard/contest-groups/view/${firstCreatedId}`);
	}
</script>

<svelte:head>
	<title>Batch Create Contest Groups - Gov Vote</title>
</svelte:head>

<main class="min-h-[calc(100vh-8rem)] bg-[var(--bg-primary)] px-6 py-8">
	<div class="mx-auto flex w-full max-w-5xl flex-col gap-6">
		<AdminNavToolbar
			primary={{ label: '← Back to Admin Dashboard', href: '/admin/dashboard' }}
			secondary={{ label: 'Create Contest Group', href: '/admin/dashboard/contest-groups/create' }}
		/>

		<header>
			<h1 class="mb-2 text-3xl font-bold text-[var(--text-primary)]">
				Batch Create Contest Groups
			</h1>
			<p class="text-[var(--text-secondary)]">
				Paste a JSON payload with a contestGroups array to create multiple contest groups in one
				run.
			</p>
		</header>

		<Card>
			<CardHeader class="gap-2">
				<CardTitle>Batch Create via JSON</CardTitle>
				<p class="text-sm text-[var(--text-secondary)]">
					Each entry can include admins, contests, nested items, and polling station addresses.
				</p>
			</CardHeader>
			<CardContent class="space-y-4">
				<div class="space-y-2">
					<Label for="batch-create-json">JSON Payload</Label>
					<textarea
						id="batch-create-json"
						rows="14"
						class="min-h-[260px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
						placeholder={batchJsonPlaceholder}
						bind:value={batchJsonPayload}
					></textarea>
				</div>

				{#if batchSubmitError}
					<Alert variant="destructive">
						<AlertTitle>Batch import failed</AlertTitle>
						<AlertDescription>{batchSubmitError}</AlertDescription>
					</Alert>
				{/if}

				{#if batchSubmitSummary}
					<Alert variant={batchSubmitSummary.failed > 0 ? 'destructive' : 'default'}>
						<AlertTitle>
							Imported {batchSubmitSummary.created} contest group{batchSubmitSummary.created !== 1
								? 's'
								: ''}
						</AlertTitle>
						<AlertDescription>
							{#if batchSubmitSummary.failed > 0}
								<p>
									{batchSubmitSummary.failed} contest group{batchSubmitSummary.failed !== 1
										? 's'
										: ''} failed.
								</p>
							{/if}
							{#if batchSubmitSummary.createdIds.length > 0}
								<p class="mt-2 text-xs text-[var(--text-secondary)]">
									Created IDs: {batchSubmitSummary.createdIds.join(', ')}
								</p>
								<Button
									type="button"
									size="sm"
									variant="outline"
									class="mt-2"
									onclick={handleOpenFirstCreatedGroup}
								>
									Open First Created Group
								</Button>
							{/if}
							{#if batchSubmitSummary.errors.length > 0}
								<div class="mt-2 space-y-1 text-xs">
									{#each batchSubmitSummary.errors as errorMessage}
										<p>• {errorMessage}</p>
									{/each}
								</div>
							{/if}
						</AlertDescription>
					</Alert>
				{/if}
			</CardContent>
			<CardFooter class="flex flex-wrap justify-end gap-2 border-t">
				<Button type="button" variant="outline" onclick={handleLoadSampleJson}>
					Load Sample JSON
				</Button>
				<Button type="button" onclick={handleBatchSubmit} disabled={isBatchSubmitting}>
					{isBatchSubmitting ? 'Importing...' : 'Import Contest Groups'}
				</Button>
			</CardFooter>
		</Card>
	</div>
</main>
