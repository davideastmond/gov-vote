<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Separator } from '$lib/components/ui/separator';
	import { onMount } from 'svelte';
	import z from 'zod';

	let voterCardCode = '';
	let isLoading = false;
	let error: null | string = null;

	onMount(() => {
		const queryCode = new URL(window.location.href).searchParams.get('c');

		if (!queryCode) {
			return;
		}

		const isValidUuid = z.uuid().safeParse(queryCode).success;
		if (isValidUuid) {
			voterCardCode = formatUUID(queryCode);
		}
	});

	function formatUUID(value: string): string {
		// Remove all non-hexadecimal characters and hyphens
		const cleaned = value.replace(/[^0-9a-fA-F]/g, '').toUpperCase();

		// Limit to 32 characters (UUID without hyphens)
		const truncated = cleaned.slice(0, 32);

		// Format as UUID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
		if (truncated.length <= 8) {
			return truncated;
		} else if (truncated.length <= 12) {
			return `${truncated.slice(0, 8)}-${truncated.slice(8)}`;
		} else if (truncated.length <= 16) {
			return `${truncated.slice(0, 8)}-${truncated.slice(8, 12)}-${truncated.slice(12)}`;
		} else if (truncated.length <= 20) {
			return `${truncated.slice(0, 8)}-${truncated.slice(8, 12)}-${truncated.slice(12, 16)}-${truncated.slice(16)}`;
		} else {
			return `${truncated.slice(0, 8)}-${truncated.slice(8, 12)}-${truncated.slice(12, 16)}-${truncated.slice(16, 20)}-${truncated.slice(20)}`;
		}
	}

	function handleVoterCodeInput(e: Event) {
		const target = e.target as HTMLInputElement;
		voterCardCode = formatUUID(target.value);

		if (error) {
			error = null;
		}
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = null;

		const result = z.uuid().safeParse(voterCardCode);
		if (!result.success) {
			error = 'Invalid Voter Card Code';
			return;
		}

		isLoading = true;

		try {
			const { ok } = await fetch('/api/token', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ voterCardCode: voterCardCode.toLowerCase() })
			});

			if (!ok) {
				error =
					'We are not able to proceed with that Voter Card Code. Please check your code and try again, or contact your election office for assistance.';
				return;
			}
			// expecting to get a token cookie set by the server, so we can just redirect to the ballot page
			await goto('/voter/ballot');
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
				Please enter your Voter Card Code to begin voting
			</p>
		</CardHeader>
		<CardContent>
			<form on:submit={handleSubmit} class="flex flex-col gap-6">
				<div class="flex flex-col gap-2">
					<Label for="voter-id-input">Voter Card Code</Label>
					<Input
						id="voter-id-input"
						type="text"
						placeholder="Enter your Voter Card Code (e.g., XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX)"
						bind:value={voterCardCode}
						oninput={handleVoterCodeInput}
						disabled={isLoading}
						aria-invalid={error ? 'true' : 'false'}
						aria-describedby={error ? 'error-message' : undefined}
						class="font-mono tracking-widest"
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
				<span>Scanner support coming soon - you'll be able to scan your Voter Card Code</span>
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
						How to locate your Voter Card Code
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
