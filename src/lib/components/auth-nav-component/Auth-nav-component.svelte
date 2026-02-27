<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { signOut } from '@auth/sveltekit/client';
	const { username } = $props();

	async function handleSignOut() {
		await signOut();
		await invalidateAll();
	}
</script>

<div class="auth-user flex items-center gap-2">
	{#if username}
		<p class="font-bold">{username}</p>
		<button class="underline hover:cursor-pointer" onclick={handleSignOut}>sign out</button>
	{:else}
		<a href="/auth/signin" class="underline hover:cursor-pointer">admin sign in</a>
	{/if}
</div>
