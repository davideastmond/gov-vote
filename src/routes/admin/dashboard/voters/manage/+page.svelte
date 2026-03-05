<script lang="ts">
	import AdminNavToolbar from '$lib/components/AdminNavToolbar.svelte';
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { formatDate } from '$lib/utils/date';
	import { getVoterCardFullAddress } from '$lib/utils/voter-card';
	import { batchCreateUserValidator } from '$lib/validators/batch-create-user.validator';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const searchInput = $derived(data.searchQuery);

	let newVoterFirstName = $state('');
	let newVoterLastName = $state('');
	let newVoterStreetAddress = $state('');
	let newVoterCity = $state('');
	let newVoterState = $state('');
	let newVoterZipCode = $state('');
	let isCreateVoterLoading = $state(false);
	let createVoterError = $state('');
	let createVoterValidationErrors = $state<string[]>([]);
	let createVoterSuccessMessage = $state('');

	function handleSearchChange(e: Event) {
		const form = (e.target as HTMLInputElement).form;
		if (form) {
			form.submit();
		}
	}

	function getDisplayName(firstName: string, lastName: string): string {
		return `${firstName} ${lastName}`;
	}

	function resetCreateVoterMessages() {
		createVoterError = '';
		createVoterValidationErrors = [];
		createVoterSuccessMessage = '';
	}

	function resetCreateVoterForm() {
		newVoterFirstName = '';
		newVoterLastName = '';
		newVoterStreetAddress = '';
		newVoterCity = '';
		newVoterState = '';
		newVoterZipCode = '';
	}

	async function handleCreateVoter(event: Event) {
		event.preventDefault();
		resetCreateVoterMessages();
		isCreateVoterLoading = true;

		try {
			const voterPayload = [
				{
					firstName: newVoterFirstName.trim(),
					lastName: newVoterLastName.trim(),
					streetAddress: newVoterStreetAddress.trim(),
					city: newVoterCity.trim(),
					state: newVoterState.trim(),
					zipCode: newVoterZipCode.trim()
				}
			];

			const validationResult = batchCreateUserValidator.safeParse(voterPayload);
			if (!validationResult.success) {
				createVoterValidationErrors = validationResult.error.issues.map((issue) => {
					const path = issue.path.join('.');
					return `${path || 'Root'}: ${issue.message}`;
				});
				createVoterError = 'Validation failed. Please check the errors below.';
				return;
			}

			const response = await fetch('/api/voters', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(validationResult.data)
			});

			const result = (await response.json()) as {
				success?: boolean;
				message?: string;
				details?: string[];
				data?: { insertedUserIds?: string[] };
			};

			if (!response.ok || !result.success) {
				createVoterError = result.message ?? 'Failed to create voter.';
				if (Array.isArray(result.details)) {
					createVoterValidationErrors = result.details;
				}
				return;
			}

			const insertedCount = result.data?.insertedUserIds?.length ?? 1;
			createVoterSuccessMessage = `Voter created successfully (${insertedCount} record).`;
			resetCreateVoterForm();
		} catch (error) {
			console.error(error);
			createVoterError = 'An unexpected error occurred. Please try again.';
		} finally {
			isCreateVoterLoading = false;
		}
	}
</script>

<svelte:head>
	<title>Manage Voters - Gov Vote</title>
</svelte:head>

<main class="min-h-[calc(100vh-8rem)] bg-(--bg-primary) px-6 py-8">
	<div class="mx-auto w-full max-w-6xl">
		<AdminNavToolbar primary={{ label: '← Back to Admin Dashboard', href: '/admin/dashboard' }} />

		<header class="mb-8">
			<h1 class="mb-2 text-3xl font-bold text-(--text-primary)">Manage Voters</h1>
			<p class="text-(--text-secondary)">
				Search voters by name or user ID and open their details page.
			</p>
		</header>

		<section class="mb-8">
			<Card>
				<CardHeader>
					<CardTitle>Add Voter</CardTitle>
				</CardHeader>
				<CardContent>
					<form class="space-y-4" onsubmit={handleCreateVoter}>
						{#if createVoterError}
							<Alert variant="destructive">
								<AlertTitle>Error</AlertTitle>
								<AlertDescription>{createVoterError}</AlertDescription>
							</Alert>
						{/if}

						{#if createVoterValidationErrors.length > 0}
							<Alert variant="destructive">
								<AlertTitle>Validation Errors</AlertTitle>
								<AlertDescription>
									<ul class="mt-2 list-inside list-disc space-y-1">
										{#each createVoterValidationErrors as validationError}
											<li class="text-sm">{validationError}</li>
										{/each}
									</ul>
								</AlertDescription>
							</Alert>
						{/if}

						{#if createVoterSuccessMessage}
							<Alert>
								<AlertTitle>Success</AlertTitle>
								<AlertDescription>{createVoterSuccessMessage}</AlertDescription>
							</Alert>
						{/if}

						<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div class="space-y-2">
								<Label for="new-voter-first-name">First Name</Label>
								<Input
									id="new-voter-first-name"
									type="text"
									bind:value={newVoterFirstName}
									placeholder="John"
									required
								/>
							</div>
							<div class="space-y-2">
								<Label for="new-voter-last-name">Last Name</Label>
								<Input
									id="new-voter-last-name"
									type="text"
									bind:value={newVoterLastName}
									placeholder="Doe"
									required
								/>
							</div>
						</div>

						<div class="space-y-2">
							<Label for="new-voter-street-address">Street Address</Label>
							<Input
								id="new-voter-street-address"
								type="text"
								bind:value={newVoterStreetAddress}
								placeholder="123 Main St"
								required
							/>
						</div>

						<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
							<div class="space-y-2">
								<Label for="new-voter-city">City</Label>
								<Input
									id="new-voter-city"
									type="text"
									bind:value={newVoterCity}
									placeholder="Springfield"
									required
								/>
							</div>
							<div class="space-y-2">
								<Label for="new-voter-state">State</Label>
								<Input
									id="new-voter-state"
									type="text"
									bind:value={newVoterState}
									placeholder="IL"
									required
								/>
							</div>
							<div class="space-y-2">
								<Label for="new-voter-zip-code">Zip Code</Label>
								<Input
									id="new-voter-zip-code"
									type="text"
									bind:value={newVoterZipCode}
									placeholder="62701"
									required
								/>
							</div>
						</div>

						<div>
							<Button type="submit" disabled={isCreateVoterLoading}>
								{isCreateVoterLoading ? 'Adding Voter...' : 'Add Voter'}
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</section>

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
