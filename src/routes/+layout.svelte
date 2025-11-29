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
			
			// Set CSS custom properties for theme
			const root = document.documentElement;
			root.style.setProperty('--background', $themeStore.colors.background);
			root.style.setProperty('--cardBackground', $themeStore.colors.cardBackground);
			root.style.setProperty('--cardBorder', $themeStore.colors.cardBorder);
			root.style.setProperty('--text', $themeStore.colors.text);
			root.style.setProperty('--textSecondary', $themeStore.colors.textSecondary);
			root.style.setProperty('--primary', $themeStore.colors.primary);
			root.style.setProperty('--inputBg', $themeStore.colors.inputBg);
			root.style.setProperty('--inputBorder', $themeStore.colors.inputBorder);
			root.style.setProperty('--cardShadow', $themeStore.colors.cardShadow);
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
