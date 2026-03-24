<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import AuthNavComponent from '$lib/components/auth-nav-component/Auth-nav-component.svelte';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import './layout.css';

	let { children, data } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<div class="app-container">
	<header class="app-header mr-4 flex justify-end gap-4">
		<AuthNavComponent username={data.username} />
		<ThemeToggle />
	</header>
	<main class="app-main">
		{@render children()}
	</main>
</div>
