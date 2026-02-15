<script lang="ts">
	let voterId = '';
	let isLoading = false;
	let error = '';

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

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		voterId = target.value.toUpperCase();
		if (error) {
			error = '';
		}
	}
</script>

<svelte:head>
	<title>Start Voting - Gov Vote</title>
</svelte:head>

<main
	class="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[var(--bg-primary)] to-[var(--bg-secondary)] px-5 py-10"
>
	<div
		class="mb-10 w-full max-w-[500px] rounded-xl border bg-[var(--bg-primary)] p-15 shadow-md transition-all hover:shadow-lg sm:p-6 dark:shadow-lg dark:hover:shadow-xl"
		style="border-color: var(--border-color);"
	>
		<div class="mb-10 text-center">
			<h1 class="m-0 mb-3 text-4xl font-bold text-[var(--text-primary)] sm:text-2xl">
				Welcome, Voter
			</h1>
			<p class="m-0 text-base leading-normal text-[var(--text-secondary)]">
				Please enter your Voter ID to begin voting
			</p>
		</div>

		<form on:submit={handleSubmit} class="flex flex-col gap-6">
			<div class="flex flex-col gap-2">
				<label for="voter-id-input" class="text-sm font-semibold text-[var(--text-primary)]">
					Voter ID
				</label>
				<input
					id="voter-id-input"
					type="text"
					placeholder="Enter your 10-digit Voter ID"
					value={voterId}
					on:input={handleInput}
					disabled={isLoading}
					aria-invalid={error ? 'true' : 'false'}
					aria-describedby={error ? 'error-message' : undefined}
					class="rounded-lg border-2 bg-[var(--bg-primary)] px-4 py-3 font-[inherit] text-base tracking-widest text-[var(--text-primary)] transition-all placeholder:text-[var(--text-secondary)] placeholder:opacity-70 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 dark:focus:border-blue-400 dark:focus:shadow-[0_0_0_3px_rgba(96,165,250,0.1)]"
					style="border-color: var(--border-color);"
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

			<button
				type="submit"
				disabled={isLoading}
				class="mt-3 flex items-center justify-center gap-2.5 rounded-lg bg-blue-500 px-6 py-3.5 text-base font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-blue-800 hover:shadow-[0_8px_16px_rgba(59,130,246,0.3)] focus:outline focus:outline-[3px] focus:outline-blue-500 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-blue-400 dark:text-gray-900 dark:hover:bg-blue-500 dark:focus:outline-blue-400"
			>
				{#if isLoading}
					<span
						class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
					></span>
					<span>Processing...</span>
				{:else}
					<span>Continue</span>
				{/if}
			</button>
		</form>

		<div
			class="mt-7.5 rounded-lg border bg-[var(--bg-secondary)] p-4"
			style="border-color: var(--border-color);"
		>
			<p
				class="m-0 flex items-center gap-3 text-[0.95rem] leading-normal text-[var(--text-secondary)]"
			>
				<span aria-hidden="true" class="flex-shrink-0 text-2xl">📱</span>
				<span>Scanner support coming soon - you'll be able to scan your voter ID card</span>
			</p>
		</div>
	</div>

	<div
		class="w-full max-w-[500px] rounded-xl border bg-[var(--bg-secondary)] p-7.5"
		style="border-color: var(--border-color);"
	>
		<h2 class="m-0 mb-5 text-xl font-bold text-[var(--text-primary)]">Need Help?</h2>
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
	</div>
</main>
