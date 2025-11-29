<script lang="ts">
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/auth';
	import { themeStore } from '$lib/theme';

	let username = '';
	let password = '';
	let error = '';
	let isLoading = false;

	async function handleLogin() {
		if (!username || !password) {
			error = 'Please fill in all fields';
			return;
		}

		isLoading = true;
		error = '';

		try {
			const response = await fetch('/api/auth', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ username, password }),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Login failed');
			}

			const data = await response.json();
			
			if (typeof window !== 'undefined') {
				localStorage.setItem('token', data.token);
				localStorage.setItem('user', JSON.stringify(data.user));
			}
			
			// Update auth store directly
			authStore.set({ user: data.user, token: data.token, isLoading: false });
			goto('/dashboard');
		} catch (err) {
			error = err instanceof Error ? err.message : 'Login failed';
		} finally {
			isLoading = false;
		}
	}
</script>

<div style="display: flex; justify-content: center; align-items: center; min-height: 100vh; background: {$themeStore.colors.background}; padding: 20px; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);">
	<div style="background: {$themeStore.theme === 'light' ? 'rgba(255, 255, 255, 0.98)' : $themeStore.colors.cardBackground}; backdrop-filter: blur(20px); border-radius: 20px; padding: 40px; width: 100%; max-width: 400px; box-shadow: {$themeStore.theme === 'light' ? '0 8px 32px rgba(0, 0, 0, 0.12)' : `0 8px 32px ${$themeStore.colors.shadow}`}; border: {$themeStore.theme === 'light' ? '1px solid rgba(102, 126, 234, 0.15)' : `1px solid ${$themeStore.colors.cardBorder}`}; animation: fadeInUp 0.6s ease-out;">
		<h1 style="margin: 0 0 8px 0; font-size: 32px; font-weight: 700; background: linear-gradient(135deg, {$themeStore.colors.primary} 0%, {$themeStore.colors.secondary} 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; text-align: center;">
			👋 Welcome Back
		</h1>
		<p style="margin: 0 0 32px 0; color: {$themeStore.theme === 'light' ? $themeStore.colors.textSecondary : $themeStore.colors.textLightSecondary}; text-align: center; font-size: 16px;">
			Sign in to your todo account
		</p>

		<form on:submit|preventDefault={handleLogin} style="display: flex; flex-direction: column; gap: 20px;">
			<div>
				<label for="username" style="display: block; margin-bottom: 8px; color: {$themeStore.colors.text}; font-weight: 500; font-size: 14px;">Username</label>
				<input
					id="username"
					bind:value={username}
					type="text"
					placeholder="Enter your username"
					style="width: 100%; padding: 12px 16px; background: {$themeStore.colors.inputBg}; border: 1px solid {$themeStore.colors.inputBorder}; border-radius: 10px; color: {$themeStore.colors.text}; font-size: 16px; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);"
					on:focus={(e) => {
						e.currentTarget.style.borderColor = $themeStore.colors.primary;
						e.currentTarget.style.boxShadow = `0 0 0 3px ${$themeStore.colors.primary}20`;
					}}
					on:blur={(e) => {
						e.currentTarget.style.borderColor = $themeStore.colors.inputBorder;
						e.currentTarget.style.boxShadow = 'none';
					}}
				/>
			</div>

			<div>
				<label for="password" style="display: block; margin-bottom: 8px; color: {$themeStore.colors.text}; font-weight: 500; font-size: 14px;">Password</label>
				<input
					id="password"
					bind:value={password}
					type="password"
					placeholder="Enter your password"
					style="width: 100%; padding: 12px 16px; background: {$themeStore.colors.inputBg}; border: 1px solid {$themeStore.colors.inputBorder}; border-radius: 10px; color: {$themeStore.colors.text}; font-size: 16px; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);"
					on:focus={(e) => {
						e.currentTarget.style.borderColor = $themeStore.colors.primary;
						e.currentTarget.style.boxShadow = `0 0 0 3px ${$themeStore.colors.primary}20`;
					}}
					on:blur={(e) => {
						e.currentTarget.style.borderColor = $themeStore.colors.inputBorder;
						e.currentTarget.style.boxShadow = 'none';
					}}
				/>
			</div>

			{#if error}
				<div style="background: {$themeStore.colors.error}20; color: {$themeStore.colors.error}; padding: 12px; border-radius: 8px; font-size: 14px; text-align: center; border: 1px solid {$themeStore.colors.error}40;">
					{error}
				</div>
			{/if}

			<button
				type="submit"
				disabled={isLoading}
				style="padding: 14px 24px; background: linear-gradient(135deg, {$themeStore.colors.primary} 0%, {$themeStore.colors.secondary} 100%); color: white; border: none; border-radius: 10px; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 4px 15px {$themeStore.colors.primary}40; position: relative; overflow: hidden; opacity: {isLoading ? 0.6 : 1}; cursor: {isLoading ? 'not-allowed' : 'pointer'};"
				on:mouseenter={(e) => {
					if (!isLoading) {
						e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
						e.currentTarget.style.boxShadow = `0 6px 20px ${$themeStore.colors.primary}60`;
					}
				}}
				on:mouseleave={(e) => {
					e.currentTarget.style.transform = 'translateY(0) scale(1)';
					e.currentTarget.style.boxShadow = `0 4px 15px ${$themeStore.colors.primary}40`;
				}}
			>
				{#if isLoading}
					<div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
						<div style="width: 16px; height: 16px; border: 2px solid rgba(255, 255, 255, 0.3); border-top: 2px solid white; border-radius: 50%; animation: spin 1s linear infinite;"></div>
							Signing in...
					</div>
				{:else}
					🚀 Sign In
				{/if}
			</button>
		</form>

		<div style="text-align: center; margin-top: 24px; color: {$themeStore.colors.textSecondary}; font-size: 14px;">
			Don't have an account? 
			<a href="/register" style="color: {$themeStore.colors.primary}; text-decoration: none; font-weight: 500; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);"
				on:mouseenter={(e) => {
					e.currentTarget.style.color = $themeStore.colors.primaryDark;
					e.currentTarget.style.textDecoration = 'underline';
				}}
				on:mouseleave={(e) => {
					e.currentTarget.style.color = $themeStore.colors.primary;
					e.currentTarget.style.textDecoration = 'none';
				}}
			>
				Sign up here
			</a>
		</div>
	</div>
</div>
