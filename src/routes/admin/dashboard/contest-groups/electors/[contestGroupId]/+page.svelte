<script lang="ts">
	import AdminNavToolbar from '$lib/components/AdminNavToolbar.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardFooter,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import type { ContestStatus } from '$lib/definitions/enums';
	import { formatDate } from '$lib/utils/date';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let voterIdDialog = $state<HTMLDialogElement | null>(null);
	let selectedVoterIdPhoto = $state<PageData['electors'][number]['voterIdPhoto'] | null>(null);
	let selectedElectorName = $state('');

	function openVoterIdDialog(
		photo: NonNullable<PageData['electors'][number]['voterIdPhoto']>,
		electorName: string
	) {
		selectedVoterIdPhoto = photo;
		selectedElectorName = electorName;
		voterIdDialog?.showModal();
	}

	function closeVoterIdDialog() {
		voterIdDialog?.close();
	}

	function onVoterIdDialogCancel(event: Event) {
		event.preventDefault();
		closeVoterIdDialog();
	}

	function onVoterIdDialogClick(event: MouseEvent) {
		if (event.target === voterIdDialog) {
			closeVoterIdDialog();
		}
	}

	function formatStatus(status: ContestStatus) {
		return status.charAt(0).toUpperCase() + status.slice(1);
	}

	function statusVariant(status: ContestStatus) {
		if (status === 'closed') return 'destructive' as const;
		if (status === 'upcoming') return 'secondary' as const;
		return 'default' as const;
	}

	function formatTimestamp(date: Date | string) {
		return new Date(date).toLocaleString();
	}

	function pageHref(page: number) {
		return `?page=${page}`;
	}

	function electorName(elector: PageData['electors'][number]) {
		return `${elector.firstName} ${elector.lastName}`;
	}

	function handleOpenVoterIdDialog(elector: PageData['electors'][number]) {
		if (!elector.voterIdPhoto) {
			return;
		}

		openVoterIdDialog(elector.voterIdPhoto, electorName(elector));
	}
</script>

<svelte:head>
	<title>{data.contestGroup.title} Electors - Admin Dashboard</title>
</svelte:head>

<main class="min-h-[calc(100vh-8rem)] bg-(--bg-primary) px-6 py-8">
	<div class="mx-auto flex w-full max-w-6xl flex-col gap-6">
		<AdminNavToolbar
			primary={{
				label: 'Back to Contest Group',
				href: `/admin/dashboard/contest-groups/view/${data.contestGroup.id}`
			}}
			secondary={{
				label: 'Back to Results',
				href: `/admin/dashboard/contest-groups/results/${data.contestGroup.id}`
			}}
		/>

		<header class="space-y-2">
			<div class="flex flex-wrap items-center gap-3">
				<h1 class="text-3xl font-bold text-(--text-primary)">{data.contestGroup.title} Electors</h1>
				<Badge variant={statusVariant(data.contestGroup.status)} class="capitalize">
					{formatStatus(data.contestGroup.status)}
				</Badge>
			</div>
			{#if data.contestGroup.description}
				<p class="text-(--text-secondary)">{data.contestGroup.description}</p>
			{/if}
			<p class="text-sm text-(--text-secondary)">
				Showing {data.pagination.totalElectors === 1 ? '1 elector' : `${data.pagination.totalElectors} electors`} with recorded votes in this contest group.
			</p>
		</header>

		{#if data.electors.length === 0}
			<Card>
				<CardHeader>
					<CardTitle>No Electors Yet</CardTitle>
					<CardDescription>No votes have been recorded for this contest group.</CardDescription>
				</CardHeader>
			</Card>
		{:else}
			<div class="space-y-4">
				{#each data.electors as elector (elector.userId)}
					<Card>
						<CardHeader>
							<div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
								<div class="space-y-1">
									<CardTitle>{elector.firstName} {elector.lastName}</CardTitle>
									<CardDescription>
										Username: {elector.username}
									</CardDescription>
								</div>
								<div class="flex flex-col items-start gap-2 lg:items-end">
									<p class="text-sm text-(--text-secondary)">
										Last ballot activity: {formatTimestamp(elector.lastVotedAt)}
									</p>
									{#if elector.voterIdPhoto}
										<Button
											type="button"
											variant="outline"
											size="sm"
											onclick={() => handleOpenVoterIdDialog(elector)}
										>
											View Voter ID
										</Button>
									{:else}
										<p class="text-sm text-(--text-secondary)">No voter ID uploaded</p>
									{/if}
								</div>
							</div>
						</CardHeader>
						<CardContent class="space-y-4">
							<div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
								{#each elector.contests as contest (contest.contestId)}
									<section class="rounded-md border border-(--border-primary) p-4">
										<h2 class="text-sm font-semibold tracking-wide text-(--text-primary) uppercase">
											{contest.contestTitle}
										</h2>
										<ul class="mt-3 space-y-2">
											{#each contest.selections as selection, index (`${contest.contestId}-${index}-${selection}`)}
												<li
													class="rounded-sm bg-(--bg-secondary) px-3 py-2 text-sm text-(--text-primary)"
												>
													{selection}
												</li>
											{/each}
										</ul>
									</section>
								{/each}
							</div>
						</CardContent>
					</Card>
				{/each}
			</div>

			{#if data.pagination.totalPages > 1}
				<Card>
					<CardFooter class="flex flex-wrap items-center justify-between gap-3">
						<div class="text-sm text-(--text-secondary)">
							Page {data.pagination.currentPage} of {data.pagination.totalPages}
						</div>
						<div class="flex flex-wrap gap-2">
							{#if data.pagination.currentPage > 1}
								<Button
									variant="outline"
									size="sm"
									href={pageHref(data.pagination.currentPage - 1)}
								>
									← Previous
								</Button>
							{/if}

							{#each { length: data.pagination.totalPages } as _, i}
								{@const pageNum = i + 1}
								{#if pageNum === data.pagination.currentPage}
									<Button size="sm" disabled>{pageNum}</Button>
								{:else if Math.abs(pageNum - data.pagination.currentPage) <= 1 || pageNum === 1 || pageNum === data.pagination.totalPages}
									<Button variant="outline" size="sm" href={pageHref(pageNum)}>
										{pageNum}
									</Button>
								{:else if pageNum === 2 && data.pagination.currentPage > 3}
									<span class="px-2 py-1.5 text-(--text-secondary)">…</span>
								{/if}
							{/each}

							{#if data.pagination.currentPage < data.pagination.totalPages}
								<Button
									variant="outline"
									size="sm"
									href={pageHref(data.pagination.currentPage + 1)}
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
	bind:this={voterIdDialog}
	oncancel={onVoterIdDialogCancel}
	onclick={onVoterIdDialogClick}
	class="w-full max-w-3xl rounded-lg border border-(--border-primary) bg-(--bg-primary) p-0 text-(--text-primary)"
>
	{#if selectedVoterIdPhoto}
		<div class="p-6">
			<div class="mb-4 flex items-center justify-between gap-2">
				<div>
					<h2 class="text-xl font-semibold">{selectedElectorName}</h2>
					<p class="text-sm text-(--text-secondary)">
						Uploaded: {formatDate(selectedVoterIdPhoto.uploadedAt)}
					</p>
				</div>
				<Button type="button" variant="outline" size="sm" onclick={closeVoterIdDialog}>Close</Button
				>
			</div>

			<div class="overflow-hidden rounded-md border border-(--border-primary)">
				<img
					src={selectedVoterIdPhoto.photoProxyUrl}
					alt={`Voter ID image for ${selectedElectorName}`}
					class="max-h-[70vh] w-full object-contain"
				/>
			</div>
		</div>
	{/if}
</dialog>
