<svelte:head>
	<title>Create Admin - Gov Vote</title>
</svelte:head>

<main class="min-h-[calc(100vh-8rem)] bg-[var(--bg-primary)] px-6 py-8">
	<div class="mx-auto w-full max-w-2xl">
		<header class="mb-6">
			<h1 class="mb-2 text-3xl font-bold text-[var(--text-primary)]">Create Admin</h1>
			<p class="text-[var(--text-secondary)]">
				Set up a new admin account. This form is UI-only and not wired to any API.
			</p>
		</header>

		<form
			class="rounded-xl border bg-[var(--bg-secondary)] p-6 shadow-sm"
			style="border-color: var(--border-color);"
			aria-label="Create admin form"
		>
			<div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
				<div class="flex flex-col gap-2">
					<label for="username" class="text-sm font-semibold text-[var(--text-primary)]">
						Username
					</label>
					<input
						id="username"
						type="text"
						placeholder="Enter username"
						class="rounded-lg border bg-[var(--bg-primary)] px-3.5 py-2.5 text-base text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
						style="border-color: var(--border-color);"
						required
						autocomplete="username"
					/>
				</div>

				<div class="flex flex-col gap-2">
					<label for="firstName" class="text-sm font-semibold text-[var(--text-primary)]">
						First Name
					</label>
					<input
						id="firstName"
						type="text"
						placeholder="Enter first name"
						class="rounded-lg border bg-[var(--bg-primary)] px-3.5 py-2.5 text-base text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
						style="border-color: var(--border-color);"
						required
						autocomplete="given-name"
					/>
				</div>

				<div class="flex flex-col gap-2">
					<label for="lastName" class="text-sm font-semibold text-[var(--text-primary)]">
						Last Name
					</label>
					<input
						id="lastName"
						type="text"
						placeholder="Enter last name"
						class="rounded-lg border bg-[var(--bg-primary)] px-3.5 py-2.5 text-base text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
						style="border-color: var(--border-color);"
						required
						autocomplete="family-name"
					/>
				</div>

				<div class="flex flex-col gap-2">
					<label for="temporaryPassword" class="text-sm font-semibold text-[var(--text-primary)]">
						Temporary Password
					</label>
					<input
						id="temporaryPassword"
						type="text"
						placeholder="Enter temporary password"
						class="rounded-lg border bg-[var(--bg-primary)] px-3.5 py-2.5 text-base text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
						style="border-color: var(--border-color);"
						required
						autocomplete="new-password"
					/>
				</div>

				<div class="flex flex-col gap-2 sm:col-span-2">
					<label for="role" class="text-sm font-semibold text-[var(--text-primary)]"> Role </label>
					<select
						id="role"
						class="rounded-lg border bg-[var(--bg-primary)] px-3.5 py-2.5 text-base text-[var(--text-primary)] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
						style="border-color: var(--border-color);"
						required
					>
						<option value="admin">admin</option>
					</select>
				</div>
			</div>

			<div class="mt-6 flex flex-wrap justify-end gap-3">
				<button
					type="button"
					class="rounded-lg border px-4 py-2 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-primary)] focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-blue-500"
					style="border-color: var(--border-color);"
				>
					Cancel
				</button>
				<button
					type="submit"
					class="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-600 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-blue-500 dark:bg-blue-600 dark:hover:bg-blue-700"
				>
					Create Admin
				</button>
			</div>
		</form>
	</div>
</main>
