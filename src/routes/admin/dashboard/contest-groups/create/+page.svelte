<script lang="ts">
	import { goto } from '$app/navigation';
	import AdminNavToolbar from '$lib/components/AdminNavToolbar.svelte';
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Separator } from '$lib/components/ui/separator';
	import type { PollingStationAddress } from '$lib/definitions/address';
	import type { Contest, ContestItemType, ContestStatus } from '$lib/definitions/contest-group';
	import type { Admin } from '$lib/definitions/user';
	import { createContestGroup } from '$lib/remotes/create-contest-group.remote';
	import { getAdmins } from '$lib/remotes/get-admins.remote';
	const steps = [
		{ id: 1, title: 'Details', description: 'Title and description' },
		{ id: 2, title: 'Admins', description: 'Assign admins' },
		{ id: 3, title: 'Contests', description: 'Add contests and items' },
		{ id: 4, title: 'Polling Stations', description: 'Add polling station addresses' },
		{ id: 5, title: 'Review', description: 'Confirm and submit' }
	];

	const contestItemTypes: ContestItemType[] = ['candidate', 'initiative', 'other'];
	const contestStatuses: ContestStatus[] = ['upcoming', 'active', 'closed'];
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

	let currentStep = $state(1);
	let title = $state('');
	let description = $state('');

	let adminSearch = $state('');
	let selectedAdminIds = $state<string[]>([]);

	let contests = $state<Contest[]>([]);
	let pollingStationAddresses = $state<PollingStationAddress[]>([]);

	let isSubmitting = $state(false);
	let isSubmitted = $state(false);
	let batchJsonPayload = $state('');
	let isBatchSubmitting = $state(false);
	let batchSubmitError = $state<string | null>(null);
	let batchSubmitSummary = $state<{
		created: number;
		failed: number;
		createdIds: string[];
		errors: string[];
	} | null>(null);

	const availableAdmins = await getAdmins();

	const filteredAdmins = $derived.by(() => {
		const query = adminSearch.trim().toLowerCase();
		if (!query) return availableAdmins;
		return availableAdmins.filter((admin) => {
			const fullName = `${admin.firstName} ${admin.lastName}`.toLowerCase();
			return (
				fullName.includes(query) ||
				admin.username.toLowerCase().includes(query) ||
				admin.email.toLowerCase().includes(query)
			);
		});
	});

	const selectedAdmins = $derived.by(() =>
		availableAdmins.filter((admin) => selectedAdminIds.includes(admin.id))
	);

	const canContinue = $derived(() => {
		if (currentStep === 1) {
			return title.trim().length > 0;
		}
		return true;
	});

	function goNext() {
		if (!canContinue || currentStep >= steps.length) return;
		currentStep += 1;
	}

	function goBack() {
		if (currentStep <= 1) return;
		currentStep -= 1;
	}

	function toggleAdmin(adminId: string) {
		if (selectedAdminIds.includes(adminId)) {
			selectedAdminIds = selectedAdminIds.filter((id) => id !== adminId);
			return;
		}
		selectedAdminIds = [...selectedAdminIds, adminId];
	}

	function addContest() {
		contests = [
			...contests,
			{
				id: crypto.randomUUID(),
				title: '',
				description: '',
				contestStatus: 'upcoming',
				items: []
			}
		];
	}

	function updateContestField(
		contestId: string,
		field: 'title' | 'description' | 'contestStatus',
		value: string | ContestStatus
	) {
		contests = contests.map((contest) => {
			if (contest.id !== contestId) return contest;
			if (field === 'contestStatus') {
				return { ...contest, contestStatus: value as ContestStatus };
			}
			return { ...contest, [field]: value };
		});
	}

	function removeContest(contestId: string) {
		contests = contests.filter((contest) => contest.id !== contestId);
	}

	function addContestItem(contestId: string) {
		contests = contests.map((contest) => {
			if (contest.id !== contestId) return contest;
			return {
				...contest,
				items: [
					...contest.items,
					{
						id: crypto.randomUUID(),
						title: '',
						auxiliaryText: '',
						contestItemType: 'candidate'
					}
				]
			};
		});
	}

	function updateContestItemField(
		contestId: string,
		itemId: string,
		field: 'title' | 'auxiliaryText' | 'contestItemType',
		value: string
	) {
		contests = contests.map((contest) => {
			if (contest.id !== contestId) return contest;
			return {
				...contest,
				items: contest.items.map((item) =>
					item.id === itemId ? { ...item, [field]: value } : item
				)
			};
		});
	}

	function removeContestItem(contestId: string, itemId: string) {
		contests = contests.map((contest) => {
			if (contest.id !== contestId) return contest;
			return {
				...contest,
				items: contest.items.filter((item) => item.id !== itemId)
			};
		});
	}

	function addPollingStationAddress() {
		pollingStationAddresses = [
			...pollingStationAddresses,
			{
				id: crypto.randomUUID(),
				name: '',
				streetAddress: '',
				city: '',
				state: '',
				zipCode: ''
			}
		];
	}

	function updatePollingStationAddressField(
		addressId: string,
		field: keyof Omit<PollingStationAddress, 'id'>,
		value: string
	) {
		pollingStationAddresses = pollingStationAddresses.map((address) =>
			address.id === addressId ? { ...address, [field]: value } : address
		);
	}

	function removePollingStationAddress(addressId: string) {
		pollingStationAddresses = pollingStationAddresses.filter((address) => address.id !== addressId);
	}

	async function handleSubmit() {
		isSubmitting = true;
		isSubmitted = true;
		isSubmitting = false;

		const submissionData = {
			id: crypto.randomUUID(),
			title,
			description,
			adminIds: selectedAdminIds,
			contests,
			pollingStationAddresses
		};

		try {
			const result = await createContestGroup(submissionData);
			if (result && 'errors' in result) {
				console.error('Submission errors:', result.errors);
				return;
			}

			if (result && 'contestGroupId' in result) {
				console.log('Contest group created with ID:', result.contestGroupId);
				// navigate to the contest group details page or reset the form for a new entry
				await goto(`/admin/dashboard/contest-groups/view/${result.contestGroupId}`); // Navigate to the new contest group details page
			}
		} catch (error) {
			console.error('Error submitting contest group:', error);
		} finally {
			isSubmitting = false;
		}
	}

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

	function formatAdminName(admin: Admin) {
		return `${admin.firstName} ${admin.lastName}`;
	}
</script>

<svelte:head>
	<title>Create Contest Group - Gov Vote</title>
</svelte:head>

<main class="min-h-[calc(100vh-8rem)] bg-[var(--bg-primary)] px-6 py-8">
	<div class="mx-auto flex w-full max-w-5xl flex-col gap-6">
		<AdminNavToolbar
			primary={{ label: '← Back to Admin Dashboard', href: '/admin/dashboard' }}
			secondary={{ label: 'View Contest Groups', href: '/admin/dashboard/contest-groups/view' }}
		/>

		<header>
			<h1 class="mb-2 text-3xl font-bold text-[var(--text-primary)]">Create Contest Group</h1>
			<p class="text-[var(--text-secondary)]">
				Use the wizard to configure contest groups, admins, contests, and polling stations.
			</p>
		</header>

		<Card>
			<CardHeader class="gap-4">
				<div class="flex flex-col gap-2">
					<CardTitle>Setup Wizard</CardTitle>
					<p class="text-sm text-[var(--text-secondary)]">
						Step {currentStep} of {steps.length}
					</p>
				</div>
				<div class="grid gap-3 sm:grid-cols-5">
					{#each steps as step}
						<div
							class={`rounded-lg border px-3 py-2 text-sm transition-colors ${
								step.id === currentStep
									? 'border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-primary)]'
									: step.id < currentStep
										? 'border-transparent bg-[var(--bg-muted)] text-[var(--text-secondary)]'
										: 'border-transparent text-[var(--text-secondary)]'
							}`}
						>
							<div class="flex items-center gap-2">
								<span
									class={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
										step.id === currentStep
											? 'bg-[var(--accent-primary)] text-white'
											: step.id < currentStep
												? 'bg-[var(--text-secondary)] text-white'
												: 'bg-[var(--bg-muted)] text-[var(--text-secondary)]'
									}`}
								>
									{step.id}
								</span>
								<div>
									<p class="font-medium">{step.title}</p>
									<p class="text-xs text-[var(--text-secondary)]">{step.description}</p>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</CardHeader>

			<Separator />

			<CardContent class="space-y-6">
				{#if currentStep === 1}
					<section class="space-y-4">
						<div>
							<h2 class="text-xl font-semibold text-[var(--text-primary)]">
								Contest Group Details
							</h2>
							<p class="text-sm text-[var(--text-secondary)]">
								Add a title and description for this contest group.
							</p>
						</div>
						<div class="space-y-2">
							<Label for="contest-group-title">Title</Label>
							<Input
								id="contest-group-title"
								type="text"
								placeholder="2024 General Election"
								bind:value={title}
								required
							/>
						</div>
						<div class="space-y-2">
							<Label for="contest-group-description">Description</Label>
							<textarea
								id="contest-group-description"
								rows="4"
								class="min-h-[110px] w-full rounded-md border border-input bg-background px-3 py-2 text-base shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none md:text-sm"
								placeholder="Add a short description about this contest group."
								bind:value={description}
							></textarea>
						</div>
					</section>
				{/if}

				{#if currentStep === 2}
					<section class="space-y-4">
						<div>
							<h2 class="text-xl font-semibold text-[var(--text-primary)]">Assign Admins</h2>
							<p class="text-sm text-[var(--text-secondary)]">
								Search and assign admins who will manage this contest group.
							</p>
						</div>
						<div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
							<div class="space-y-3">
								<div class="space-y-2">
									<Label for="admin-search">Search admins</Label>
									<Input
										id="admin-search"
										placeholder="Search by name, username, or email"
										bind:value={adminSearch}
									/>
								</div>
								<div class="space-y-3">
									{#if filteredAdmins.length === 0}
										<Alert>
											<AlertTitle>No admins found</AlertTitle>
											<AlertDescription>Try a different search term.</AlertDescription>
										</Alert>
									{:else}
										{#each filteredAdmins as admin}
											<div
												class="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--border-primary)] px-4 py-3"
											>
												<div>
													<p class="font-medium text-[var(--text-primary)]">
														{formatAdminName(admin as Admin)}
													</p>
													<p class="text-sm text-[var(--text-secondary)]">
														{admin.email} · {admin.username}
													</p>
													<Badge variant="secondary" class="mt-2 capitalize">
														{admin.role.replace('_', ' ')}
													</Badge>
												</div>
												<Button
													size="sm"
													variant={selectedAdminIds.includes(admin.id) ? 'destructive' : 'outline'}
													type="button"
													onclick={() => toggleAdmin(admin.id)}
												>
													{selectedAdminIds.includes(admin.id) ? 'Remove' : 'Assign'}
												</Button>
											</div>
										{/each}
									{/if}
								</div>
							</div>
							<div class="rounded-lg border border-[var(--border-primary)] p-4">
								<h3 class="mb-2 text-sm font-semibold text-[var(--text-primary)]">
									Assigned Admins
								</h3>
								{#if selectedAdmins.length === 0}
									<p class="text-sm text-[var(--text-secondary)]">No admins assigned yet.</p>
								{:else}
									<div class="space-y-2">
										{#each selectedAdmins as admin}
											<div class="flex items-center justify-between gap-3">
												<div>
													<p class="text-sm font-medium">{formatAdminName(admin as Admin)}</p>
													<p class="text-xs text-[var(--text-secondary)]">
														{admin.email}
													</p>
												</div>
												<Button size="sm" variant="outline" onclick={() => toggleAdmin(admin.id)}>
													Remove
												</Button>
											</div>
										{/each}
									</div>
								{/if}
							</div>
						</div>
					</section>
				{/if}

				{#if currentStep === 3}
					<section class="space-y-4">
						<div class="flex flex-wrap items-center justify-between gap-3">
							<div>
								<h2 class="text-xl font-semibold text-[var(--text-primary)]">Add Contests</h2>
								<p class="text-sm text-[var(--text-secondary)]">
									Each contest can include multiple contest items.
								</p>
							</div>
							<Button type="button" variant="outline" onclick={addContest}>Add Contest</Button>
						</div>
						{#if contests.length === 0}
							<Alert>
								<AlertTitle>No contests added</AlertTitle>
								<AlertDescription>
									Add at least one contest to start building items.
								</AlertDescription>
							</Alert>
						{:else}
							<div class="space-y-4">
								{#each contests as contest}
									<div class="rounded-lg border border-[var(--border-primary)] p-4">
										<div class="flex flex-wrap items-center justify-between gap-3">
											<h3 class="text-lg font-semibold text-[var(--text-primary)]">
												Contest Details
											</h3>
											<Button
												size="sm"
												variant="destructive"
												onclick={() => removeContest(contest.id)}
											>
												Remove Contest
											</Button>
										</div>
										<div class="mt-4 grid gap-4 lg:grid-cols-2">
											<div class="space-y-2">
												<Label>Contest Title</Label>
												<Input
													value={contest.title}
													placeholder="Mayor of Springfield"
													oninput={(event) =>
														updateContestField(
															contest.id,
															'title',
															(event.currentTarget as HTMLInputElement).value
														)}
												/>
											</div>
											<div class="space-y-2">
												<Label>Contest Description</Label>
												<textarea
													rows="3"
													class="min-h-[90px] w-full rounded-md border border-input bg-background px-3 py-2 text-base shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none md:text-sm"
													value={contest.description}
													placeholder="Describe the contest and eligible voters."
													oninput={(event) =>
														updateContestField(
															contest.id,
															'description',
															(event.currentTarget as HTMLTextAreaElement).value
														)}
												></textarea>
											</div>
											<div class="space-y-2">
												<Label>Contest Status</Label>
												<select
													class="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-base shadow-xs transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none md:text-sm"
													value={contest.contestStatus}
													onchange={(event) =>
														updateContestField(
															contest.id,
															'contestStatus',
															(event.currentTarget as HTMLSelectElement).value as ContestStatus
														)}
												>
													{#each contestStatuses as option}
														<option value={option}>
															{option === 'closed' ? 'inactive' : option}
														</option>
													{/each}
												</select>
											</div>
										</div>
										<div class="mt-5 space-y-3">
											<div class="flex flex-wrap items-center justify-between gap-3">
												<h4 class="text-sm font-semibold text-[var(--text-primary)]">
													Contest Items
												</h4>
												<Button
													size="sm"
													variant="outline"
													onclick={() => addContestItem(contest.id)}
												>
													Add Item
												</Button>
											</div>
											{#if contest.items.length === 0}
												<p class="text-sm text-[var(--text-secondary)]">No items added yet.</p>
											{:else}
												<div class="space-y-3">
													{#each contest.items as item}
														<div class="rounded-md border border-[var(--border-primary)] p-3">
															<div class="flex items-center justify-between gap-3">
																<p class="text-sm font-semibold text-[var(--text-primary)]">
																	Contest Item
																</p>
																<Button
																	size="sm"
																	variant="destructive"
																	onclick={() => removeContestItem(contest.id, item.id)}
																>
																	Remove
																</Button>
															</div>
															<div class="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px]">
																<div class="space-y-2">
																	<Label>Item Title</Label>
																	<Input
																		value={item.title}
																		placeholder="Jane Doe"
																		oninput={(event) =>
																			updateContestItemField(
																				contest.id,
																				item.id,
																				'title',
																				(event.currentTarget as HTMLInputElement).value
																			)}
																	/>
																</div>
																<div class="space-y-2">
																	<Label>Item Type</Label>
																	<select
																		class="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-base shadow-xs transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none md:text-sm"
																		value={item.contestItemType}
																		onchange={(event) =>
																			updateContestItemField(
																				contest.id,
																				item.id,
																				'contestItemType',
																				(event.currentTarget as HTMLSelectElement).value
																			)}
																	>
																		{#each contestItemTypes as option}
																			<option value={option}>
																				{option}
																			</option>
																		{/each}
																	</select>
																</div>
																<div class="space-y-2 lg:col-span-2">
																	<Label>Auxiliary Text</Label>
																	<Input
																		value={item.auxiliaryText}
																		placeholder="Party affiliation or additional context"
																		oninput={(event) =>
																			updateContestItemField(
																				contest.id,
																				item.id,
																				'auxiliaryText',
																				(event.currentTarget as HTMLInputElement).value
																			)}
																	/>
																</div>
															</div>
														</div>
													{/each}
												</div>
											{/if}
										</div>
									</div>
								{/each}
							</div>
						{/if}
					</section>
				{/if}

				{#if currentStep === 4}
					<section class="space-y-4">
						<div class="flex flex-wrap items-center justify-between gap-3">
							<div>
								<h2 class="text-xl font-semibold text-[var(--text-primary)]">
									Polling Station Addresses
								</h2>
								<p class="text-sm text-[var(--text-secondary)]">
									Add or remove polling station addresses tied to this contest group.
								</p>
							</div>
							<Button type="button" variant="outline" onclick={addPollingStationAddress}>
								Add Address
							</Button>
						</div>
						{#if pollingStationAddresses.length === 0}
							<Alert>
								<AlertTitle>No addresses added</AlertTitle>
								<AlertDescription>Add polling station addresses to guide voters.</AlertDescription>
							</Alert>
						{:else}
							<div class="space-y-4">
								{#each pollingStationAddresses as address}
									<div class="rounded-lg border border-[var(--border-primary)] p-4">
										<div class="flex flex-wrap items-center justify-between gap-3">
											<h3 class="text-base font-semibold text-[var(--text-primary)]">
												Polling Station
											</h3>
											<Button
												size="sm"
												variant="destructive"
												onclick={() => removePollingStationAddress(address.id)}
											>
												Remove
											</Button>
										</div>
										<div class="mt-4 grid gap-4 md:grid-cols-2">
											<div class="space-y-2 md:col-span-2">
												<Label>Polling Station Name</Label>
												<Input
													value={address.name}
													placeholder="Springfield High School Gym"
													oninput={(event) =>
														updatePollingStationAddressField(
															address.id,
															'name',
															(event.currentTarget as HTMLInputElement).value
														)}
												/>
											</div>
											<div class="space-y-2 md:col-span-2">
												<Label>Street Address</Label>
												<Input
													value={address.streetAddress}
													placeholder="123 Main St"
													oninput={(event) =>
														updatePollingStationAddressField(
															address.id,
															'streetAddress',
															(event.currentTarget as HTMLInputElement).value
														)}
												/>
											</div>
											<div class="space-y-2">
												<Label>City</Label>
												<Input
													value={address.city}
													placeholder="Springfield"
													oninput={(event) =>
														updatePollingStationAddressField(
															address.id,
															'city',
															(event.currentTarget as HTMLInputElement).value
														)}
												/>
											</div>
											<div class="space-y-2">
												<Label>State</Label>
												<Input
													value={address.state}
													placeholder="IL"
													oninput={(event) =>
														updatePollingStationAddressField(
															address.id,
															'state',
															(event.currentTarget as HTMLInputElement).value
														)}
												/>
											</div>
											<div class="space-y-2">
												<Label>Zip Code</Label>
												<Input
													value={address.zipCode}
													placeholder="90210"
													oninput={(event) =>
														updatePollingStationAddressField(
															address.id,
															'zipCode',
															(event.currentTarget as HTMLInputElement).value
														)}
												/>
											</div>
										</div>
									</div>
								{/each}
							</div>
						{/if}
					</section>
				{/if}

				{#if currentStep === 5}
					<section class="space-y-4">
						<div>
							<h2 class="text-xl font-semibold text-[var(--text-primary)]">Review & Confirm</h2>
							<p class="text-sm text-[var(--text-secondary)]">
								Review all selections before submitting.
							</p>
						</div>
						<div class="grid gap-4 lg:grid-cols-2">
							<Card>
								<CardHeader>
									<CardTitle>Contest Group</CardTitle>
								</CardHeader>
								<CardContent class="space-y-2">
									<div>
										<p class="text-xs font-semibold text-[var(--text-secondary)]">TITLE</p>
										<p class="text-sm text-[var(--text-primary)]">
											{title || 'Untitled contest group'}
										</p>
									</div>
									<div>
										<p class="text-xs font-semibold text-[var(--text-secondary)]">DESCRIPTION</p>
										<p class="text-sm text-[var(--text-primary)]">
											{description || 'No description provided.'}
										</p>
									</div>
								</CardContent>
							</Card>
							<Card>
								<CardHeader>
									<CardTitle>Admins</CardTitle>
								</CardHeader>
								<CardContent>
									{#if selectedAdmins.length === 0}
										<p class="text-sm text-[var(--text-secondary)]">No admins assigned.</p>
									{:else}
										<div class="space-y-2">
											{#each selectedAdmins as admin}
												<div class="flex items-center justify-between gap-3">
													<div>
														<p class="text-sm font-medium text-[var(--text-primary)]">
															{formatAdminName(admin as Admin)}
														</p>
														<p class="text-xs text-[var(--text-secondary)]">
															{admin.email}
														</p>
													</div>
													<Badge variant="secondary" class="capitalize">
														{admin.role.replace('_', ' ')}
													</Badge>
												</div>
											{/each}
										</div>
									{/if}
								</CardContent>
							</Card>
							<Card>
								<CardHeader>
									<CardTitle>Contests</CardTitle>
								</CardHeader>
								<CardContent class="space-y-3">
									{#if contests.length === 0}
										<p class="text-sm text-[var(--text-secondary)]">No contests added.</p>
									{:else}
										{#each contests as contest}
											<div class="rounded-md border border-[var(--border-primary)] p-3">
												<p class="text-sm font-semibold text-[var(--text-primary)]">
													{contest.title || 'Untitled contest'}
												</p>
												<p class="text-xs text-[var(--text-secondary)]">
													{contest.description || 'No description provided.'}
												</p>
												<p class="mt-2 text-xs text-[var(--text-secondary)]">
													Status: {contest.contestStatus === 'closed'
														? 'inactive'
														: contest.contestStatus}
												</p>
												<p class="mt-2 text-xs text-[var(--text-secondary)]">
													{contest.items.length} item{contest.items.length !== 1 ? 's' : ''}
												</p>
												{#if contest.items.length > 0}
													<div class="mt-2 space-y-1">
														{#each contest.items as item}
															<p class="text-xs text-[var(--text-secondary)]">
																• {item.title || 'Untitled item'} ({item.contestItemType})
															</p>
														{/each}
													</div>
												{/if}
											</div>
										{/each}
									{/if}
								</CardContent>
							</Card>
							<Card>
								<CardHeader>
									<CardTitle>Polling Stations</CardTitle>
								</CardHeader>
								<CardContent class="space-y-2">
									{#if pollingStationAddresses.length === 0}
										<p class="text-sm text-[var(--text-secondary)]">No addresses added.</p>
									{:else}
										{#each pollingStationAddresses as address}
											<div class="rounded-md border border-[var(--border-primary)] p-3">
												<div>
													<p class="text-sm font-medium text-[var(--text-primary)]">
														{address.name || 'Not specified'}
													</p>
												</div>
												<p class="text-sm font-medium text-[var(--text-primary)]">
													{address.streetAddress || 'Address pending'}
												</p>
												<p class="text-xs text-[var(--text-secondary)]">
													{address.city || 'City'}, {address.state || 'State'}
													{address.zipCode || ''}
												</p>
											</div>
										{/each}
									{/if}
								</CardContent>
							</Card>
						</div>

						{#if isSubmitted}
							<Alert>
								<AlertTitle>Contest group submitted</AlertTitle>
								<AlertDescription>
									Your contest group is ready to be saved once backend integration is wired up.
								</AlertDescription>
							</Alert>
						{/if}
					</section>
				{/if}
			</CardContent>

			<CardFooter class="flex flex-wrap items-center justify-between gap-3 border-t">
				<Button type="button" variant="outline" onclick={goBack} disabled={currentStep === 1}>
					Back
				</Button>
				<div class="flex flex-wrap items-center gap-2">
					{#if currentStep < steps.length}
						<Button type="button" onclick={goNext} disabled={!canContinue}>Next</Button>
					{:else}
						<Button type="button" onclick={handleSubmit} disabled={isSubmitting}>
							{isSubmitting ? 'Submitting...' : 'Submit Contest Group'}
						</Button>
					{/if}
				</div>
			</CardFooter>
		</Card>

		<Card>
			<CardHeader class="gap-2">
				<CardTitle>Batch Create via JSON</CardTitle>
				<p class="text-sm text-[var(--text-secondary)]">
					Paste a JSON payload with a <span class="font-semibold">contestGroups</span> array to create
					multiple contest groups and nested items in one run.
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
