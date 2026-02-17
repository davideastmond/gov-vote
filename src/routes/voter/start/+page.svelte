<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Separator } from '$lib/components/ui/separator';

	let voterId = '';
	let isLoading = false;
	let error = '';

	$: if (voterId) {
		const normalized = voterId.toUpperCase();
		if (normalized !== voterId) {
			voterId = normalized;
		}
		if (error) {
			error = '';
		}
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = '';

		if (!voterId.trim()) {
			error = 'Please enter your voter ID';
			return;
		}

		isLoading = true;

		try {
			// TODO: Replace with actual API call to validate voter ID
			// const response = await fetch('/api/voter/validate', {
			//   method: 'POST',
			//   body: JSON.stringify({ voterId });
			// });

			// Placeholder: simulate API call
			await new Promise((resolve) => setTimeout(resolve, 500));

			// Redirect to next step after validation
			// window.location.href = `/voter/confirm?id=${encodeURIComponent(voterId)}`;
			console.log('Voter ID submitted:', voterId);
		} catch (err) {
			error = 'An error occurred. Please try again.';
			console.error(err);
		} finally {
			isLoading = false;
		}
	}
</script>

<svelte:head>
	<title>Start Voting - Gov Vote</title>
</svelte:head>

<main
	class="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[var(--bg-primary)] to-[var(--bg-secondary)] px-5 py-10"
>
	<Card
		class="mb-10 w-full max-w-[500px] shadow-md transition-all hover:shadow-lg dark:shadow-lg dark:hover:shadow-xl"
	>
		<CardHeader class="text-center">
			<CardTitle class="text-4xl sm:text-2xl">Welcome, Voter</CardTitle>
			<p class="m-0 text-base leading-normal text-[var(--text-secondary)]">
				Please enter your Voter ID to begin voting
			</p>
		</CardHeader>
		<CardContent>
			<form on:submit={handleSubmit} class="flex flex-col gap-6">
				<div class="flex flex-col gap-2">
					<Label for="voter-id-input">Voter ID</Label>
					<Input
						id="voter-id-input"
						type="text"
						placeholder="Enter your 10-digit Voter ID"
						bind:value={voterId}
						disabled={isLoading}
						aria-invalid={error ? 'true' : 'false'}
						aria-describedby={error ? 'error-message' : undefined}
						class="tracking-widest"
					/>
					{#if error}
						<p
							id="error-message"
							class="m-0 flex items-center gap-1.5 text-sm text-red-500 before:content-['⚠️']"
							role="alert"
						>
							{error}
						</p>
					{/if}
				</div>

				<Button type="submit" disabled={isLoading} class="mt-1 w-full">
					{#if isLoading}
						<span
							class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
						></span>
						<span>Processing...</span>
					{:else}
						<span>Continue</span>
					{/if}
				</Button>
			</form>
		</CardContent>
		<Separator />
		<CardFooter class="justify-center">
			<p
				class="m-0 flex items-center gap-3 text-[0.95rem] leading-normal text-[var(--text-secondary)]"
			>
				<span aria-hidden="true" class="flex-shrink-0 text-2xl">📱</span>
				<span>Scanner support coming soon - you'll be able to scan your voter ID card</span>
			</p>
		</CardFooter>
	</Card>

	<Card class="w-full max-w-[500px]">
		<CardHeader>
			<CardTitle class="text-xl">Need Help?</CardTitle>
		</CardHeader>
		<CardContent>
			<ul class="m-0 flex flex-col gap-3 p-0">
				<li class="m-0">
					<a
						href="#locate-id"
						class="inline-block text-[0.95rem] font-medium text-blue-500 no-underline transition-all hover:translate-x-1 hover:underline focus:rounded focus:px-2 focus:py-1 focus:outline focus:outline-[3px] focus:outline-blue-500 dark:text-blue-400 dark:focus:outline-blue-400"
					>
						How to locate your Voter ID
					</a>
				</li>
				<li class="m-0">
					<a
						href="#forgot-id"
						class="inline-block text-[0.95rem] font-medium text-blue-500 no-underline transition-all hover:translate-x-1 hover:underline focus:rounded focus:px-2 focus:py-1 focus:outline focus:outline-[3px] focus:outline-blue-500 dark:text-blue-400 dark:focus:outline-blue-400"
					>
						Forgot your Voter ID?
					</a>
				</li>
				<li class="m-0">
					<a
						href="#contact"
						class="inline-block text-[0.95rem] font-medium text-blue-500 no-underline transition-all hover:translate-x-1 hover:underline focus:rounded focus:px-2 focus:py-1 focus:outline focus:outline-[3px] focus:outline-blue-500 dark:text-blue-400 dark:focus:outline-blue-400"
					>
						Contact Election Office
					</a>
				</li>
			</ul>
		</CardContent>
	</Card>
</main>
