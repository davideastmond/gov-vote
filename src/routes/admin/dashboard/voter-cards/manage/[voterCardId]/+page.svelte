<script lang="ts">
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Label } from '$lib/components/ui/label';
	import {
		formatVoterCardStatus,
		getVoterCardFullAddress,
		getVoterCardFullName,
		getVoterCardStatusVariant
	} from '$lib/utils/voter-card';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<svelte:head>
	<title>Voter Card Details - Gov Vote</title>
</svelte:head>

<main class="min-h-[calc(100vh-8rem)] bg-(--bg-primary) px-6 py-8">
	<div class="mx-auto flex w-full max-w-4xl flex-col gap-6">
		<header>
			<a
				href="/admin/dashboard/voter-cards/manage"
				class="mb-2 inline-block text-sm text-(--text-secondary) hover:text-(--text-primary)"
			>
				← Back to Voter Cards
			</a>
			<h1 class="text-3xl font-bold text-(--text-primary)">Voter Card Details</h1>
			<p class="mt-1 text-(--text-secondary)">
				Manage voter card status and print workflow details.
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
				<div class="flex flex-wrap items-start justify-between gap-3">
					<div>
						<CardTitle class="font-mono text-lg">{data.voterCard.cardNumber}</CardTitle>
						<p class="mt-1 text-sm text-(--text-secondary)">
							{getVoterCardFullName(data.voterCard.firstName, data.voterCard.lastName)}
						</p>
					</div>
					<Badge variant={getVoterCardStatusVariant(data.voterCard.status)} class="capitalize">
						{formatVoterCardStatus(data.voterCard.status)}
					</Badge>
				</div>
			</CardHeader>
			<CardContent class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<section class="space-y-1">
					<p class="text-xs font-semibold text-(--text-secondary)">CONTEST GROUP</p>
					<p class="text-sm text-(--text-primary)">{data.voterCard.contestGroupName}</p>
				</section>
				<section class="space-y-1">
					<p class="text-xs font-semibold text-(--text-secondary)">ADDRESS</p>
					<p class="text-sm text-(--text-primary)">
						{getVoterCardFullAddress(
							data.voterCard.streetAddress,
							data.voterCard.city,
							data.voterCard.state,
							data.voterCard.zipCode
						)}
					</p>
				</section>
			</CardContent>
		</Card>

		<Card>
			<CardHeader>
				<CardTitle>Update Voter Card Status</CardTitle>
			</CardHeader>
			<CardContent>
				<form method="POST" action="?/updateStatus" class="space-y-2">
					<Label for="voter-card-status">Status</Label>
					<div class="flex flex-wrap items-center gap-2">
						<select
							id="voter-card-status"
							name="cardStatus"
							class="flex h-9 w-40 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
						>
							<option value="generated" selected={data.voterCard.status === 'generated'}>
								Generated
							</option>
							<option value="active" selected={data.voterCard.status === 'active'}>Active</option>
							<option value="inactive" selected={data.voterCard.status === 'inactive'}>
								Inactive
							</option>
						</select>
						<Button type="submit" variant="outline">Save Status</Button>
					</div>
				</form>
			</CardContent>
		</Card>

		<Card>
			<CardHeader>
				<CardTitle>Print and Mail Out</CardTitle>
			</CardHeader>
			<CardContent class="flex flex-col gap-3">
				<p class="text-sm text-(--text-secondary)">
					Generate and print a PDF version of this voter card for mail distribution.
				</p>
				<Button type="button" variant="outline">Generate & Print PDF</Button>
				<p class="text-xs text-(--text-secondary)">
					PDF generation is coming soon. This button is a placeholder for future integration.
				</p>
			</CardContent>
		</Card>
	</div>
</main>
