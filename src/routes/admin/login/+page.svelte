<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
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
			await invalidateAll();
			if (error) {
				requestError = 'Invalid username or password. Please try again.';
				return;
			}
			await goto('/admin/dashboard');
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
	<Card class="w-full max-w-md">
		<CardHeader class="text-center">
			<CardTitle class="text-3xl sm:text-2xl">Admin Login</CardTitle>
			<p class="m-0 text-sm text-muted-foreground">
				Enter your credentials to access the admin panel
			</p>
		</CardHeader>
		<CardContent>
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
					<Label for="username">Username</Label>
					<Input
						type="text"
						id="username"
						name="username"
						bind:value={username}
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
					<Label for="password">Password</Label>
					<Input
						type="password"
						name="password"
						id="password"
						bind:value={password}
						placeholder="Enter your password"
						disabled={isLoading}
						autocomplete="current-password"
						required
						aria-required="true"
						aria-invalid={requestError ? 'true' : 'false'}
						aria-describedby={requestError ? 'login-error' : undefined}
					/>
				</div>

				<Button type="submit" class="mt-2 w-full" disabled={isLoading} aria-busy={isLoading}>
					{isLoading ? 'Signing in...' : 'Sign In'}
				</Button>
			</form>
		</CardContent>
	</Card>
</main>
