<script lang="ts">
	export let error: App.Error;
	export let status: number;

	const fallbackMessage = 'Something unexpected happened while loading this page.';
	const message = error?.message || fallbackMessage;
</script>

<svelte:head>
	<title>Error {status}</title>
</svelte:head>

<main
	class="relative grid min-h-dvh place-items-center overflow-hidden bg-[linear-gradient(140deg,var(--bg-primary),var(--bg-secondary))] px-6 py-6 sm:px-4"
>
	<div
		class="pointer-events-none absolute -top-32 -left-32 h-112 w-md rounded-full opacity-55 blur-[70px]"
		style="background: color-mix(in oklch, var(--destructive) 36%, transparent);"
		aria-hidden="true"
	></div>
	<div
		class="pointer-events-none absolute -right-36 -bottom-36 h-112 w-md rounded-full opacity-55 blur-[70px]"
		style="background: color-mix(in oklch, var(--chart-2) 45%, transparent);"
		aria-hidden="true"
	></div>

	<section
		class="relative z-10 w-full max-w-176 rounded-3xl border border-[color-mix(in_oklch,var(--border)_70%,transparent)] bg-[color-mix(in_oklch,var(--card)_86%,transparent)] p-6 text-center shadow-[0_24px_60px_color-mix(in_oklch,var(--foreground)_10%,transparent)] backdrop-blur-[10px] sm:rounded-[1.1rem] md:p-12"
		role="alert"
		aria-live="assertive"
	>
		<h1
			class="mt-1 text-[clamp(3.5rem,5vw,8.5rem)] leading-[0.9] font-black tracking-[0.06em] text-[color-mix(in_oklch,var(--foreground)_90%,var(--destructive))] [text-shadow:0_4px_22px_color-mix(in_oklch,var(--destructive)_30%,transparent)]"
		>
			Something went wrong
		</h1>
		<p
			class="mt-2 text-[clamp(1.25rem,3.5vw,2rem)] font-bold tracking-[0.08em] text-(--accent-primary)"
		>
			{status}
		</p>
		<p class="mx-auto mt-4 max-w-[34ch] text-base leading-relaxed text-(--text-primary)">
			{message}
		</p>

		<div class="mt-6 flex flex-wrap justify-center gap-3 max-sm:flex-col">
			<a
				class="inline-flex items-center justify-center rounded-[0.8rem] border border-[color-mix(in_oklch,var(--border)_80%,transparent)] bg-[color-mix(in_oklch,var(--card)_50%,transparent)] px-[1.15rem] py-[0.72rem] text-[0.92rem] font-bold tracking-[0.01em] text-foreground no-underline transition-[transform,box-shadow,background-color] duration-150 ease-out hover:-translate-y-px max-sm:w-full"
				href="/"
			>
				Go Home
			</a>
		</div>
	</section>
</main>
