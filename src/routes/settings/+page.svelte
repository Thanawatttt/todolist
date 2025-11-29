<script lang="ts">
	import { onMount } from 'svelte';
	import { authStore } from '$lib/auth';
	import { themeStore } from '$lib/theme';
	import BottomNavigation from '$lib/components/BottomNavigation.svelte';

	// Apply theme variables
	$: themeVars = `
	  --primary-color: ${$themeStore.colors.primary};
	  --bg-color: ${$themeStore.theme === 'light' ? '#ffffff' : '#1e293b'};
	  --bg-secondary: ${$themeStore.theme === 'light' ? '#f8fafc' : '#0f172a'};
	  --text-color: ${$themeStore.theme === 'light' ? '#1e293b' : '#f1f5f9'};
	  --border-color: ${$themeStore.theme === 'light' ? '#e2e8f0' : '#334155'};
	`;

	let user = $authStore.user;
	let isLoading = false;
	let isSaving = false;
	let testResult = '';
	
	// Settings object
	let settings = {
		discordWebhookUrl: '',
		notificationInterval: '0',
		enableNotifications: false,
		mentionUser: false,
		userMention: '',
		reminderInterval: 1,
		reminderUnit: 'hours'
	};
	
	// User statistics
	let userStats = {
		tasksCreated: 0,
		tasksCompleted: 0,
		successRate: 0
	};

	// Helper functions for interactive effects
	function handleCardMouseEnter(event: MouseEvent) {
		const target = event.currentTarget as HTMLElement;
		target.style.transform = 'translateY(-4px)';
		target.style.boxShadow = $themeStore.theme === 'light' 
			? '0 12px 40px rgba(0, 0, 0, 0.12), 0 4px 20px rgba(0, 0, 0, 0.06)' 
			: '0 12px 40px rgba(0, 0, 0, 0.5), 0 4px 20px rgba(0, 0, 0, 0.25)';
	}

	function handleCardMouseLeave(event: MouseEvent) {
		const target = event.currentTarget as HTMLElement;
		target.style.transform = 'translateY(0)';
		target.style.boxShadow = $themeStore.theme === 'light' 
			? '0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 16px rgba(0, 0, 0, 0.04)' 
			: '0 8px 32px rgba(0, 0, 0, 0.4), 0 2px 16px rgba(0, 0, 0, 0.2)';
	}

	function handleIconMouseEnter(event: MouseEvent) {
		const target = event.currentTarget as HTMLElement;
		target.style.transform = 'scale(1.1) rotate(5deg)';
	}

	function handleIconMouseLeave(event: MouseEvent) {
		const target = event.currentTarget as HTMLElement;
		target.style.transform = 'scale(1) rotate(0deg)';
	}

	function handleThemeIconMouseEnter(event: MouseEvent) {
		const target = event.currentTarget as HTMLElement;
		target.style.transform = 'scale(1.1) rotate(-5deg)';
	}

	function handleAvatarMouseEnter(event: MouseEvent) {
		const target = event.currentTarget as HTMLElement;
		target.style.transform = 'scale(1.05) rotate(3deg)';
	}

	function handleStatCardMouseEnter(event: MouseEvent) {
		const target = event.currentTarget as HTMLElement;
		target.style.transform = 'translateY(-2px) scale(1.02)';
	}

	function handleStatCardMouseLeave(event: MouseEvent) {
		const target = event.currentTarget as HTMLElement;
		target.style.transform = 'translateY(0) scale(1)';
	}

	function handleUserInfoCardMouseEnter(event: MouseEvent) {
		const target = event.currentTarget as HTMLElement;
		target.style.transform = 'translateY(-2px)';
		target.style.borderColor = $themeStore.colors.primary + '30';
	}

	function handleUserInfoCardMouseLeave(event: MouseEvent) {
		const target = event.currentTarget as HTMLElement;
		target.style.transform = 'translateY(0)';
		target.style.borderColor = $themeStore.theme === 'light' ? 'rgba(148, 163, 184, 0.1)' : 'rgba(71, 85, 105, 0.15)';
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			const target = event.currentTarget as HTMLElement;
			if (target.classList.contains('card')) {
				handleCardMouseEnter(event as any);
			} else if (target.classList.contains('icon')) {
				handleIconMouseEnter(event as any);
			}
		}
	}

	function handleKeyUp(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			const target = event.currentTarget as HTMLElement;
			if (target.classList.contains('card')) {
				handleCardMouseLeave(event as any);
			} else if (target.classList.contains('icon')) {
				handleIconMouseLeave(event as any);
			}
		}
	}

	onMount(async () => {
		// Set loading to false immediately to show content
		isLoading = false;
		
		// Fetch data in background if user is authenticated
		if ($authStore.user) {
			await Promise.all([
				fetchSettings(),
				fetchUserStats()
			]);
		}
	});

	async function fetchSettings() {
		const token = localStorage.getItem('token');
		if (!token) return;

		try {
			const response = await fetch('/api/settings', {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (response.ok) {
				const data = await response.json();
				settings = {
					discordWebhookUrl: data.webhookUrl || '',
					notificationInterval: data.notificationInterval || '0',
					enableNotifications: data.notificationsEnabled || false,
					mentionUser: data.mentionUser || false,
					userMention: data.userMention || '',
					reminderInterval: data.reminderInterval || 1,
					reminderUnit: data.reminderUnit || 'hours'
				};
			}
		} catch (error) {
			console.error('Failed to fetch settings:', error);
		}
	}

	async function fetchUserStats() {
		const token = localStorage.getItem('token');
		if (!token) return;

		try {
			const response = await fetch('/api/tasks', {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (response.ok) {
				const tasks = await response.json();
				const completedTasks = tasks.filter((task: any) => task.status === 'completed');
				const successRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;
				
				userStats = {
					tasksCreated: tasks.length,
					tasksCompleted: completedTasks.length,
					successRate
				};
			}
		} catch (error) {
			console.error('Failed to fetch user stats:', error);
			// Keep default values if fetch fails
		}
	}

	async function testWebhook() {
    if (!settings.discordWebhookUrl) return;
    
    isSaving = true;
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const response = await fetch('/api/test-webhook', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                webhookUrl: settings.discordWebhookUrl,
                mentionUser: settings.mentionUser
            })
        });

        if (response.ok) {
            testResult = 'Test notification sent successfully!';
        } else {
            testResult = 'Failed to send test notification';
        }
    } catch (error) {
        console.error('Error testing webhook:', error);
        testResult = 'Error sending test notification';
    } finally {
        isSaving = false;
        setTimeout(() => {
            testResult = '';
        }, 5000);
    }
}

async function saveSettings() {
    isSaving = true;
    const token = localStorage.getItem('token');
    if (!token) {
        testResult = 'Please log in to save settings';
        isSaving = false;
        return;
    }

		try {
			const settingsData = {
				webhookUrl: settings.discordWebhookUrl,
				notificationInterval: settings.notificationInterval,
				notificationsEnabled: settings.enableNotifications,
				mentionUser: settings.mentionUser,
				userMention: settings.userMention,
				reminderInterval: settings.reminderInterval,
				reminderUnit: settings.reminderUnit
			};
			
			console.log('Sending settings:', settingsData);
			
			const response = await fetch('/api/settings', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(settingsData),
			});

			if (response.ok) {
				testResult = 'Settings saved successfully!';
				setTimeout(() => {
					testResult = '';
				}, 3000);
			} else {
				const errorData = await response.json().catch(() => ({}));
				console.error('Save settings error:', errorData);
				testResult = `Failed to save settings: ${errorData.error || 'Unknown error'}`;
			}
		} catch (error) {
			console.error('Failed to save settings:', error);
			testResult = 'Failed to save settings';
		} finally {
			isSaving = false;
		}
	}

	async function testNotification() {
		if (!settings.discordWebhookUrl) {
			testResult = 'Please enter a webhook URL first';
			return;
		}

		const token = localStorage.getItem('token');
		if (!token) {
			testResult = 'Please log in to test notifications';
			return;
		}

		console.log('Testing webhook with token:', token ? 'present' : 'missing');
		console.log('Webhook URL:', settings.discordWebhookUrl);

		try {
			const testData = {
				webhookUrl: settings.discordWebhookUrl,
				mentionUser: settings.mentionUser,
				userMention: settings.userMention
			};
			
			console.log('Sending test data:', testData);

			const response = await fetch('/api/notifications/test', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(testData),
			});

			const result = await response.json();
			if (response.ok) {
				testResult = 'Test notification sent successfully!';
			} else {
				testResult = result.error || 'Failed to send test notification';
			}
		} catch (error) {
			console.error('Failed to test notification:', error);
			testResult = 'Failed to send test notification';
		}

		setTimeout(() => {
			testResult = '';
		}, 3000);
	}
</script>

	<!-- Main Content -->
	<main style="padding: 24px 16px 80px; max-width: 1200px; margin: 0 auto; min-height: calc(100vh - 80px);">
		<div style="max-width: 100%;">
			<!-- Header -->
			<div style="margin-bottom: 40px; text-align: center; padding: 0 16px;">
				<h1 style="margin: 0 0 12px 0; font-size: clamp(28px, 5vw, 40px); font-weight: 800; background: linear-gradient(135deg, {$themeStore.colors.primary} 0%, {$themeStore.colors.secondary} 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; line-height: 1.2;">
					⚙️ Settings
				</h1>
				<p style="margin: 0; font-size: clamp(14px, 1.1vw, 16px); color: {$themeStore.theme === 'light' ? '#64748b' : '#94a3b8'}; font-weight: 500; max-width: 600px; margin: 0 auto;">
					Customize your experience and notification preferences
				</p>
			</div>

			<!-- Top Row: User Profile & Theme -->
			<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; margin-bottom: 40px;">
					<!-- User Profile -->
					<div style="background: linear-gradient(145deg, {$themeStore.theme === 'light' ? '#ffffff' : '#1e293b'} 0%, {$themeStore.theme === 'light' ? '#f1f5f9' : '#0f172a'} 100%); backdrop-filter: blur(25px); border-radius: 20px; padding: 32px; box-shadow: {$themeStore.theme === 'light' ? '0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 16px rgba(0, 0, 0, 0.04)' : '0 8px 32px rgba(0, 0, 0, 0.4), 0 2px 16px rgba(0, 0, 0, 0.2)'}; border: 1px solid {$themeStore.theme === 'light' ? 'rgba(148, 163, 184, 0.08)' : 'rgba(71, 85, 105, 0.2)'}; position: relative; overflow: hidden; animation: slideInLeft 0.6s ease-out; transition: all 0.3s ease;" role="button" tabindex="0" class="card" on:mouseenter={handleCardMouseEnter} on:mouseleave={handleCardMouseLeave} on:keydown={handleKeyDown} on:keyup={handleKeyUp}>
						<!-- Gradient Border Effect -->
						<div style="position: absolute; inset: 0; border-radius: 20px; padding: 1px; background: linear-gradient(145deg, {$themeStore.colors.primary}15, transparent, {$themeStore.colors.secondary}15); -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: subtract; mask-composite: subtract; pointer-events: none;"></div>
						
						<div style="position: relative; z-index: 1;">
							<!-- Modern Header -->
							<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px;">
								<div style="display: flex; align-items: center; gap: 16px;">
									<div style="width: 56px; height: 56px; background: linear-gradient(145deg, {$themeStore.colors.secondary}, {$themeStore.colors.primary}); border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 24px; box-shadow: 0 6px 24px {$themeStore.colors.secondary}20; transition: all 0.3s ease;" role="button" tabindex="0" class="icon" on:mouseenter={handleThemeIconMouseEnter} on:mouseleave={handleIconMouseLeave} on:keydown={handleKeyDown} on:keyup={handleKeyUp}>
										🎨
									</div>
									<div>
									<h2 style="margin: 0; font-size: 22px; font-weight: 700; color: {$themeStore.theme === 'light' ? '#1e293b' : '#f1f5f9'}; letter-spacing: -0.3px;">Theme Settings</h2>
									<p style="margin: 2px 0 0 0; font-size: 13px; color: {$themeStore.theme === 'light' ? '#64748b' : '#94a3b8'}; font-weight: 500;">Customize your experience</p>
								</div>
							</div>
							<div style="width: 10px; height: 10px; background: linear-gradient(145deg, #8b5cf6, #7c3aed); border-radius: 50%; box-shadow: 0 0 16px #8b5cf640; animation: pulse 2s infinite;"></div>
							</div>
							
							<!-- Enhanced Theme Toggle Card -->
							<div style="background: {$themeStore.theme === 'light' ? 'linear-gradient(135deg, #f8fafc, #ffffff)' : 'linear-gradient(135deg, #334155, #1e293b)'}; border-radius: 20px; padding: 40px; border: 1px solid {$themeStore.theme === 'light' ? 'rgba(148, 163, 184, 0.15)' : 'rgba(71, 85, 105, 0.2)'}; position: relative;">
								<!-- Main Theme Toggle Section -->
								<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 36px;">
									<!-- Enhanced Theme Info -->
									<div style="display: flex; align-items: center; gap: 32px;">
										<!-- Animated Theme Icon -->
										<div style="position: relative;">
											<div style="width: 96px; height: 96px; background: linear-gradient(135deg, {$themeStore.theme === 'light' ? '#fbbf24' : '#6366f1'}, {$themeStore.theme === 'light' ? '#f59e0b' : '#8b5cf6'}); border-radius: 24px; display: flex; align-items: center; justify-content: center; font-size: 48px; box-shadow: 0 16px 48px {$themeStore.theme === 'light' ? '#f59e0b40' : '#6366f140'}; animation: float 3s ease-in-out infinite;">
												{$themeStore.theme === 'light' ? '☀️' : '🌙'}
											</div>
											<div style="position: absolute; -top-2 -right-2; width: 24px; height: 24px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; color: white; font-weight: 700; box-shadow: 0 4px 16px #10b98140;">
												✓
											</div>
										</div>
										
										<!-- Theme Details -->
										<div>
											<div style="font-size: 24px; font-weight: 700; color: {$themeStore.theme === 'light' ? '#1e293b' : '#f1f5f9'}; margin-bottom: 16px; display: flex; align-items: center; gap: 16px; letter-spacing: -0.5px;">
												{$themeStore.theme === 'light' ? 'Light Mode' : 'Dark Mode'}
												<span style="padding: 6px 16px; background: linear-gradient(135deg, #10b98120, #05966920); color: #10b981; font-size: 12px; font-weight: 700; border-radius: 20px; border: 1px solid #10b98130; text-transform: uppercase; letter-spacing: 0.5px;">
													Active
												</span>
											</div>
											<div style="font-size: 16px; color: {$themeStore.theme === 'light' ? '#64748b' : '#94a3b8'}; line-height: 1.6; max-width: 360px;">
												{$themeStore.theme === 'light' ? 'Bright and clean interface designed for optimal daytime visibility with vibrant colors and sharp contrast.' : 'Dark interface optimized for comfortable night viewing with reduced eye strain and elegant aesthetics.'}
											</div>
										</div>
									</div>
									
									<!-- Enhanced Toggle Switch -->
									<div style="display: flex; flex-direction: column; align-items: center; gap: 20px;">
										<label style="position: relative; display: inline-block; width: 88px; height: 44px;">
											<input type="checkbox" checked={$themeStore.theme === 'dark'} on:change={() => themeStore.toggle()} style="opacity: 0; width: 0; height: 0;">
											<span style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(135deg, {$themeStore.theme === 'light' ? '#e2e8f0' : '#475569'}, {$themeStore.theme === 'light' ? '#cbd5e1' : '#64748b'}); transition: all 0.4s ease; border-radius: 44px; box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.1);">
												<span style="position: absolute; content: ''; height: 36px; width: 36px; left: 4px; bottom: 4px; background: linear-gradient(135deg, {$themeStore.theme === 'light' ? '#f8fafc' : '#f1f5f9'}, {$themeStore.theme === 'light' ? '#ffffff' : '#e2e8f0'}); transition: all 0.4s ease; border-radius: 50%; transform: {$themeStore.theme === 'dark' ? 'translateX(44px)' : 'translateX(0)'}; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15); display: flex; align-items: center; justify-content: center;">
													<span style="font-size: 16px; line-height: 1;">{$themeStore.theme === 'light' ? '☀️' : '🌙'}</span>
												</span>
											</span>
										</label>
										<span style="font-size: 13px; color: {$themeStore.theme === 'light' ? '#64748b' : '#94a3b8'}; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
											{$themeStore.theme === 'light' ? 'Switch to Dark' : 'Switch to Light'}
										</span>
									</div>
								</div>
								
								<!-- Modern Separator -->
								<div style="height: 1px; background: linear-gradient(90deg, transparent, {$themeStore.colors.primary}20, transparent); margin: 32px 0;"></div>
								
								<!-- Enhanced Theme Preview Section -->
								<div style="display: flex; flex-direction: column; gap: 24px;">
									<div style="font-size: 16px; font-weight: 700; color: {$themeStore.theme === 'light' ? '#1e293b' : '#f1f5f9'}; display: flex; align-items: center; gap: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
										<span style="font-size: 18px;">🎨</span>
										Theme Preview
									</div>
									
									<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
										<!-- Enhanced Light Theme Preview -->
										<div style="padding: 32px; background: linear-gradient(135deg, #ffffff, #f8fafc); border-radius: 16px; border: 1px solid #e2e8f0; transition: all 0.3s ease; opacity: {$themeStore.theme === 'light' ? '1' : '0.5'}; transform: {$themeStore.theme === 'light' ? 'scale(1)' : 'scale(0.95)'}; cursor: pointer;">
											<div style="display: flex; align-items: center; gap: 20px; margin-bottom: 24px;">
												<div style="width: 48px; height: 48px; background: linear-gradient(135deg, #fbbf24, #f59e0b); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px;">☀️</div>
												<div>
													<div style="font-size: 16px; font-weight: 700; color: #1e293b;">Light Mode</div>
													<div style="font-size: 14px; color: #64748b; margin-top: 2px;">Bright & Clean</div>
												</div>
											</div>
											<div style="display: flex; gap: 12px;">
												<div style="width: 24px; height: 24px; background: #6366f1; border-radius: 6px;"></div>
												<div style="width: 24px; height: 24px; background: #8b5cf6; border-radius: 6px;"></div>
												<div style="width: 24px; height: 24px; background: #e2e8f0; border-radius: 6px;"></div>
											</div>
										</div>
										
										<!-- Enhanced Dark Theme Preview -->
										<div style="padding: 32px; background: linear-gradient(135deg, #1e293b, #334155); border-radius: 16px; border: 1px solid #475569; transition: all 0.3s ease; opacity: {$themeStore.theme === 'dark' ? '1' : '0.5'}; transform: {$themeStore.theme === 'dark' ? 'scale(1)' : 'scale(0.95)'}; cursor: pointer;">
											<div style="display: flex; align-items: center; gap: 20px; margin-bottom: 24px;">
												<div style="width: 48px; height: 48px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px;">🌙</div>
												<div>
													<div style="font-size: 16px; font-weight: 700; color: #f1f5f9;">Dark Mode</div>
													<div style="font-size: 14px; color: #94a3b8; margin-top: 2px;">Easy on Eyes</div>
												</div>
											</div>
											<div style="display: flex; gap: 12px;">
												<div style="width: 24px; height: 24px; background: #6366f1; border-radius: 6px;"></div>
												<div style="width: 24px; height: 24px; background: #8b5cf6; border-radius: 6px;"></div>
												<div style="width: 24px; height: 24px; background: #475569; border-radius: 6px;"></div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Bottom Row: Discord Notifications (Full Width) -->
			<div style="width: 100%;">
				<div style="background: linear-gradient(145deg, {$themeStore.theme === 'light' ? '#ffffff' : '#1e293b'} 0%, {$themeStore.theme === 'light' ? '#f1f5f9' : '#0f172a'} 100%); backdrop-filter: blur(25px); border-radius: 20px; padding: 32px; box-shadow: {$themeStore.theme === 'light' ? '0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 16px rgba(0, 0, 0, 0.04)' : '0 8px 32px rgba(0, 0, 0, 0.4), 0 2px 16px rgba(0, 0, 0, 0.2)'}; border: 1px solid {$themeStore.theme === 'light' ? 'rgba(148, 163, 184, 0.08)' : 'rgba(71, 85, 105, 0.2)'}; position: relative; overflow: hidden; animation: slideInUp 0.8s ease-out; width: 100%; transition: all 0.3s ease;" role="button" tabindex="0" class="card" on:mouseenter={handleCardMouseEnter} on:mouseleave={handleCardMouseLeave} on:keydown={handleKeyDown} on:keyup={handleKeyUp}>
					<!-- Gradient Border Effect -->
					<div style="position: absolute; inset: 0; border-radius: 20px; padding: 1px; background: linear-gradient(145deg, #5865F215, transparent, #5865F215); -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: subtract; mask-composite: subtract; pointer-events: none;"></div>
					<!-- Background decoration -->
					<div style="position: absolute; top: -30%; right: -30%; width: 120%; height: 120%; background: radial-gradient(circle, #5865F208 0%, transparent 60%); pointer-events: none;"></div>
					<div style="position: absolute; bottom: -20%; left: -20%; width: 100%; height: 100%; background: radial-gradient(circle, #5865F206 0%, transparent 50%); pointer-events: none;"></div>

					<div style="position: relative; z-index: 1;">
						<!-- Header -->
						<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px;">
							<div style="display: flex; align-items: center; gap: 16px;">
								<div style="width: 56px; height: 56px; background: linear-gradient(145deg, #5865F2, #7289DA); border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 24px; box-shadow: 0 6px 24px #5865F220; transition: all 0.3s ease;" role="button" tabindex="0" class="icon" on:mouseenter={handleThemeIconMouseEnter} on:mouseleave={handleIconMouseLeave} on:keydown={handleKeyDown} on:keyup={handleKeyUp}>
									💬
								</div>
								<div>
									<h2 style="margin: 0; font-size: 22px; font-weight: 700; color: {$themeStore.theme === 'light' ? '#1e293b' : '#f1f5f9'}; letter-spacing: -0.3px;">Discord Notifications</h2>
									<p style="margin: 2px 0 0 0; font-size: 13px; color: {$themeStore.theme === 'light' ? '#64748b' : '#94a3b8'}; font-weight: 500;">Configure webhook settings</p>
								</div>
							</div>
							<div style="width: 10px; height: 10px; background: linear-gradient(145deg, #5865F2, #7289DA); border-radius: 50%; box-shadow: 0 0 16px #5865F240; animation: pulse 2s infinite;"></div>
						</div>

						<!-- Form -->
						<form on:submit|preventDefault={saveSettings}>
							<div style="display: flex; flex-direction: column; gap: 24px;">
								<!-- Webhook URL -->
								<div>
									<label for="webhook-url" style="display: block; margin-bottom: 8px; font-weight: 600; font-size: 14px; color: {$themeStore.theme === 'light' ? '#1e293b' : '#f1f5f9'};">
										Discord Webhook URL
									</label>
									<input
										id="webhook-url"
										type="text"
										bind:value={settings.discordWebhookUrl}
										placeholder="https://discord.com/api/webhooks/..."
										style="width: 100%; padding: 12px 16px; border-radius: 12px; border: 1px solid {$themeStore.theme === 'light' ? '#e2e8f0' : '#334155'}; background: {$themeStore.theme === 'light' ? '#ffffff' : '#0f172a'}; color: {$themeStore.theme === 'light' ? '#1e293b' : '#f1f5f9'}; font-size: 15px; transition: all 0.2s ease;"
									/>
								</div>

								<!-- Notification Settings -->
								<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
									<!-- Enable Notifications -->
									<div style="display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; background: {$themeStore.theme === 'light' ? '#f8fafc' : '#0f172a'}; border-radius: 12px; border: 1px solid {$themeStore.theme === 'light' ? '#e2e8f0' : '#334155'};">
										<div>
											<div style="font-weight: 600; font-size: 14px; color: {$themeStore.theme === 'light' ? '#1e293b' : '#f1f5f9'}; margin-bottom: 4px;">Enable Notifications</div>
											<div style="font-size: 12px; color: {$themeStore.theme === 'light' ? '#64748b' : '#94a3b8'};">Send task reminders</div>
										</div>
										<label style="position: relative; display: inline-block; width: 48px; height: 24px;">
											<input type="checkbox" bind:checked={settings.enableNotifications} style="opacity: 0; width: 0; height: 0;">
											<span style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background: {settings.enableNotifications ? '#10b981' : '#cbd5e1'}; transition: 0.4s; border-radius: 24px;">
												<span style="position: absolute; content: ''; height: 18px; width: 18px; left: 3px; bottom: 3px; background: white; transition: 0.4s; border-radius: 50%; transform: {settings.enableNotifications ? 'translateX(24px)' : 'translateX(0)'};"></span>
											</span>
										</label>
									</div>

									<!-- Mention User -->
									<div style="display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; background: {$themeStore.theme === 'light' ? '#f8fafc' : '#0f172a'}; border-radius: 12px; border: 1px solid {$themeStore.theme === 'light' ? '#e2e8f0' : '#334155'};">
										<div>
											<div style="font-weight: 600; font-size: 14px; color: {$themeStore.theme === 'light' ? '#1e293b' : '#f1f5f9'}; margin-bottom: 4px;">Mention User</div>
											<div style="font-size: 12px; color: {$themeStore.theme === 'light' ? '#64748b' : '#94a3b8'};">@mention in notifications</div>
										</div>
										<label style="position: relative; display: inline-block; width: 48px; height: 24px;">
											<input type="checkbox" bind:checked={settings.mentionUser} style="opacity: 0; width: 0; height: 0;">
											<span style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background: {settings.mentionUser ? '#10b981' : '#cbd5e1'}; transition: 0.4s; border-radius: 24px;">
												<span style="position: absolute; content: ''; height: 18px; width: 18px; left: 3px; bottom: 3px; background: white; transition: 0.4s; border-radius: 50%; transform: {settings.mentionUser ? 'translateX(24px)' : 'translateX(0)'};"></span>
											</span>
										</label>
									</div>
									
									<!-- User ID for Mention -->
									{#if settings.mentionUser}
										<div style="padding: 16px 20px; background: {$themeStore.theme === 'light' ? '#f0f9ff' : '#0c1222'}; border-radius: 12px; border: 1px solid {$themeStore.theme === 'light' ? '#0ea5e920' : '#0ea5e930'};">
											<label for="user-mention" style="display: block; margin-bottom: 8px; font-weight: 600; font-size: 14px; color: {$themeStore.theme === 'light' ? '#0c4a6e' : '#7dd3fc'};">
												User ID or Username
											</label>
											<input
												id="user-mention"
												type="text"
												bind:value={settings.userMention}
												placeholder="Enter user ID (e.g., 123456789) or username (e.g., @username)"
												style="width: 100%; padding: 10px 14px; border-radius: 8px; border: 1px solid {$themeStore.theme === 'light' ? '#0ea5e930' : '#0ea5e950'}; background: {$themeStore.theme === 'light' ? '#ffffff' : '#1e293b'}; color: {$themeStore.theme === 'light' ? '#0c4a6e' : '#7dd3fc'}; font-size: 14px; transition: all 0.2s ease;"
											/>
											<div style="margin-top: 8px; font-size: 12px; color: {$themeStore.theme === 'light' ? '#0284c7' : '#67e8f9'};">
												💡 Tip: Use Discord user ID (numbers) for reliable mentions, or @username format
											</div>
										</div>
									{/if}

								<!-- Reminder Interval Settings -->
								<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
									<div>
										<label for="reminder-interval" style="display: block; margin-bottom: 8px; font-weight: 600; font-size: 14px; color: {$themeStore.theme === 'light' ? '#1e293b' : '#f1f5f9'};">
											Reminder Frequency
										</label>
										<input
											id="reminder-interval"
											type="number"
											bind:value={settings.reminderInterval}
											min="1"
											max="60"
											style="width: 100%; padding: 12px 16px; border-radius: 12px; border: 1px solid {$themeStore.theme === 'light' ? '#e2e8f0' : '#334155'}; background: {$themeStore.theme === 'light' ? '#ffffff' : '#0f172a'}; color: {$themeStore.theme === 'light' ? '#1e293b' : '#f1f5f9'}; font-size: 15px; transition: all 0.2s ease;"
										/>
									</div>
									<div>
										<label for="reminder-unit" style="display: block; margin-bottom: 8px; font-weight: 600; font-size: 14px; color: {$themeStore.theme === 'light' ? '#1e293b' : '#f1f5f9'};">
											Time Unit
										</label>
										<select
											id="reminder-unit"
											bind:value={settings.reminderUnit}
											style="width: 100%; padding: 12px 16px; border-radius: 12px; border: 1px solid {$themeStore.theme === 'light' ? '#e2e8f0' : '#334155'}; background: {$themeStore.theme === 'light' ? '#ffffff' : '#0f172a'}; color: {$themeStore.theme === 'light' ? '#1e293b' : '#f1f5f9'}; font-size: 15px; transition: all 0.2s ease;"
										>
											<option value="minutes">Minutes</option>
											<option value="hours">Hours</option>
											<option value="days">Days</option>
										</select>
									</div>
								</div>
								<div style="margin-top: 8px; font-size: 12px; color: {$themeStore.theme === 'light' ? '#64748b' : '#94a3b8'};">
									⏰ Set how often to send task reminders (e.g., every 2 hours, every 1 day)
								</div>
								</div>

								<!-- Test Result -->
								{#if testResult}
									<div style="padding: 12px 16px; border-radius: 12px; font-size: 14px; background: {testResult.includes('success') ? '#10b98120' : '#ef444420'}; color: {testResult.includes('success') ? '#10b981' : '#ef4444'}; border: 1px solid {testResult.includes('success') ? '#10b98130' : '#ef444430'};">
										{testResult}
									</div>
								{/if}

								<!-- Buttons -->
								<div style="display: flex; flex-wrap: wrap; gap: 12px;">
									<button
										type="submit"
										class="btn-primary"
										disabled={isSaving}
										style="background: linear-gradient(135deg, #5865F2, #7289DA); color: white; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 600; font-size: 15px; transition: all 0.2s ease; display: inline-flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer;"
									>
										{#if isSaving}
											<svg style="width: 16px; height: 16px; animation: spin 1s linear infinite;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
												<path d="M21 12a9 9 0 1 1-6.219-8.56" />
											</svg>
											Saving...
										{:else}
											<svg style="width: 16px; height: 16px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
												<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
												<polyline points="17 21 17 13 7 13 7 21"></polyline>
												<polyline points="7 3 7 8 15 8"></polyline>
											</svg>
											Save Changes
										{/if}
									</button>

									<button
										type="button"
										class="btn-secondary"
										on:click={testNotification}
										disabled={isSaving || !settings.discordWebhookUrl}
										style="background: {$themeStore.theme === 'light' ? '#f8fafc' : '#1e293b'}; color: {$themeStore.theme === 'light' ? '#334155' : '#e2e8f0'}; border: 1px solid {$themeStore.theme === 'light' ? '#e2e8f0' : '#334155'}; padding: 12px 24px; border-radius: 12px; font-weight: 600; font-size: 15px; transition: all 0.2s ease; display: inline-flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer;"
									>
										<svg style="width: 16px; height: 16px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
											<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
										</svg>
										Test Webhook
									</button>
								</div>
							</div>
						</form>
					</div>
				</div>
			</div>

			<!-- Bottom Navigation -->
			<BottomNavigation />
		</div>
	</main>

	<style>
  /* Base Styles */
  :global(body) {
    overflow-x: hidden;
  }

  /* Animations */
  @keyframes fadeInUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes slideInLeft {
    from {
      transform: translateX(-20px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideInRight {
    from {
      transform: translateX(20px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideInUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* Card Styles */
  .card {
    transition: all 0.3s ease;
  }

  .card:hover {
    transform: translateY(-4px);
  }

  /* Form Elements */
  input[type="text"],
  input[type="number"],
  select {
    width: 100%;
    padding: 12px 16px;
    border-radius: 12px;
    border: 1px solid var(--border-color);
    background: var(--bg-color);
    color: var(--text-color);
    font-size: 15px;
    transition: all 0.2s ease;
  }

  input[type="text"]:focus,
  input[type="number"]:focus,
  select:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.25);
  }

  /* Buttons */
  .btn-primary,
  .btn-secondary {
    padding: 12px 24px;
    border-radius: 12px;
    font-weight: 600;
    font-size: 15px;
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    cursor: pointer;
    border: none;
  }

  .btn-primary {
    background: linear-gradient(135deg, #5865F2, #7289DA);
    color: white;
  }

  .btn-secondary {
    background: var(--bg-secondary);
    color: var(--text-color);
    border: 1px solid var(--border-color);
  }

  .btn-primary:not(:disabled):hover,
  .btn-secondary:not(:disabled):hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .btn-primary:disabled,
  .btn-secondary:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  /* Responsive Adjustments */
  @media (max-width: 768px) {
    main {
      padding: 16px 12px 80px !important;
    }
    
    .card {
      padding: 24px 16px !important;
    }
    
    h1 {
      font-size: 32px !important;
    }
  }
</style>

<!-- Theme variables are now handled in the script section -->
