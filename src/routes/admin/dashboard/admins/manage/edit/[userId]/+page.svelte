<script lang="ts">
	import AdminNavToolbar from '$lib/components/AdminNavToolbar.svelte';
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { formatDate } from '$lib/utils/date';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<svelte:head>
	<title>Edit Admin - Gov Vote</title>
</svelte:head>

<main class="min-h-[calc(100vh-8rem)] bg-(--bg-primary) px-6 py-8">
	<div class="mx-auto flex w-full max-w-3xl flex-col gap-6">
		<AdminNavToolbar
			primary={{ label: '← Back to Admin Dashboard', href: '/admin/dashboard' }}
			secondary={{ label: 'Back to Manage Admins', href: '/admin/dashboard/admins/manage/view' }}
		/>

		<header>
			<h1 class="text-3xl font-bold text-(--text-primary)">Edit Admin</h1>
			<p class="mt-1 text-(--text-secondary)">Update profile and account role for this user.</p>
		</header>

		{#if form?.message}
			<Alert variant={form.success ? 'default' : 'destructive'}>
				<AlertTitle>{form.success ? 'Success' : 'Update failed'}</AlertTitle>
				<AlertDescription>{form.message}</AlertDescription>
			</Alert>
		{/if}

		<Card>
			<CardHeader>
				<CardTitle>Account Summary</CardTitle>
			</CardHeader>
			<CardContent class="space-y-2">
				<p class="text-xs font-semibold text-(--text-secondary)">USER ID</p>
				<p class="font-mono text-sm text-(--text-primary)">{data.admin.id}</p>
				<p class="text-xs font-semibold text-(--text-secondary)">CREATED</p>
				<p class="text-sm text-(--text-primary)">{formatDate(data.admin.createdAt)}</p>
				<p class="text-xs font-semibold text-(--text-secondary)">LAST UPDATED</p>
				<p class="text-sm text-(--text-primary)">{formatDate(data.admin.updatedAt)}</p>
			</CardContent>
		</Card>

		<Card>
			<CardHeader>
				<CardTitle>Edit Admin Details</CardTitle>
			</CardHeader>
			<CardContent>
				<form method="POST" action="?/updateAdmin" class="space-y-4">
					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div class="space-y-2">
							<Label for="firstName">First Name</Label>
							<Input id="firstName" name="firstName" value={data.admin.firstName} required />
						</div>
						<div class="space-y-2">
							<Label for="lastName">Last Name</Label>
							<Input id="lastName" name="lastName" value={data.admin.lastName} required />
						</div>
					</div>

					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div class="space-y-2">
							<Label for="username">Username</Label>
							<Input id="username" name="username" value={data.admin.username} required />
						</div>
						<div class="space-y-2">
							<Label for="email">Email</Label>
							<Input id="email" name="email" type="email" value={data.admin.email} required />
						</div>
					</div>

					<div class="space-y-2">
						<Label for="role">Role</Label>
						<select
							id="role"
							name="role"
							class="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-base shadow-xs transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
							required
						>
							<option value="admin" selected={data.admin.role === 'admin'}>admin</option>
							<option value="voter" selected={data.admin.role === 'voter'}>voter</option>
						</select>
					</div>

					<div class="flex flex-wrap justify-end gap-3 pt-2">
						<Button variant="outline" type="button" href="/admin/dashboard/admins/manage/view">
							Cancel
						</Button>
						<Button type="submit" variant="outline">Save Changes</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	</div>
</main>
