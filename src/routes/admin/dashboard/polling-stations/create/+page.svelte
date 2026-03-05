<script lang="ts">
	import AdminNavToolbar from '$lib/components/AdminNavToolbar.svelte';
	import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
	import {
		batchCreatePollingStationValidator,
		createPollingStationValidator
	} from '$lib/validators/create-polling-station.validator';

	let activeTab = 'individual';

	let stationName = '';
	let streetAddress = '';
	let city = '';
	let state = '';
	let zipCode = '';

	let jsonInput = '';

	let isSingleLoading = false;
	let isBatchLoading = false;

	let singleError = '';
	let singleValidationErrors: string[] = [];
	let singleSuccessMessage = '';

	let batchError = '';
	let batchValidationErrors: string[] = [];
	let batchSuccessMessage = '';

	function clearSingleMessages() {
		singleError = '';
		singleValidationErrors = [];
		singleSuccessMessage = '';
	}

	function clearBatchMessages() {
		batchError = '';
		batchValidationErrors = [];
		batchSuccessMessage = '';
	}

	function resetSingleForm() {
		stationName = '';
		streetAddress = '';
		city = '';
		state = '';
		zipCode = '';
		clearSingleMessages();
	}

	function resetBatchForm() {
		jsonInput = '';
		clearBatchMessages();
	}

	async function handleSingleSubmit(event: Event) {
		event.preventDefault();
		clearSingleMessages();
		isSingleLoading = true;

		try {
			const payload = {
				name: stationName,
				streetAddress,
				city,
				state,
				zipCode
			};

			const validationResult = createPollingStationValidator.safeParse(payload);

			if (!validationResult.success) {
				singleValidationErrors = validationResult.error.issues.map((issue) => {
					const path = issue.path.join('.');
					return `${path || 'Root'}: ${issue.message}`;
				});
				singleError = 'Validation failed. Please check the errors below.';
				isSingleLoading = false;
				return;
			}

			const response = await fetch('/api/polling-stations', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(validationResult.data)
			});

			const result = await response.json();

			if (!response.ok || !result.success) {
				singleError = result.message ?? 'Failed to create polling station.';
				if (Array.isArray(result.details)) {
					singleValidationErrors = result.details;
				}
				isSingleLoading = false;
				return;
			}

			singleSuccessMessage = 'Polling station created successfully.';
			resetSingleForm();
			singleSuccessMessage = 'Polling station created successfully.';
		} catch (error) {
			console.error(error);
			singleError = 'An unexpected error occurred. Please try again.';
		} finally {
			isSingleLoading = false;
		}
	}

	async function handleBatchSubmit(event: Event) {
		event.preventDefault();
		clearBatchMessages();
		isBatchLoading = true;

		try {
			let parsedData: unknown;
			try {
				parsedData = JSON.parse(jsonInput);
			} catch (parseError) {
				batchError = `Invalid JSON: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`;
				isBatchLoading = false;
				return;
			}

			const validationResult = batchCreatePollingStationValidator.safeParse(parsedData);

			if (!validationResult.success) {
				batchValidationErrors = validationResult.error.issues.map((issue) => {
					const path = issue.path.join('.');
					return `${path || 'Root'}: ${issue.message}`;
				});
				batchError = 'Validation failed. Please check the errors below.';
				isBatchLoading = false;
				return;
			}

			const response = await fetch('/api/polling-stations', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(validationResult.data)
			});

			const result = await response.json();

			if (!response.ok || !result.success) {
				batchError = result.message ?? 'Failed to create polling stations.';
				if (Array.isArray(result.details)) {
					batchValidationErrors = result.details;
				}
				isBatchLoading = false;
				return;
			}

			const insertedCount = result?.data?.insertedPollingStationIds?.length ?? 0;
			batchSuccessMessage = `Created ${insertedCount} polling station(s) successfully.`;
		} catch (error) {
			console.error(error);
			batchError = 'An unexpected error occurred. Please try again.';
		} finally {
			isBatchLoading = false;
		}
	}
</script>

<svelte:head>
	<title>Create Polling Stations - Admin Dashboard</title>
</svelte:head>

<main class="min-h-[calc(100vh-8rem)] bg-(--bg-primary) px-6 py-8">
	<div class="mx-auto flex w-full max-w-4xl flex-col gap-8">
		<AdminNavToolbar
			primary={{ label: '← Back to Admin Dashboard', href: '/admin/dashboard' }}
			secondary={{
				label: 'View Polling Stations',
				href: '/admin/dashboard/polling-stations/view'
			}}
		/>

		<header>
			<h1 class="mb-2 text-3xl font-bold text-(--text-primary)">Create Polling Stations</h1>
			<p class="text-(--text-secondary)">
				Create a single polling station or batch create multiple stations using JSON.
			</p>
		</header>

		<Tabs bind:value={activeTab} class="w-full">
			<TabsList class="grid w-full grid-cols-2">
				<TabsTrigger value="individual">Individual</TabsTrigger>
				<TabsTrigger value="batch">Batch JSON</TabsTrigger>
			</TabsList>

			<TabsContent value="individual">
				<Card>
					<CardHeader>
						<CardTitle>Create Individual Polling Station</CardTitle>
					</CardHeader>
					<form on:submit={handleSingleSubmit}>
						<CardContent class="flex flex-col gap-6">
							{#if singleError}
								<Alert variant="destructive">
									<AlertTitle>Error</AlertTitle>
									<AlertDescription>{singleError}</AlertDescription>
								</Alert>
							{/if}

							{#if singleValidationErrors.length > 0}
								<Alert variant="destructive">
									<AlertTitle>Validation Errors</AlertTitle>
									<AlertDescription>
										<ul class="mt-2 list-inside list-disc space-y-1">
											{#each singleValidationErrors as err}
												<li class="text-sm">{err}</li>
											{/each}
										</ul>
									</AlertDescription>
								</Alert>
							{/if}

							{#if singleSuccessMessage}
								<Alert>
									<AlertTitle>Success</AlertTitle>
									<AlertDescription>{singleSuccessMessage}</AlertDescription>
								</Alert>
							{/if}

							<div class="grid gap-4 md:grid-cols-2">
								<div class="flex flex-col gap-2 md:col-span-2">
									<Label for="station-name">Station Name</Label>
									<Input
										id="station-name"
										bind:value={stationName}
										placeholder="Downtown Civic Center"
										disabled={isSingleLoading}
									/>
								</div>

								<div class="flex flex-col gap-2 md:col-span-2">
									<Label for="street-address">Street Address</Label>
									<Input
										id="street-address"
										bind:value={streetAddress}
										placeholder="123 Main St"
										disabled={isSingleLoading}
									/>
								</div>

								<div class="flex flex-col gap-2">
									<Label for="city">City</Label>
									<Input
										id="city"
										bind:value={city}
										placeholder="Springfield"
										disabled={isSingleLoading}
									/>
								</div>

								<div class="flex flex-col gap-2">
									<Label for="state">State</Label>
									<Input
										id="state"
										bind:value={state}
										placeholder="IL"
										disabled={isSingleLoading}
									/>
								</div>

								<div class="flex flex-col gap-2 md:col-span-2">
									<Label for="zip-code">Zip Code</Label>
									<Input
										id="zip-code"
										bind:value={zipCode}
										placeholder="62701"
										disabled={isSingleLoading}
									/>
								</div>
							</div>
						</CardContent>

						<CardFooter class="flex gap-3">
							<Button
								type="submit"
								disabled={isSingleLoading ||
									!stationName.trim() ||
									!streetAddress.trim() ||
									!city.trim() ||
									!state.trim() ||
									!zipCode.trim()}
							>
								{#if isSingleLoading}
									<span
										class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
									></span>
									<span>Creating...</span>
								{:else}
									<span>Create Polling Station</span>
								{/if}
							</Button>
							<Button
								type="button"
								variant="outline"
								onclick={resetSingleForm}
								disabled={isSingleLoading}
							>
								Clear
							</Button>
						</CardFooter>
					</form>
				</Card>
			</TabsContent>

			<TabsContent value="batch">
				<div class="flex flex-col gap-6">
					<Card>
						<CardHeader>
							<CardTitle>JSON Array Format</CardTitle>
						</CardHeader>
						<CardContent>
							<div class="overflow-x-auto">
								<pre class="rounded-md bg-muted p-4 text-sm"><code
										>{`[
  {
    "name": "Downtown Civic Center",
    "streetAddress": "123 Main St",
    "city": "Springfield",
    "state": "IL",
    "zipCode": "62701"
  },
  {
    "name": "Northside Community Hall",
    "streetAddress": "456 Oak Ave",
    "city": "Springfield",
    "state": "IL",
    "zipCode": "62702"
  }
]`}</code
									></pre>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Batch Create Polling Stations</CardTitle>
						</CardHeader>
						<form on:submit={handleBatchSubmit}>
							<CardContent class="flex flex-col gap-6">
								{#if batchError}
									<Alert variant="destructive">
										<AlertTitle>Error</AlertTitle>
										<AlertDescription>{batchError}</AlertDescription>
									</Alert>
								{/if}

								{#if batchValidationErrors.length > 0}
									<Alert variant="destructive">
										<AlertTitle>Validation Errors</AlertTitle>
										<AlertDescription>
											<ul class="mt-2 list-inside list-disc space-y-1">
												{#each batchValidationErrors as err}
													<li class="text-sm">{err}</li>
												{/each}
											</ul>
										</AlertDescription>
									</Alert>
								{/if}

								{#if batchSuccessMessage}
									<Alert>
										<AlertTitle>Success</AlertTitle>
										<AlertDescription>{batchSuccessMessage}</AlertDescription>
									</Alert>
								{/if}

								<div class="flex flex-col gap-2">
									<Label for="json-input">JSON Array</Label>
									<textarea
										id="json-input"
										bind:value={jsonInput}
										placeholder="Paste polling station JSON array here..."
										disabled={isBatchLoading}
										rows="15"
										class="flex min-h-75 w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-base shadow-xs ring-offset-background transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:ring-destructive/40"
									></textarea>
								</div>
							</CardContent>

							<CardFooter class="flex gap-3">
								<Button type="submit" disabled={isBatchLoading || !jsonInput.trim()}>
									{#if isBatchLoading}
										<span
											class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
										></span>
										<span>Creating...</span>
									{:else}
										<span>Create Polling Stations</span>
									{/if}
								</Button>
								<Button
									type="button"
									variant="outline"
									onclick={resetBatchForm}
									disabled={isBatchLoading}
								>
									Clear
								</Button>
							</CardFooter>
						</form>
					</Card>
				</div>
			</TabsContent>
		</Tabs>
	</div>
</main>
