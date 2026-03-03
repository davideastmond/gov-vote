<script lang="ts">
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<svelte:head>
	<title>Voter Details - Gov Vote</title>
</svelte:head>

<main class="min-h-[calc(100vh-8rem)] bg-(--bg-primary) px-6 py-8">
	<div class="mx-auto flex w-full max-w-3xl flex-col gap-6">
		<header>
			<a
				href="/admin/dashboard/voters/manage"
				class="mb-2 inline-block text-sm text-(--text-secondary) hover:text-(--text-primary)"
			>
				← Back to Manage Voters
			</a>
			<h1 class="text-3xl font-bold text-(--text-primary)">Voter Details</h1>
			<p class="mt-1 text-(--text-secondary)">
				Update voter profile information and address details.
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
				<CardTitle>{data.voter.firstName} {data.voter.lastName}</CardTitle>
			</CardHeader>
			<CardContent class="space-y-2">
				<p class="text-xs font-semibold text-(--text-secondary)">USER ID</p>
				<p class="font-mono text-sm text-(--text-primary)">{data.voter.id}</p>
				<p class="text-xs font-semibold text-(--text-secondary)">USERNAME</p>
				<p class="text-sm text-(--text-primary)">{data.voter.username}</p>
				<p class="text-xs font-semibold text-(--text-secondary)">EMAIL</p>
				<p class="text-sm text-(--text-primary)">{data.voter.email}</p>
			</CardContent>
		</Card>

		<Card>
			<CardHeader>
				<CardTitle>Edit Voter</CardTitle>
			</CardHeader>
			<CardContent>
				<form method="POST" action="?/updateVoter" class="space-y-4">
					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div class="space-y-2">
							<Label for="firstName">First Name</Label>
							<Input id="firstName" name="firstName" value={data.voter.firstName} required />
						</div>
						<div class="space-y-2">
							<Label for="lastName">Last Name</Label>
							<Input id="lastName" name="lastName" value={data.voter.lastName} required />
						</div>
					</div>

					<div class="space-y-2">
						<Label for="streetAddress">Street Address</Label>
						<Input
							id="streetAddress"
							name="streetAddress"
							value={data.voter.streetAddress ?? ''}
							required
						/>
					</div>

					<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
						<div class="space-y-2 md:col-span-1">
							<Label for="city">City</Label>
							<Input id="city" name="city" value={data.voter.city ?? ''} required />
						</div>
						<div class="space-y-2 md:col-span-1">
							<Label for="state">State</Label>
							<Input id="state" name="state" value={data.voter.state ?? ''} required />
						</div>
						<div class="space-y-2 md:col-span-1">
							<Label for="zipCode">Zip Code</Label>
							<Input id="zipCode" name="zipCode" value={data.voter.zipCode ?? ''} required />
						</div>
					</div>

					<div class="pt-2">
						<Button type="submit" variant="outline">Save Changes</Button>
					</div>
				</form>
			</CardContent>
		</Card>

		<Card>
			<CardHeader>
				<CardTitle>Contest Eligibilities</CardTitle>
			</CardHeader>
			<CardContent>
				<Button href={`/admin/dashboard/voters/${data.voter.id}/eligibility`} variant="outline">
					Edit voter contest eligibilities
				</Button>
			</CardContent>
		</Card>
	</div>
</main>
