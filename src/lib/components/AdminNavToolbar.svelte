<script lang="ts">
	type NavLink = {
		label: string;
		href: string;
	};

	const {
		primary = { label: '← Back to Admin Dashboard', href: '/admin/dashboard' },
		secondary
	}: { primary?: NavLink; secondary?: NavLink } = $props();
</script>

<nav class="rounded-md border border-(--border-primary) bg-(--bg-secondary) p-3">
	<div class="flex flex-wrap items-center gap-2">
		<a
			href={primary.href}
			class="inline-flex items-center rounded-md border border-(--border-primary) px-3 py-1.5 text-sm font-medium text-(--text-primary) hover:bg-(--bg-primary)"
		>
			{primary.label}
		</a>
		{#if secondary}
			<a
				href={secondary.href}
				class="inline-flex items-center rounded-md border border-(--border-primary) px-3 py-1.5 text-sm text-(--text-secondary) hover:bg-(--bg-primary) hover:text-(--text-primary)"
			>
				{secondary.label}
			</a>
		{/if}
	</div>
</nav>
