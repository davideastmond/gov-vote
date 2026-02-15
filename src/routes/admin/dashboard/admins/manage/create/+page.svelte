<script lang="ts">
	import { createAdminUser } from './create-admin.remote';

	let firstName = '';
	let lastName = '';
	let username = '';
	let email = '';
	let isBusy = false;

	let submitErrors = {
		firstName: '',
		lastName: '',
		email: '',
		username: '',
		password: ''
	};

	/**
	 * Generates a username from firstName and lastName with a random 3-digit number appended.
	 * @param firstName - The first name to use
	 * @param lastName - The last name to use
	 * @returns A generated username string (e.g., "johnsmith456")
	 */
	function generateUsername(firstName: string, lastName: string): string {
		if (!firstName.trim() || !lastName.trim()) {
			return '';
		}

		// Combine first and last name, convert to lowercase, and remove spaces
		const baseUsername = (firstName + lastName).toLowerCase().replace(/\s+/g, '');

		// Generate a random 3-digit number (0-999)
		const randomNumber = Math.floor(Math.random() * 1000);

		return `${baseUsername}${randomNumber}`;
	}

	function handleFirstNameChange() {
		username = generateUsername(firstName, lastName);
	}

	function handleLastNameChange() {
		username = generateUsername(firstName, lastName);
	}

	function generateSecurePassword(length: number = 12): string {
		const charset =
			'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=';
		let password = '';
		for (let i = 0; i < length; i++) {
			const randomIndex = Math.floor(Math.random() * charset.length);
			password += charset[randomIndex];
		}
		return password;
	}

	async function handleSubmit() {
		const newUsername = username || generateUsername(firstName, lastName);
		const newPassword = generateSecurePassword();

		isBusy = true;
		try {
			const result = await createAdminUser({
				username: newUsername,
				firstName,
				lastName,
				password: newPassword,
				email
			});

			// on success
			if (result && result.errors) {
				submitErrors = { ...submitErrors, ...result.errors };
			}
		} catch (error) {
			console.error('Error creating admin user:', error);
			// Here you could also set an error message to display in the UI
			submitErrors = {
				...submitErrors,
				password: 'Failed to create admin user. Please try again.'
			};
		} finally {
			isBusy = false;
		}
	}
</script>

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
			on:submit|preventDefault={handleSubmit}
		>
			<!-- Personal Information Section -->
			<div class="mb-6">
				<h2 class="mb-4 text-lg font-semibold text-[var(--text-primary)]">Personal Information</h2>
				<div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
					<div class="flex flex-col gap-2">
						<label for="firstName" class="text-sm font-semibold text-[var(--text-primary)]">
							First Name
						</label>
						<input
							id="firstName"
							type="text"
							placeholder="Enter first name"
							bind:value={firstName}
							on:change={handleFirstNameChange}
							class="rounded-lg border bg-[var(--bg-primary)] px-3.5 py-2.5 text-base text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
							style="border-color: var(--border-color);"
							required
							autocomplete="given-name"
						/>
						{#if submitErrors.firstName}
							<p class="mt-1 text-sm text-red-500">{submitErrors.firstName}</p>
						{/if}
					</div>

					<div class="flex flex-col gap-2">
						<label for="lastName" class="text-sm font-semibold text-[var(--text-primary)]">
							Last Name
						</label>
						<input
							id="lastName"
							type="text"
							placeholder="Enter last name"
							bind:value={lastName}
							on:change={handleLastNameChange}
							class="rounded-lg border bg-[var(--bg-primary)] px-3.5 py-2.5 text-base text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
							style="border-color: var(--border-color);"
							required
							autocomplete="family-name"
						/>
						{#if submitErrors.lastName}
							<p class="mt-1 text-sm text-red-500">{submitErrors.lastName}</p>
						{/if}
					</div>
				</div>

				<div class="mt-5 flex flex-col gap-2">
					<label for="email" class="text-sm font-semibold text-[var(--text-primary)]">
						Email Address
					</label>
					<input
						id="email"
						type="email"
						placeholder="Enter email address"
						bind:value={email}
						class="rounded-lg border bg-[var(--bg-primary)] px-3.5 py-2.5 text-base text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
						style="border-color: var(--border-color);"
						required
						autocomplete="email"
					/>
					{#if submitErrors.email}
						<p class="mt-1 text-sm text-red-500">{submitErrors.email}</p>
					{/if}
				</div>
			</div>

			<!-- Account Details Section -->
			<div class="mb-6">
				<h2 class="mb-4 text-lg font-semibold text-[var(--text-primary)]">Account Details</h2>
				<div class="flex flex-col gap-2">
					<label for="username" class="text-sm font-semibold text-[var(--text-primary)]">
						Username
						<span class="ml-2 text-xs font-normal text-[var(--text-secondary)]">
							(Auto-generated from name)
						</span>
					</label>
					<input
						id="username"
						type="text"
						placeholder="Enter username"
						bind:value={username}
						class="rounded-lg border bg-[var(--bg-primary)] px-3.5 py-2.5 text-base text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
						style="border-color: var(--border-color);"
						required
						autocomplete="username"
					/>
					{#if submitErrors.username}
						<p class="mt-1 text-sm text-red-500">{submitErrors.username}</p>
					{/if}
				</div>

				<div class="mt-5 flex flex-col gap-2">
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

			<!-- Form Actions -->
			<div
				class="flex flex-wrap justify-end gap-3 border-t pt-6"
				style="border-color: var(--border-color);"
			>
				<button
					class="rounded-lg bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-300 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-gray-400 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
				>
					<a href="/admin/dashboard/admins/manage"> Cancel </a>
				</button>

				<button
					type="submit"
					disabled={isBusy}
					class="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-600 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-blue-500 dark:bg-blue-600 dark:hover:bg-blue-700"
				>
					Create Admin
				</button>
			</div>
		</form>
	</div>
</main>
