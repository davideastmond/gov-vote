<svelte:head>
	<title>Manage Admins - Gov Vote</title>
</svelte:head>

<main class="min-h-[calc(100vh-8rem)] bg-[var(--bg-primary)] px-6 py-8">
	<div class="mx-auto flex w-full max-w-3xl flex-col gap-6">
		<header>
			<h1 class="mb-2 text-3xl font-bold text-[var(--text-primary)]">Manage Admins</h1>
			<p class="text-[var(--text-secondary)]">
				Create, edit, or delete admin users. No actions are wired yet.
			</p>
		</header>

		<section
			class="rounded-xl border bg-[var(--bg-secondary)] p-6"
			style="border-color: var(--border-color);"
		>
			<h2 class="mb-4 text-xl font-bold text-[var(--text-primary)]">Admin Options</h2>
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
				<a href="/admin/dashboard/admins/manage/create" class="block">
					<button
						type="button"
						class="flex w-full flex-col items-start gap-2 rounded-lg border bg-[var(--bg-primary)] px-4 py-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-blue-500"
						style="border-color: var(--border-color);"
					>
						<span class="text-base font-semibold text-[var(--text-primary)]">Create Admin</span>
						<span class="text-sm text-[var(--text-secondary)]">
							Add a new admin user account.
						</span>
					</button>
				</a>

				<button
					type="button"
					class="flex w-full flex-col items-start gap-2 rounded-lg border bg-[var(--bg-primary)] px-4 py-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-blue-500"
					style="border-color: var(--border-color);"
				>
					<span class="text-base font-semibold text-[var(--text-primary)]">Edit Admin</span>
					<span class="text-sm text-[var(--text-secondary)]">
						Update admin roles or account details.
					</span>
				</button>
				<button
					type="button"
					class="flex w-full flex-col items-start gap-2 rounded-lg border bg-[var(--bg-primary)] px-4 py-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-blue-500"
					style="border-color: var(--border-color);"
				>
					<span class="text-base font-semibold text-[var(--text-primary)]">Delete Admin</span>
					<span class="text-sm text-[var(--text-secondary)]"> Remove an admin user account. </span>
				</button>
			</div>
		</section>
	</div>
</main>
