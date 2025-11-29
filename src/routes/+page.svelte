<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/auth';

	onMount(() => {
		if ($authStore.user) {
			goto('/dashboard');
		} else {
			goto('/login');
		}
	});
</script>

<div style="display: flex; justify-content: center; align-items: center; height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
	<div style="text-align: center;">
		<div style="width: 40px; height: 40px; border: 3px solid rgba(255, 255, 255, 0.3); border-top: 3px solid white; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 16px;"></div>
		<p style="color: white; font-size: 18px;">Loading...</p>
	</div>
</div>
