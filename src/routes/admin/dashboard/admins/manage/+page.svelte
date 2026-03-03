<script lang="ts">
	import AdminNavToolbar from '$lib/components/AdminNavToolbar.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
</script>

<svelte:head>
	<title>Manage Admins - Gov Vote</title>
</svelte:head>

<main class="min-h-[calc(100vh-8rem)] bg-[var(--bg-primary)] px-6 py-8">
	<div class="mx-auto flex w-full max-w-3xl flex-col gap-6">
		<AdminNavToolbar primary={{ label: '← Back to Admin Dashboard', href: '/admin/dashboard' }} />

		<header>
			<h1 class="mb-2 text-3xl font-bold text-[var(--text-primary)]">Manage Admins</h1>
			<p class="text-[var(--text-secondary)]">Create, edit, or delete admin users.</p>
		</header>

		<Card>
			<CardHeader>
				<CardTitle>Admin Options</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
					<a href="/admin/dashboard/admins/manage/create" class="block">
						<Button
							variant="outline"
							class="flex h-auto w-full flex-col items-start gap-2 px-4 py-4 text-left"
						>
							<span class="text-base font-semibold">Create Admin</span>
							<span class="text-sm font-normal text-[var(--text-secondary)]">
								Add a new admin user account.
							</span>
						</Button>
					</a>
					<a href="/admin/dashboard/admins/manage/view" class="block">
						<Button
							variant="outline"
							class="flex h-auto w-full flex-col items-start gap-2 px-4 py-4 text-left"
						>
							<span class="text-base font-semibold">Edit Admin</span>
							<span class="text-sm font-normal text-wrap text-[var(--text-secondary)]">
								View and edit admins / account details.
							</span>
						</Button>
					</a>
				</div>
			</CardContent>
		</Card>
	</div>
</main>
