<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/auth';
	import { themeStore } from '$lib/theme';
	import type { Task } from '$lib/types';
	import BottomNavigation from '$lib/components/BottomNavigation.svelte';
	import TaskDialog from '$lib/components/TaskDialog.svelte';

	let tasks: Task[] = [];
	let isLoading = true;
	let isMobile = false;
	let selectedTask: Task | undefined;
	let isDialogOpen = false;
	let isCreatingTask = false;
	let isUpdatingTask = false;
	let isDeletingTask = false;
	let showLoadingPopup = false;
	let loadingMessage = '';

	// Check mobile on mount and resize
	onMount(() => {
		checkMobile();
		window.addEventListener('resize', checkMobile);
		fetchTasks();
		return () => window.removeEventListener('resize', checkMobile);
	});

	function checkMobile() {
		isMobile = window.innerWidth <= 768;
	}

	function showLoading(message: string) {
		loadingMessage = message;
		showLoadingPopup = true;
	}

	function hideLoading() {
		showLoadingPopup = false;
		loadingMessage = '';
	}

	async function fetchTasks() {
		const token = localStorage.getItem('token');
		if (!token) {
			goto('/login');
			return;
		}

		try {
			const response = await fetch('/api/tasks', {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (response.ok) {
				const data = await response.json();
				tasks = data;
			}
		} catch (error) {
			console.error('Failed to fetch tasks:', error);
		} finally {
			isLoading = false;
		}
	}

	async function handleCreateTask(taskData: Partial<Task>) {
		const token = localStorage.getItem('token');
		if (!token) return;

		isCreatingTask = true;
		showLoading('Creating task...');

		try {
			const response = await fetch('/api/tasks', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(taskData),
			});

			if (response.ok) {
				const newTask = await response.json();
				tasks = [newTask, ...tasks];
				isDialogOpen = false;
				selectedTask = undefined;
			} else {
				const errorData = await response.json().catch(() => ({}));
				console.error('Create task error:', errorData);
				alert(`Failed to create task: ${errorData.error || 'Unknown error'}`);
			}
		} catch (error) {
			console.error('Failed to create task:', error);
			alert('Failed to create task. Please try again.');
		} finally {
			isCreatingTask = false;
			hideLoading();
		}
	}

	async function handleUpdateTask(taskData: Partial<Task>) {
		if (!selectedTask) return;

		const token = localStorage.getItem('token');
		if (!token) return;

		isUpdatingTask = true;
		showLoading('Updating task...');

		try {
			const response = await fetch('/api/tasks', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ ...taskData, id: selectedTask.id }),
			});

			if (response.ok) {
				const updatedTask = await response.json();
				tasks = tasks.map(t => t.id === selectedTask?.id ? updatedTask : t);
				isDialogOpen = false;
				selectedTask = undefined;
			} else {
				const errorData = await response.json().catch(() => ({}));
				console.error('Update task error:', errorData);
				alert(`Failed to update task: ${errorData.error || 'Unknown error'}`);
			}
		} catch (error) {
			console.error('Failed to update task:', error);
			alert('Failed to update task. Please try again.');
		} finally {
			isUpdatingTask = false;
			hideLoading();
		}
	}

	async function handleDeleteTask(taskId: string) {
		const token = localStorage.getItem('token');
		if (!token) return;

		isDeletingTask = true;
		showLoading('Deleting task...');

		try {
			const response = await fetch(`/api/tasks/${taskId}`, {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (response.ok) {
				tasks = tasks.filter(t => t.id !== taskId);
			} else {
				const errorData = await response.json().catch(() => ({}));
				console.error('Failed to delete task:', errorData.error);
				alert(`Failed to delete task: ${errorData.error || 'Unknown error'}`);
			}
		} catch (error) {
			console.error('Failed to delete task:', error);
			alert('Failed to delete task. Please try again.');
		} finally {
			isDeletingTask = false;
			hideLoading();
		}
	}

	function openCreateDialog() {
		selectedTask = undefined;
		isDialogOpen = true;
	}

	function openEditDialog(task: Task) {
		selectedTask = task;
		isDialogOpen = true;
	}

	function closeDialog() {
		isDialogOpen = false;
		selectedTask = undefined;
	}

	// Calculate stats
	$: stats = {
		total: tasks.length,
		completed: tasks.filter(t => t.completed).length,
		pending: tasks.filter(t => !t.completed).length,
		highPriority: tasks.filter(t => t.priority === 'HIGH' && !t.completed).length,
	};

	$: user = $authStore.user;
</script>

<div style="display: flex; height: 100vh; background: {$themeStore?.colors?.background || '#f8fafc'}; overflow: hidden; position: relative; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);">
	<!-- Main Content -->
	<main style="flex: 1; padding: {isMobile ? '80px 16px 100px 16px' : '32px'}; overflow: auto; display: flex; flex-direction: column; gap: 24px;">
		<!-- Animated Header -->
		<div style="animation: fadeInUp 0.6s ease-out; transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';">
			<h1 style="margin: 0; font-size: {isMobile ? '28px' : '36px'}; font-weight: 700; background: linear-gradient(135deg, {$themeStore.colors.primary} 0%, {$themeStore.colors.secondary} 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: 8px;">
				👋 Welcome back, {user?.username || 'User'}!
			</h1>
			<p style="margin: 0; color: {$themeStore.theme === 'light' ? $themeStore.colors.textSecondary : $themeStore.colors.textLightSecondary}; font-size: {isMobile ? '16px' : '18px'};">
				{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
			</p>
		</div>

		{#if isLoading}
			<div style="display: flex; justify-content: center; align-items: center; height: 200px; animation: fadeInUp 0.6s ease-out;">
				<div style="width: 40px; height: 40px; border: 3px solid {$themeStore.colors.glass}; border-top: 3px solid {$themeStore.colors.primary}; border-radius: 50%; animation: spin 1s linear infinite;"></div>
				<span style="margin-left: 16px; color: {$themeStore.colors.text};">Loading your tasks...</span>
			</div>
		{:else}
			<!-- Stats Cards -->
			<div style="display: grid; grid-template-columns: repeat({isMobile ? '2' : '4'}, 1fr); gap: 20px; margin-bottom: 32px; animation: fadeInUp 0.7s ease-out;">
				<div style="background: rgba(255, 255, 255, 0.05);
backdrop-filter: blur(12px);
border-radius: 16px;
padding: 24px;
border: 1px solid rgba(255, 255, 255, 0.1);
box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
transition: all 0.3s ease; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); position: relative; overflow: hidden;"
					role="button"
					tabindex="0"
					on:mouseenter={(e) => {
						e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
						e.currentTarget.style.boxShadow = `0 16px 48px ${$themeStore.colors.primary}30`;
					}}
					on:mouseleave={(e) => {
						e.currentTarget.style.transform = 'translateY(0) scale(1)';
						e.currentTarget.style.boxShadow = `0 8px 32px ${$themeStore.colors.primary}20`;
					}}
					on:keydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault();
							// Add click behavior if needed
						}
					}}>
					<div style="position: absolute; top: -20px; right: -20px; width: 80px; height: 80px; background: {$themeStore.colors.primary}20; border-radius: 50%; opacity: 0.5;"></div>
					<div style="position: relative; z-index: 1;">
						<div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
							<div style="width: 44px; height: 44px; background: rgba(255, 255, 255, 0.1); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px;">📊</div>
							<div style="color: {$themeStore.colors.primary}; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Total Tasks</div>
						</div>
						<div style="font-size: 32px; font-weight: 800; color: {$themeStore.theme === 'light' ? $themeStore.colors.text : $themeStore.colors.textLight}; margin-bottom: 4px; line-height: 1;">{stats.total}</div>
						<div style="color: {$themeStore.colors.primary}; font-size: 12px; font-weight: 500;">All tasks</div>
					</div>
				</div>

				<div style="background: rgba(255, 255, 255, 0.05);
backdrop-filter: blur(12px);
border-radius: 16px;
padding: 24px;
border: 1px solid rgba(255, 255, 255, 0.1);
box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
transition: all 0.3s ease; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); position: relative; overflow: hidden;"
					role="button"
					tabindex="0"
					on:mouseenter={(e) => {
						e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
						e.currentTarget.style.boxShadow = `0 16px 48px ${$themeStore.colors.success}30`;
					}}
					on:mouseleave={(e) => {
						e.currentTarget.style.transform = 'translateY(0) scale(1)';
						e.currentTarget.style.boxShadow = `0 8px 32px ${$themeStore.colors.success}20`;
					}}
					on:keydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault();
							// Add click behavior if needed
						}
					}}>
					<div style="position: absolute; top: -20px; right: -20px; width: 80px; height: 80px; background: {$themeStore.colors.success}20; border-radius: 50%; opacity: 0.5;"></div>
					<div style="position: relative; z-index: 1;">
						<div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
							<div style="width: 44px; height: 44px; background: rgba(255, 255, 255, 0.1); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px;">✅</div>
							<div style="color: {$themeStore.colors.success}; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Completed</div>
						</div>
						<div style="font-size: 32px; font-weight: 800; color: {$themeStore.theme === 'light' ? $themeStore.colors.text : $themeStore.colors.textLight}; margin-bottom: 4px; line-height: 1;">{stats.completed}</div>
						<div style="color: {$themeStore.colors.success}; font-size: 12px; font-weight: 500;">Done tasks</div>
					</div>
				</div>

				<div style="background: rgba(255, 255, 255, 0.05);
backdrop-filter: blur(12px);
border-radius: 16px;
padding: 24px;
border: 1px solid rgba(255, 255, 255, 0.1);
box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
transition: all 0.3s ease; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); position: relative; overflow: hidden;"
					role="button"
					tabindex="0"
					on:mouseenter={(e) => {
						e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
						e.currentTarget.style.boxShadow = `0 16px 48px ${$themeStore.colors.warning}30`;
					}}
					on:mouseleave={(e) => {
						e.currentTarget.style.transform = 'translateY(0) scale(1)';
						e.currentTarget.style.boxShadow = `0 8px 32px ${$themeStore.colors.warning}20`;
					}}
					on:keydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault();
							// Add click behavior if needed
						}
					}}>
					<div style="position: absolute; top: -20px; right: -20px; width: 80px; height: 80px; background: {$themeStore.colors.warning}20; border-radius: 50%; opacity: 0.5;"></div>
					<div style="position: relative; z-index: 1;">
						<div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
							<div style="width: 44px; height: 44px; background: rgba(255, 255, 255, 0.1); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px;">⏳</div>
							<div style="color: {$themeStore.colors.warning}; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Pending</div>
						</div>
						<div style="font-size: 32px; font-weight: 800; color: {$themeStore.theme === 'light' ? $themeStore.colors.text : $themeStore.colors.textLight}; margin-bottom: 4px; line-height: 1;">{stats.pending}</div>
						<div style="color: {$themeStore.colors.warning}; font-size: 12px; font-weight: 500;">In progress</div>
					</div>
				</div>

				<div style="background: rgba(255, 255, 255, 0.05);
backdrop-filter: blur(12px);
border-radius: 16px;
padding: 24px;
border: 1px solid rgba(255, 255, 255, 0.1);
box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
transition: all 0.3s ease; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); position: relative; overflow: hidden;"
					role="button"
					tabindex="0"
					on:mouseenter={(e) => {
						e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
						e.currentTarget.style.boxShadow = `0 16px 48px ${$themeStore.colors.error}30`;
					}}
					on:mouseleave={(e) => {
						e.currentTarget.style.transform = 'translateY(0) scale(1)';
						e.currentTarget.style.boxShadow = `0 8px 32px ${$themeStore.colors.error}20`;
					}}
					on:keydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault();
							// Add click behavior if needed
						}
					}}>
					<div style="position: absolute; top: -20px; right: -20px; width: 80px; height: 80px; background: {$themeStore.colors.error}20; border-radius: 50%; opacity: 0.5;"></div>
					<div style="position: relative; z-index: 1;">
						<div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
							<div style="width: 44px; height: 44px; background: rgba(255, 255, 255, 0.1); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px;">🔥</div>
							<div style="color: {$themeStore.colors.error}; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">High Priority</div>
						</div>
						<div style="font-size: 32px; font-weight: 800; color: {$themeStore.theme === 'light' ? $themeStore.colors.text : $themeStore.colors.textLight}; margin-bottom: 4px; line-height: 1;">{stats.highPriority}</div>
						<div style="color: {$themeStore.colors.error}; font-size: 12px; font-weight: 500;">Urgent tasks</div>
					</div>
				</div>
			</div>

			<!-- Tasks Section -->
			<div style="background: rgba(255, 255, 255, 0.03);
backdrop-filter: blur(12px);
border-radius: 16px;
padding: 32px;
border: 1px solid rgba(255, 255, 255, 0.05);
box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
transition: all 0.3s ease;">
				<div style="position: absolute; top: -50px; right: -50px; width: 150px; height: 150px; background: {$themeStore.colors.primary}10; border-radius: 50%; opacity: 0.3;"></div>
				<div style="position: absolute; bottom: -30px; left: -30px; width: 100px; height: 100px; background: {$themeStore.colors.secondary}10; border-radius: 50%; opacity: 0.3;"></div>
				
				<div style="position: relative; z-index: 1;">
					<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px;">
						<div style="display: flex; align-items: center; gap: 16px;">
							<div style="width: 56px; height: 56px; background: linear-gradient(135deg, {$themeStore.colors.primary} 0%, {$themeStore.colors.secondary} 100%); border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 28px; box-shadow: 0 8px 24px {$themeStore.colors.primary}30;">📋</div>
							<div>
								<h2 style="margin: 0; font-size: 28px; font-weight: 700; color: {$themeStore.theme === 'light' ? $themeStore.colors.text : $themeStore.colors.textLight};">Your Tasks</h2>
								<p style="margin: 4px 0 0 0; color: {$themeStore.theme === 'light' ? $themeStore.colors.textSecondary : $themeStore.colors.textLightSecondary}; font-size: 14px; line-height: 1.5;">Manage your daily tasks efficiently</p>
							</div>
						</div>
						<button
							on:click={openCreateDialog}
							style="background: rgba(255, 255, 255, 0.1); color: {$themeStore.colors.primary}; border: 1px solid rgba(255, 255, 255, 0.1); padding: 10px 20px; border-radius: 12px; font-size: 14px; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s ease;"
							on:mouseenter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
							on:mouseleave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}>Add Task</button>
					</div>

					{#if tasks.length === 0}
						<div style="text-align: center; padding: 60px 20px; color: {$themeStore.theme === 'light' ? $themeStore.colors.text : $themeStore.colors.textLight}; position: relative;">
							<div style="width: 120px; height: 120px; background: linear-gradient(135deg, {$themeStore.colors.primary}10 0%, {$themeStore.colors.secondary}10 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; font-size: 48px; box-shadow: 0 8px 32px {$themeStore.colors.primary}20;">📝</div>
							<h3 style="margin: 0 0 12px 0; font-size: 24px; font-weight: 600; background: linear-gradient(135deg, {$themeStore.colors.primary} 0%, {$themeStore.colors.secondary} 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">No tasks yet</h3>
							<p style="margin: 0 0 32px 0; color: {$themeStore.theme === 'light' ? $themeStore.colors.textSecondary : $themeStore.colors.textLightSecondary}; font-size: 16px; line-height: 1.6;">Create your first task to get started on your productivity journey!</p>
							<button
								on:click={openCreateDialog}
								style="background: rgba(255, 255, 255, 0.1); color: {$themeStore.colors.primary}; border: 1px solid rgba(255, 255, 255, 0.1); padding: 10px 20px; border-radius: 12px; font-size: 14px; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s ease;"
								on:mouseenter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
								on:mouseleave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}>Create Your First Task</button>
						</div>
					{:else}
						<div style="display: flex; flex-direction: column; gap: 12px;">
							{#each tasks as task (task.id)}
								<div style="background: {$themeStore.theme === 'light' ? 'rgba(248, 250, 252, 0.8)' : 'rgba(30, 41, 59, 0.6)'}; border-radius: 16px; padding: 16px; border: 1px solid {$themeStore.colors.cardBorder}; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer;"
									role="button"
									tabindex={0}
									on:mouseenter={(e) => {
										e.currentTarget.style.transform = 'translateY(-2px)';
										e.currentTarget.style.boxShadow = $themeStore.theme === 'light' ? '0 4px 20px rgba(0, 0, 0, 0.08)' : `0 4px 20px ${$themeStore.colors.shadow}`;
									}}
									on:mouseleave={(e) => {
										e.currentTarget.style.transform = 'translateY(0)';
										e.currentTarget.style.boxShadow = 'none';
									}}
									on:click={() => openEditDialog(task)}
									on:keydown={(e) => {
										if (e.key === 'Enter' || e.key === ' ') {
											e.preventDefault();
											openEditDialog(task);
										}
									}}>
									<div style="display: flex; justify-content: space-between; align-items: flex-start;">
										<div style="flex: 1;">
											<h4 style="margin: 0 0 24px 0; font-size: 20px; font-weight: 600; color: {$themeStore.theme === 'light' ? $themeStore.colors.text : $themeStore.colors.textLight}; display: flex; align-items: center; gap: 12px; padding-bottom: 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); {task.completed ? 'text-decoration: line-through; opacity: 0.6;' : ''};">{task.title}</h4>
											{#if task.description}
												<p style="margin: 0 0 8px 0; font-size: 14px; color: {$themeStore.theme === 'light' ? $themeStore.colors.textSecondary : $themeStore.colors.textLightSecondary}; {task.completed ? 'text-decoration: line-through; opacity: 0.6;' : ''};">{task.description}</p>
											{/if}
											<div style="display: flex; gap: 8px; align-items: center;">
												<span style="padding: 4px 8px; background: {task.priority === 'HIGH' ? $themeStore.colors.error : task.priority === 'MEDIUM' ? $themeStore.colors.warning : $themeStore.colors.success}20; color: {task.priority === 'HIGH' ? $themeStore.colors.error : task.priority === 'MEDIUM' ? $themeStore.colors.warning : $themeStore.colors.success}; border-radius: 6px; font-size: 12px; font-weight: 500;">
													{task.priority}
												</span>
												{#if task.deadline}
													<span style="padding: 4px 8px; background: {$themeStore.colors.primary}20; color: {$themeStore.colors.primary}; border-radius: 6px; font-size: 12px; font-weight: 500;">
														📅 {new Date(task.deadline).toLocaleDateString()}
													</span>
												{/if}
											</div>
										</div>
										<div style="display: flex; gap: 8px; align-items: center;">
											<button
												on:click|stopPropagation={() => {
													tasks = tasks.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t);
													handleUpdateTask({ ...task, completed: !task.completed });
												}}
												style="padding: 6px 12px; background: {task.completed ? $themeStore.colors.success : $themeStore.colors.primary}20; color: {task.completed ? $themeStore.colors.success : $themeStore.colors.primary}; border: none; border-radius: 6px; font-size: 12px; font-weight: 500; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);">
												{task.completed ? '✅' : '⭕'}
											</button>
											<button
												on:click|stopPropagation={() => handleDeleteTask(task.id)}
												style="padding: 6px 12px; background: {$themeStore.colors.error}20; color: {$themeStore.colors.error}; border: none; border-radius: 6px; font-size: 12px; font-weight: 500; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);">
												🗑️
											</button>
										</div>
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		{/if}
	</main>
</div>

<!-- Bottom Navigation - Always Visible -->
<BottomNavigation currentPage="dashboard" />

<!-- Task Dialog -->
{#if isDialogOpen}
	<TaskDialog
		isOpen={isDialogOpen}
		selectedTask={selectedTask}
		onClose={closeDialog}
		onSave={(taskData: Partial<Task>) => selectedTask ? handleUpdateTask(taskData) : handleCreateTask(taskData)}
		isLoading={isCreatingTask || isUpdatingTask}
	/>
{/if}

<!-- Loading Popup -->
{#if showLoadingPopup}
	<div 
		style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; z-index: 10000;"
	>
		<div style="background: {$themeStore.theme === 'light' ? '#ffffff' : '#1e293b'}; border-radius: 16px; padding: 24px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3); border: 1px solid {$themeStore.theme === 'light' ? '#e2e8f0' : '#334155'}; min-width: 300px; text-align: center;">
			<div style="display: flex; justify-content: center; margin-bottom: 16px;">
				<div style="width: 40px; height: 40px; border: 3px solid {$themeStore.colors.primary}20; border-top: 3px solid {$themeStore.colors.primary}; border-radius: 50%; animation: spin 1s linear infinite;"></div>
			</div>
			<p style="margin: 0; color: {$themeStore.theme === 'light' ? '#1e293b' : '#f1f5f9'}; font-size: 16px; font-weight: 500;">
				{loadingMessage}
			</p>
		</div>
	</div>
	
	<style>
		@keyframes spin {
			0% { transform: rotate(0deg); }
			100% { transform: rotate(360deg); }
		}
	</style>
{/if}
