<script lang="ts">
	import { onMount } from 'svelte';
	import { themeStore } from '$lib/theme';
	import { authStore } from '$lib/auth';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();

	// Initialize auth state
	onMount(() => {
		authStore.setLoading(false);
	});

	// Apply theme changes to document
	$effect(() => {
		if ($themeStore.theme) {
			document.body.style.background = $themeStore.colors.background;
			document.body.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Todo App</title>
</svelte:head>

<div style="min-height: 100vh; background: {$themeStore.colors.background}; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);">
	{@render children()}
</div>
