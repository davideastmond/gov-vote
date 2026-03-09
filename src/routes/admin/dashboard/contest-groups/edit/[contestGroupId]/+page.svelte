<script lang="ts">
	import AdminNavToolbar from '$lib/components/AdminNavToolbar.svelte';
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	function statusLabel(status: 'upcoming' | 'active' | 'closed') {
		if (status === 'closed') return 'inactive';
		return status;
	}

	function statusVariant(status: 'upcoming' | 'active' | 'closed') {
		if (status === 'active') return 'secondary';
		if (status === 'closed') return 'outline';
		return 'outline';
	}

	function formatPollingStationAddress(
		streetAddress: string,
		city: string,
		state: string,
		zipCode: string
	) {
		return `${streetAddress}, ${city}, ${state} ${zipCode}`;
	}

	function confirmDeletePollingStation(event: Event) {
		if (!window.confirm('Remove this polling station from the contest group?')) {
			event.preventDefault();
		}
	}

	function isGroupClosed() {
		return data.contestGroup.contestGroupStatus === 'closed';
	}
</script>

<svelte:head>
	<title>Edit Contest Group - Gov Vote</title>
</svelte:head>

<main class="min-h-[calc(100vh-8rem)] bg-(--bg-primary) px-6 py-8">
	<div class="mx-auto flex w-full max-w-6xl flex-col gap-6">
		<AdminNavToolbar
			primary={{ label: '← Back to Admin Dashboard', href: '/admin/dashboard' }}
			secondary={{
				label: 'Back to Contest Group',
				href: `/admin/dashboard/contest-groups/view/${data.contestGroup.id}`
			}}
		/>

		<header>
			<h1 class="text-3xl font-bold text-(--text-primary)">Edit Contest Group</h1>
			<p class="mt-1 text-(--text-secondary)">
				Manage details, contests, and contest items for {data.contestGroup.title}.
			</p>
		</header>

		{#if form?.message}
			<Alert variant={form.success ? 'default' : 'destructive'}>
				<AlertTitle>{form.success ? 'Success' : 'Update failed'}</AlertTitle>
				<AlertDescription>{form.message}</AlertDescription>
			</Alert>
		{/if}

		{#if isGroupClosed()}
			<Alert>
				<AlertTitle>Contest Group Is Closed</AlertTitle>
				<AlertDescription>
					Editing is disabled for closed contest groups. Reopen the group to make changes.
				</AlertDescription>
			</Alert>
		{/if}

		<Card>
			<CardHeader>
				<CardTitle>Contest Group Details</CardTitle>
			</CardHeader>
			<CardContent class={isGroupClosed() ? 'opacity-60' : ''}>
				<fieldset disabled={isGroupClosed()}>
					<form method="POST" action="?/updateGroupDetails" class="space-y-4">
						<div class="space-y-2">
							<Label for="group-title">Title</Label>
							<Input id="group-title" name="title" value={data.contestGroup.title} required />
						</div>
						<div class="space-y-2">
							<Label for="group-description">Description</Label>
							<textarea
								id="group-description"
								name="description"
								rows="4"
								class="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-base shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none md:text-sm"
								>{data.contestGroup.description ?? ''}</textarea
							>
						</div>
						<Button type="submit">Save Contest Group</Button>
					</form>
				</fieldset>
			</CardContent>
		</Card>

		<Card>
			<CardHeader>
				<CardTitle>Contest Group Status</CardTitle>
			</CardHeader>
			<CardContent class="space-y-4">
				<div class="flex items-center justify-between gap-4 rounded-md border p-3">
					<p class="text-sm text-(--text-secondary)">Current status</p>
					<Badge variant={statusVariant(data.contestGroup.contestGroupStatus)} class="capitalize"
						>{statusLabel(data.contestGroup.contestGroupStatus)}</Badge
					>
				</div>
				<form method="POST" action="?/updateGroupStatus" class="space-y-2">
					<Label for="contest-group-status">Status</Label>
					{#if data.contestGroup.contestGroupStatus === 'closed'}
						<p class="text-sm text-(--text-secondary)">This contest group is currently closed.</p>
					{:else}
						<div class="flex flex-wrap items-center gap-2">
							<select
								id="contest-group-status"
								name="contestGroupStatus"
								class="flex h-9 w-35 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
							>
								<option
									value="upcoming"
									selected={data.contestGroup.contestGroupStatus === 'upcoming'}
								>
									upcoming
								</option>
								<option value="active" selected={data.contestGroup.contestGroupStatus === 'active'}>
									active
								</option>
							</select>
							<Button type="submit" variant="outline">Save Status</Button>
						</div>
					{/if}
				</form>
			</CardContent>
		</Card>

		{#if data.contestGroup.contestGroupStatus !== 'closed'}
			<Card>
				<CardHeader>
					<CardTitle>Deactivate Contest Group</CardTitle>
				</CardHeader>
				<CardContent class="flex flex-col gap-4">
					<p class="text-sm text-(--text-secondary)">
						This closes the contest group and all associated contests, preventing any further votes
						from being cast. This action cannot be undone.
					</p>
					<form method="POST" action="?/deactivateGroup">
						<Button type="submit" variant="outline">Deactivate Contest Group</Button>
					</form>
				</CardContent>
			</Card>
		{/if}
		<Card>
			<CardHeader>
				<CardTitle>Add Contest</CardTitle>
			</CardHeader>
			<CardContent class={isGroupClosed() ? 'opacity-60' : ''}>
				<fieldset disabled={isGroupClosed()}>
					<form method="POST" action="?/addContest" class="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
						<div class="space-y-2">
							<Label for="new-contest-title">Contest title</Label>
							<Input id="new-contest-title" name="title" required />
						</div>
						<div class="space-y-2">
							<Label for="new-contest-description">Description</Label>
							<Input id="new-contest-description" name="description" />
						</div>
						<div class="self-end">
							<Button type="submit">Add Contest</Button>
						</div>
					</form>
				</fieldset>
			</CardContent>
		</Card>

		<Card>
			<CardHeader>
				<CardTitle>Polling Stations</CardTitle>
			</CardHeader>
			<CardContent class={`space-y-5 ${isGroupClosed() ? 'opacity-60' : ''}`}>
				<fieldset disabled={isGroupClosed()}>
					<div class="space-y-3">
						<div class="flex items-center justify-between">
							<h2 class="text-lg font-semibold text-(--text-primary)">Associated Stations</h2>
							<Badge variant="secondary">{data.pollingStations.length}</Badge>
						</div>
						{#if data.pollingStations.length === 0}
							<p class="text-sm text-(--text-secondary)">
								No polling stations are associated with this contest group yet.
							</p>
						{:else}
							<div class="space-y-2">
								{#each data.pollingStations as station}
									<div
										class="flex flex-wrap items-center justify-between gap-3 rounded-md border px-3 py-3"
									>
										<div class="space-y-1">
											<p class="font-medium text-(--text-primary)">
												{station.name || 'Unnamed Polling Station'}
											</p>
											<p class="text-sm text-(--text-secondary)">
												{formatPollingStationAddress(
													station.streetAddress,
													station.city,
													station.state,
													station.zipCode
												)}
											</p>
										</div>
										<form
											method="POST"
											action="?/deletePollingStation"
											onsubmit={confirmDeletePollingStation}
										>
											<input type="hidden" name="associationId" value={station.associationId} />
											<Button type="submit" variant="outline">Delete</Button>
										</form>
									</div>
								{/each}
							</div>
						{/if}
					</div>

					<div class="space-y-3 rounded-md border p-3">
						<h3 class="text-base font-semibold text-(--text-primary)">Add Polling Station</h3>
						<form method="POST" action="?/addPollingStation" class="grid gap-3 md:grid-cols-2">
							<div class="space-y-2 md:col-span-2">
								<Label for="new-polling-station-name">Polling station name</Label>
								<Input id="new-polling-station-name" name="name" required />
							</div>
							<div class="space-y-2 md:col-span-2">
								<Label for="new-polling-station-street">Street address</Label>
								<Input id="new-polling-station-street" name="streetAddress" required />
							</div>
							<div class="space-y-2">
								<Label for="new-polling-station-city">City</Label>
								<Input id="new-polling-station-city" name="city" required />
							</div>
							<div class="space-y-2">
								<Label for="new-polling-station-state">State</Label>
								<Input id="new-polling-station-state" name="state" required />
							</div>
							<div class="space-y-2">
								<Label for="new-polling-station-zip">Zip code</Label>
								<Input id="new-polling-station-zip" name="zipCode" required />
							</div>
							<div class="self-end">
								<Button type="submit">Add Polling Station</Button>
							</div>
						</form>
					</div>
				</fieldset>
			</CardContent>
		</Card>

		<section class={`space-y-4 ${isGroupClosed() ? 'opacity-60' : ''}`}>
			<h2 class="text-2xl font-semibold text-(--text-primary)">Contests</h2>
			<fieldset disabled={isGroupClosed()}>
				{#if data.contests.length === 0}
					<Card>
						<CardContent class="py-8 text-sm text-(--text-secondary)">
							No contests in this group yet.
						</CardContent>
					</Card>
				{:else}
					{#each data.contests as contestEl}
						<Card>
							<CardHeader class="flex flex-row items-start justify-between gap-3">
								<div>
									<CardTitle>{contestEl.title}</CardTitle>
									{#if contestEl.description}
										<p class="mt-1 text-sm text-(--text-secondary)">{contestEl.description}</p>
									{/if}
								</div>
								<Badge variant={statusVariant(contestEl.contestStatus)} class="capitalize"
									>{statusLabel(contestEl.contestStatus)}</Badge
								>
							</CardHeader>
							<CardContent class="space-y-5">
								<div class="grid gap-3 md:grid-cols-[1fr_auto]">
									<form method="POST" action="?/renameContest" class="space-y-2">
										<input type="hidden" name="contestId" value={contestEl.id} />
										<Label for={`rename-${contestEl.id}`}>Contest title</Label>
										<div class="flex gap-2 pb-1">
											<Input
												id={`rename-${contestEl.id}`}
												name="title"
												value={contestEl.title}
												required
											/>
										</div>
										<Label for={`contest-description-${contestEl.id}`}>Contest description</Label>
										<div class="flex gap-2">
											<Input
												id={`contest-description-${contestEl.id}`}
												name="description"
												value={contestEl.description ?? ''}
											/>
											<Button type="submit" variant="outline">Save Contest</Button>
										</div>
									</form>

									<form method="POST" action="?/updateContestStatus" class="space-y-2 self-end">
										<input type="hidden" name="contestId" value={contestEl.id} />
										<Label for={`contest-status-${contestEl.id}`}>Status</Label>
										<div class="flex gap-2">
											<select
												id={`contest-status-${contestEl.id}`}
												name="contestStatus"
												class="flex h-9 w-35 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
											>
												<option value="upcoming" selected={contestEl.contestStatus === 'upcoming'}>
													upcoming
												</option>
												<option value="active" selected={contestEl.contestStatus === 'active'}>
													active
												</option>
												<option value="closed" selected={contestEl.contestStatus === 'closed'}>
													inactive
												</option>
											</select>
											<Button type="submit" variant="outline">Save Status</Button>
										</div>
									</form>
								</div>

								<div class="space-y-3">
									<div class="flex items-center justify-between">
										<h3 class="text-lg font-semibold text-(--text-primary)">Items</h3>
										<Badge variant="secondary">{contestEl.items.length}</Badge>
									</div>

									{#if contestEl.items.length === 0}
										<p class="text-sm text-(--text-secondary)">No items for this contest yet.</p>
									{:else}
										<div class="space-y-2">
											{#each contestEl.items as item}
												<div class="rounded-md border px-3 py-3">
													<form
														method="POST"
														action="?/updateContestItem"
														class="grid gap-3 md:grid-cols-[1fr_1fr_180px_auto]"
													>
														<input type="hidden" name="contestId" value={contestEl.id} />
														<input type="hidden" name="contestItemId" value={item.id} />
														<div class="space-y-1">
															<Label for={`item-title-${item.id}`}>Item title</Label>
															<Input
																id={`item-title-${item.id}`}
																name="title"
																value={item.title}
																required
															/>
														</div>
														<div class="space-y-1">
															<Label for={`item-auxiliary-${item.id}`}>Auxiliary text</Label>
															<Input
																id={`item-auxiliary-${item.id}`}
																name="auxiliaryText"
																value={item.auxiliaryText ?? ''}
															/>
														</div>
														<div class="space-y-1">
															<Label for={`item-type-${item.id}`}>Type</Label>
															<select
																id={`item-type-${item.id}`}
																name="contestItemType"
																class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
															>
																<option
																	value="candidate"
																	selected={item.contestItemType === 'candidate'}
																>
																	candidate
																</option>
																<option
																	value="initiative"
																	selected={item.contestItemType === 'initiative'}
																>
																	initiative
																</option>
																<option value="other" selected={item.contestItemType === 'other'}
																	>other</option
																>
															</select>
														</div>
														<div class="flex items-end justify-end gap-2">
															<Button type="submit" variant="outline">Save Item</Button>
														</div>
													</form>
													<form method="POST" action="?/deleteContestItem" class="mt-2">
														<input type="hidden" name="contestId" value={contestEl.id} />
														<input type="hidden" name="contestItemId" value={item.id} />
														<Button type="submit" variant="outline">Delete Item</Button>
													</form>
												</div>
											{/each}
										</div>
									{/if}

									<form
										method="POST"
										action="?/addContestItem"
										class="grid gap-3 rounded-md border p-3 md:grid-cols-4"
									>
										<input type="hidden" name="contestId" value={contestEl.id} />
										<div class="space-y-2">
											<Label for={`item-title-${contestEl.id}`}>Item title</Label>
											<Input id={`item-title-${contestEl.id}`} name="title" required />
										</div>
										<div class="space-y-2">
											<Label for={`item-aux-${contestEl.id}`}>Auxiliary text</Label>
											<Input id={`item-aux-${contestEl.id}`} name="auxiliaryText" />
										</div>
										<div class="space-y-2">
											<Label for={`item-type-${contestEl.id}`}>Item type</Label>
											<select
												id={`item-type-${contestEl.id}`}
												name="contestItemType"
												class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
											>
												<option value="candidate">candidate</option>
												<option value="initiative">initiative</option>
												<option value="other">other</option>
											</select>
										</div>
										<div class="self-end">
											<Button type="submit">Add Item</Button>
										</div>
									</form>
								</div>
							</CardContent>
						</Card>
					{/each}
				{/if}
			</fieldset>
		</section>
	</div>
</main>
