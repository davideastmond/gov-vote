<script lang="ts">
	import { goto } from '$app/navigation';
	import { signIn } from '@auth/sveltekit/client';
	let username = $state('');
	let password = $state('');
	let isLoading = $state(false);
	let requestError = $state('');

	async function handleSubmit(e: Event) {
		e.preventDefault();
		requestError = '';
		isLoading = true;

		// Basic validation
		if (!username.trim() || !password.trim()) {
			requestError = 'Please enter both username and password';
			isLoading = false;
			return;
		}

		try {
			const { error } = await signIn('credentials', { redirect: false, username, password });
			if (error) {
				requestError = 'Invalid username or password. Please try again.';
				return;
			}
			goto('/admin/dashboard');
		} catch (err) {
			requestError =
				err instanceof Error ? err.message : 'Server error: Login failed. Please try again.';
		} finally {
			isLoading = false;
		}
	}
</script>

<svelte:head>
	<title>Admin Login - Gov Vote</title>
</svelte:head>

<main class="flex min-h-[calc(100vh-8rem)] items-center justify-center p-8 sm:p-4">
	<div
		class="w-full max-w-md rounded-xl border bg-[var(--bg-secondary)] p-10 shadow-md transition-all sm:p-6"
		style="border-color: var(--border-color);"
	>
		<div class="mb-8 text-center">
			<h1 class="mb-2 text-3xl font-bold text-[var(--text-primary)] sm:text-2xl">Admin Login</h1>
			<p class="m-0 text-sm text-[var(--text-secondary)]">
				Enter your credentials to access the admin panel
			</p>
		</div>

		<form
			onsubmit={handleSubmit}
			class="flex flex-col gap-5"
			novalidate
			aria-label="Admin login form"
		>
			{#if requestError}
				<div
					id="login-error"
					class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-900 dark:text-red-200"
					role="alert"
					aria-live="polite"
				>
					{requestError}
				</div>
			{/if}

			<div class="flex flex-col gap-2">
				<label for="username" class="text-sm font-medium text-[var(--text-primary)]">
					Username
				</label>
				<input
					type="text"
					id="username"
					name="username"
					bind:value={username}
					class="w-full rounded-lg border bg-[var(--bg-primary)] px-3.5 py-2.5 text-base text-[var(--text-primary)] transition-all placeholder:text-[var(--text-secondary)] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
					style="border-color: var(--border-color);"
					placeholder="Enter your username"
					disabled={isLoading}
					autocomplete="username"
					required
					aria-required="true"
					aria-invalid={requestError ? 'true' : 'false'}
					aria-describedby={requestError ? 'login-error' : undefined}
				/>
			</div>

			<div class="flex flex-col gap-2">
				<label for="password" class="text-sm font-medium text-[var(--text-primary)]">
					Password
				</label>
				<input
					type="password"
					name="password"
					id="password"
					bind:value={password}
					class="w-full rounded-lg border bg-[var(--bg-primary)] px-3.5 py-2.5 text-base text-[var(--text-primary)] transition-all placeholder:text-[var(--text-secondary)] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
					style="border-color: var(--border-color);"
					placeholder="Enter your password"
					disabled={isLoading}
					autocomplete="current-password"
					required
					aria-required="true"
					aria-invalid={requestError ? 'true' : 'false'}
					aria-describedby={requestError ? 'login-error' : undefined}
				/>
			</div>

			<button
				type="submit"
				class="mt-2 w-full rounded-lg bg-blue-500 px-4 py-3 text-base font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-blue-600 hover:shadow-md focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-blue-600 dark:hover:bg-blue-700"
				disabled={isLoading}
				aria-busy={isLoading}
			>
				{isLoading ? 'Signing in...' : 'Sign In'}
			</button>
		</form>
	</div>
</main>
