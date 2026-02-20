<script lang="ts">
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Label } from '$lib/components/ui/label';
	import { eligibilityValidator } from '$lib/validators/create-eligibility.validator';

	let jsonInput = '';
	let isLoading = false;
	let error = '';
	let validationErrors: string[] = [];
	let successMessage = '';

	function handleReset() {
		jsonInput = '';
		error = '';
		validationErrors = [];
		successMessage = '';
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = '';
		validationErrors = [];
		successMessage = '';
		isLoading = true;

		try {
			let parsedData: unknown;
			try {
				parsedData = JSON.parse(jsonInput);
			} catch (parseError) {
				error = `Invalid JSON: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`;
				isLoading = false;
				return;
			}

			const validationResult = eligibilityValidator.safeParse(parsedData);

			if (!validationResult.success) {
				const errors = validationResult.error.issues.map((err) => {
					const path = err.path.join('.');
					return `${path || 'Root'}: ${err.message}`;
				});
				validationErrors = errors;
				error = 'Validation failed. Please check the errors below.';
				isLoading = false;
				return;
			}

			const response = await fetch('/api/eligibility', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(validationResult.data)
			});

			const result = await response.json();

			if (!response.ok || !result.success) {
				error = result.message ?? 'Failed to submit eligibility entries.';
				if (Array.isArray(result.details)) {
					validationErrors = result.details;
				}
				isLoading = false;
				return;
			}

			const processedEntries = result?.details?.processedEntries ?? validationResult.data.length;
			successMessage = `Successfully submitted ${processedEntries} eligibility record(s).`;
			jsonInput = '';
		} catch (err) {
			error = 'An unexpected error occurred. Please try again.';
			console.error(err);
		} finally {
			isLoading = false;
		}
	}
</script>

<svelte:head>
	<title>Create Voter Eligibility - Admin Dashboard</title>
</svelte:head>

<main class="min-h-[calc(100vh-8rem)] bg-(--bg-primary) px-6 py-8">
	<div class="mx-auto flex w-full max-w-4xl flex-col gap-8">
		<header>
			<a
				href="/admin/dashboard"
				class="mb-2 inline-block text-sm text-(--text-secondary) hover:text-(--text-primary)"
			>
				&larr; Back to Dashboard
			</a>
			<h1 class="mb-2 text-3xl font-bold text-(--text-primary)">Create Voter Eligibility</h1>
			<p class="text-(--text-secondary)">
				Batch upload eligibility entries by pasting a JSON array of eligibility objects.
			</p>
		</header>

		<Card>
			<CardHeader>
				<CardTitle>JSON Array Format</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="overflow-x-auto">
					<pre class="rounded-md bg-slate-900 p-4 text-sm text-slate-100"><code
							>{`[
  {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "pollingStationId": "550e8400-e29b-41d4-a716-446655440001",
    "contestGroupId": "550e8400-e29b-41d4-a716-446655440002",
    "contestId": "550e8400-e29b-41d4-a716-446655440003",
    "isEligible": true,
    "isComplete": false
  }
]`}</code
						></pre>
				</div>
			</CardContent>
		</Card>

		<Card>
			<CardHeader>
				<CardTitle>Submit Eligibility JSON</CardTitle>
			</CardHeader>
			<form on:submit={handleSubmit}>
				<CardContent class="flex flex-col gap-6">
					{#if error}
						<Alert variant="destructive">
							<AlertTitle>Error</AlertTitle>
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					{/if}

					{#if validationErrors.length > 0}
						<Alert variant="destructive">
							<AlertTitle>Validation Errors</AlertTitle>
							<AlertDescription>
								<ul class="mt-2 list-inside list-disc space-y-1">
									{#each validationErrors as err}
										<li class="text-sm">{err}</li>
									{/each}
								</ul>
							</AlertDescription>
						</Alert>
					{/if}

					{#if successMessage}
						<Alert variant="default" class="border-green-500 bg-green-50 dark:bg-green-950">
							<AlertTitle class="text-green-700 dark:text-green-300">Success</AlertTitle>
							<AlertDescription class="text-green-600 dark:text-green-400">
								{successMessage}
							</AlertDescription>
						</Alert>
					{/if}

					<div class="flex flex-col gap-2">
						<Label for="json-input">JSON Array</Label>
						<textarea
							id="json-input"
							bind:value={jsonInput}
							placeholder="Paste your eligibility JSON array here..."
							disabled={isLoading}
							rows="15"
							class="flex min-h-75 w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-base shadow-xs ring-offset-background transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:ring-destructive/40"
						></textarea>
					</div>
				</CardContent>

				<CardFooter class="flex gap-3">
					<Button type="submit" disabled={isLoading || !jsonInput.trim()}>
						{#if isLoading}
							<span
								class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
							></span>
							<span>Submitting...</span>
						{:else}
							<span>Validate & Submit</span>
						{/if}
					</Button>
					<Button type="button" variant="outline" onclick={handleReset} disabled={isLoading}>
						Clear
					</Button>
				</CardFooter>
			</form>
		</Card>
	</div>
</main>
