<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Separator } from '$lib/components/ui/separator';
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

	function resetErrors() {
		submitErrors = {
			firstName: '',
			lastName: '',
			email: '',
			username: '',
			password: ''
		};
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
		resetErrors();
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
			<a
				href="/admin/dashboard"
				class="block text-sm text-(--text-secondary) hover:text-(--text-primary)"
			>
				&larr; Back to Dashboard
			</a>
			<a
				href="/admin/dashboard/admins/manage"
				class="mb-2 inline-block text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
			>
				&larr; Back to Manage Admins
			</a>
			<h1 class="mb-2 text-3xl font-bold text-[var(--text-primary)]">Create Admin</h1>
			<p class="text-[var(--text-secondary)]">Set up a new admin account.</p>
		</header>

		<form aria-label="Create admin form" on:submit|preventDefault={handleSubmit}>
			<Card>
				<CardHeader>
					<CardTitle>Personal Information</CardTitle>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div class="space-y-2">
							<Label for="firstName">First Name</Label>
							<Input
								id="firstName"
								type="text"
								placeholder="Enter first name"
								bind:value={firstName}
								onchange={handleFirstNameChange}
								required
								autocomplete="given-name"
							/>
							{#if submitErrors.firstName}
								<p class="text-sm text-red-500">{submitErrors.firstName}</p>
							{/if}
						</div>

						<div class="space-y-2">
							<Label for="lastName">Last Name</Label>
							<Input
								id="lastName"
								type="text"
								placeholder="Enter last name"
								bind:value={lastName}
								onchange={handleLastNameChange}
								required
								autocomplete="family-name"
							/>
							{#if submitErrors.lastName}
								<p class="text-sm text-red-500">{submitErrors.lastName}</p>
							{/if}
						</div>
					</div>

					<div class="space-y-2">
						<Label for="email">Email Address</Label>
						<Input
							id="email"
							type="email"
							placeholder="Enter email address"
							bind:value={email}
							required
							autocomplete="email"
						/>
						{#if submitErrors.email}
							<p class="text-sm text-red-500">{submitErrors.email}</p>
						{/if}
					</div>
				</CardContent>

				<Separator />

				<CardHeader>
					<CardTitle>Account Details</CardTitle>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="space-y-2">
						<Label for="username">
							Username
							<span class="ml-2 text-xs font-normal text-muted-foreground">
								(Auto-generated from name)
							</span>
						</Label>
						<Input
							id="username"
							type="text"
							placeholder="Enter username"
							bind:value={username}
							required
							autocomplete="username"
						/>
						{#if submitErrors.username}
							<p class="text-sm text-red-500">{submitErrors.username}</p>
						{/if}
					</div>

					<div class="space-y-2">
						<Label for="role">Role</Label>
						<select
							id="role"
							class="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-base shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
							required
						>
							<option value="admin">admin</option>
						</select>
					</div>
				</CardContent>

				<CardFooter class="justify-end gap-3 border-t">
					<Button variant="outline" type="button" href="/admin/dashboard/admins/manage">
						Cancel
					</Button>
					<Button type="submit" disabled={isBusy}>
						{isBusy ? 'Creating...' : 'Create Admin'}
					</Button>
				</CardFooter>
			</Card>
		</form>
	</div>
</main>
