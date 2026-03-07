<script lang="ts">
	import AdminNavToolbar from '$lib/components/AdminNavToolbar.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { arc, pie, quantize, scaleOrdinal } from 'd3';
	import { interpolateRainbow } from 'd3-scale-chromatic';
	import type { PieArcDatum } from 'd3-shape';

	let { data } = $props();

	type ChartDatum = {
		item: string;
		votes: number;
		share: number;
		type: 'candidate' | 'initiative' | 'other';
	};

	const chartSize = 300;
	const chartRadius = chartSize / 2;
	const donutInnerRadius = chartRadius - 56;

	const pieGenerator = pie<ChartDatum>()
		.value((datum) => datum.votes)
		.sort(null);

	const sliceGenerator = arc<PieArcDatum<ChartDatum>>()
		.innerRadius(donutInnerRadius)
		.outerRadius(chartRadius - 8)
		.padAngle(0.012)
		.cornerRadius(4);

	const labelGenerator = arc<PieArcDatum<ChartDatum>>()
		.innerRadius(donutInnerRadius + 18)
		.outerRadius(chartRadius - 20);

	function chartRows(
		items: Array<{
			contestItemTitle: string;
			contestItemType: 'candidate' | 'initiative' | 'other';
			voteCount: number;
			voteShare: number;
		}>
	) {
		return items.map((item) => ({
			item: item.contestItemTitle,
			votes: item.voteCount,
			share: item.voteShare,
			type: item.contestItemType
		}));
	}

	function createColorScale(labels: string[]) {
		const paletteSize = Math.max(labels.length, 3);
		return scaleOrdinal(labels, quantize(interpolateRainbow, paletteSize));
	}

	function formatStatus(status: 'upcoming' | 'active' | 'closed') {
		return status.charAt(0).toUpperCase() + status.slice(1);
	}

	function statusVariant(status: 'upcoming' | 'active' | 'closed') {
		if (status === 'closed') return 'destructive' as const;
		if (status === 'upcoming') return 'secondary' as const;
		return 'default' as const;
	}

	function formatTimestamp(isoDate: string) {
		return new Date(isoDate).toLocaleString();
	}
</script>

<svelte:head>
	<title>{data.contestGroup.title} Results - Admin Dashboard</title>
</svelte:head>

<main class="min-h-[calc(100vh-8rem)] bg-[var(--bg-primary)] px-6 py-8">
	<div class="mx-auto flex w-full max-w-6xl flex-col gap-6">
		<AdminNavToolbar
			primary={{
				label: 'Back to Contest Group',
				href: `/admin/dashboard/contest-groups/view/${data.contestGroup.id}`
			}}
		/>

		<header class="space-y-2">
			<div class="flex flex-wrap items-center gap-3">
				<h1 class="text-3xl font-bold text-[var(--text-primary)]">
					{data.contestGroup.title} Results
				</h1>
				<Badge variant={statusVariant(data.contestGroup.status)} class="capitalize">
					{formatStatus(data.contestGroup.status)}
				</Badge>
			</div>
			{#if data.contestGroup.description}
				<p class="text-[var(--text-secondary)]">{data.contestGroup.description}</p>
			{/if}
			<div class="flex flex-wrap items-center justify-between gap-3">
				<p class="text-sm text-[var(--text-secondary)]">
					Generated {formatTimestamp(data.generatedAt)}
				</p>
				<a
					href={`/admin/dashboard/contest-groups/results/${data.contestGroup.id}`}
					class="w-full sm:w-auto"
				>
					<Button type="button" variant="outline">Re-calculate Results</Button>
				</a>
			</div>
		</header>

		{#if data.contestResults.length === 0}
			<Card>
				<CardHeader>
					<CardTitle>No Results Yet</CardTitle>
					<CardDescription>This contest group has no contest items to tabulate.</CardDescription>
				</CardHeader>
			</Card>
		{:else}
			{#each data.contestResults as contest}
				{@const rows = chartRows(contest.items)}
				{@const slices = pieGenerator(rows)}
				{@const colorScale = createColorScale(rows.map((row) => row.item))}
				<Card>
					<CardHeader>
						<div class="flex flex-wrap items-center justify-between gap-3">
							<div>
								<CardTitle>{contest.contestTitle}</CardTitle>
								<CardDescription>{contest.totalVotes} total votes</CardDescription>
							</div>
							<Badge variant={statusVariant(contest.contestStatus)} class="capitalize">
								{formatStatus(contest.contestStatus)}
							</Badge>
						</div>
					</CardHeader>
					<CardContent class="space-y-5">
						<div class="grid gap-6 lg:grid-cols-[320px_1fr] lg:items-start">
							<div class="mx-auto w-full max-w-[320px]">
								{#if contest.totalVotes > 0}
									<svg
										viewBox={`-${chartRadius} -${chartRadius} ${chartSize} ${chartSize}`}
										class="h-auto w-full"
										role="img"
										aria-label={`${contest.contestTitle} vote distribution pie chart`}
									>
										{#each slices as slice}
											<path
												d={sliceGenerator(slice) ?? ''}
												fill={colorScale(slice.data.item)}
												stroke="var(--bg-primary)"
												stroke-width="2"
											>
												<title
													>{slice.data.item}: {slice.data.votes} votes ({slice.data.share}%)</title
												>
											</path>
											{#if slice.data.share >= 8}
												{@const labelPosition = labelGenerator.centroid(slice)}
												<text
													x={labelPosition[0]}
													y={labelPosition[1]}
													text-anchor="middle"
													dominant-baseline="central"
													class="fill-white text-[11px] font-semibold"
												>
													{slice.data.share}%
												</text>
											{/if}
										{/each}
									</svg>
								{:else}
									<div
										class="flex aspect-square w-full items-center justify-center rounded-full border border-dashed"
									>
										<p class="text-sm text-[var(--text-secondary)]">No votes cast</p>
									</div>
								{/if}
							</div>
							<div class="space-y-2">
								{#each contest.items as item}
									<div class="flex items-center justify-between rounded-md border px-3 py-2">
										<div class="flex min-w-0 items-center gap-2">
											<span
												class="h-3 w-3 shrink-0 rounded-sm border"
												style={`background-color: ${colorScale(item.contestItemTitle)}`}
												aria-hidden="true"
											></span>
											<div class="min-w-0">
												<p class="truncate font-medium text-[var(--text-primary)]">
													{item.contestItemTitle}
												</p>
												<p class="text-xs text-[var(--text-secondary)] capitalize">
													{item.contestItemType}
												</p>
											</div>
										</div>
										<p class="font-mono text-sm text-[var(--text-primary)]">
											{item.voteCount} ({item.voteShare}%)
										</p>
									</div>
								{/each}
							</div>
						</div>
					</CardContent>
				</Card>
			{/each}
		{/if}
	</div>
</main>
