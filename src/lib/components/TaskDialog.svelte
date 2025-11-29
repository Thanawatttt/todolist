<script lang="ts">
	import { themeStore } from '$lib/theme';
	import type { Task } from '$lib/types';

	let { 
		isOpen = false, 
		selectedTask = undefined, 
		onClose = () => {}, 
		onSave = () => {} 
	} = $props();

	let title = $state('');
	let description = $state('');
	let priority = $state<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
	let deadline = $state('');

	// Initialize form when editing
	$effect(() => {
		if (isOpen && selectedTask) {
			title = selectedTask.title;
			description = selectedTask.description;
			priority = selectedTask.priority;
			deadline = selectedTask.deadline;
		} else if (isOpen && !selectedTask) {
			// Reset form for new task
			title = '';
			description = '';
			priority = 'MEDIUM';
			deadline = '';
		}
	});

	function handleSubmit() {
		if (!title.trim()) return;

		const taskData = {
			title: title.trim(),
			description: description.trim(),
			priority,
			deadline: deadline.trim(),
		};

		onSave(taskData);
	}

	function handleClose() {
		onClose();
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			handleClose();
		}
	}
</script>

{#if isOpen}
	<div 
		on:click={handleBackdropClick}
		style="
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background: rgba(0, 0, 0, 0.5);
			backdrop-filter: blur(4px);
			display: flex;
			justify-content: center;
			align-items: center;
			z-index: 10000;
			animation: fadeIn 0.2s ease-out;
		"
	>
		<div 
			style="
				background: {$themeStore.theme === 'light' ? 'rgba(255, 255, 255, 0.98)' : $themeStore.colors.cardBackground};
				backdrop-filter: blur(20px);
				border-radius: 20px;
				padding: 32px;
				width: 90%;
				max-width: 500px;
				max-height: 90vh;
				overflow-y: auto;
				box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
				border: {$themeStore.theme === 'light' ? '1px solid rgba(102, 126, 234, 0.15)' : `1px solid ${$themeStore.colors.cardBorder}`};
				animation: slideUp 0.3s ease-out;
			"
		>
			<h2 style="margin: 0 0 24px 0; font-size: 24px; font-weight: 600; color: {$themeStore.theme === 'light' ? $themeStore.colors.text : $themeStore.colors.textLight};">
				{selectedTask ? '✏️ Edit Task' : '➕ Create New Task'}
			</h2>

			<form on:submit|preventDefault={handleSubmit} style="display: flex; flex-direction: column; gap: 20px;">
				<div>
					<label style="display: block; margin-bottom: 8px; color: {$themeStore.colors.text}; font-weight: 500; font-size: 14px;">
						Title *
					</label>
					<input
						bind:value={title}
						type="text"
						placeholder="Enter task title"
						required
						style="
							width: 100%;
							padding: 12px 16px;
							background: {$themeStore.colors.inputBg};
							border: 1px solid {$themeStore.colors.inputBorder};
							border-radius: 10px;
							color: {$themeStore.colors.text};
							font-size: 16px;
							transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
						"
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
					<label style="display: block; margin-bottom: 8px; color: {$themeStore.colors.text}; font-weight: 500; font-size: 14px;">
						Description
					</label>
					<textarea
						bind:value={description}
						placeholder="Enter task description (optional)"
						rows="3"
						style="
							width: 100%;
							padding: 12px 16px;
							background: {$themeStore.colors.inputBg};
							border: 1px solid {$themeStore.colors.inputBorder};
							border-radius: 10px;
							color: {$themeStore.colors.text};
							font-size: 16px;
							resize: vertical;
							transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
						"
						on:focus={(e) => {
							e.currentTarget.style.borderColor = $themeStore.colors.primary;
							e.currentTarget.style.boxShadow = `0 0 0 3px ${$themeStore.colors.primary}20`;
						}}
						on:blur={(e) => {
							e.currentTarget.style.borderColor = $themeStore.colors.inputBorder;
							e.currentTarget.style.boxShadow = 'none';
						}}
					></textarea>
				</div>

				<div>
					<label style="display: block; margin-bottom: 8px; color: {$themeStore.colors.text}; font-weight: 500; font-size: 14px;">
						Priority
					</label>
					<div style="display: flex; gap: 12px;">
						{#each ['LOW', 'MEDIUM', 'HIGH'] as prio}
							<button
								type="button"
								on:click={() => priority = prio as 'LOW' | 'MEDIUM' | 'HIGH'}
								style="
									flex: 1;
									padding: 10px;
									background: {priority === prio ? 
										(prio === 'HIGH' ? $themeStore.colors.error : prio === 'MEDIUM' ? $themeStore.colors.warning : $themeStore.colors.success) + '20' : 
										$themeStore.colors.inputBg};
									color: {priority === prio ? 
										(prio === 'HIGH' ? $themeStore.colors.error : prio === 'MEDIUM' ? $themeStore.colors.warning : $themeStore.colors.success) : 
										$themeStore.colors.text};
									border: 1px solid {priority === prio ? 
										(prio === 'HIGH' ? $themeStore.colors.error : prio === 'MEDIUM' ? $themeStore.colors.warning : $themeStore.colors.success) : 
										$themeStore.colors.inputBorder};
									border-radius: 10px;
									font-size: 14px;
									font-weight: 500;
									cursor: pointer;
									transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
								"
								on:mouseenter={(e) => {
									if (priority !== prio) {
										e.currentTarget.style.background = $themeStore.colors.primary + '10';
										e.currentTarget.style.borderColor = $themeStore.colors.primary;
									}
								}}
								on:mouseleave={(e) => {
									if (priority !== prio) {
										e.currentTarget.style.background = $themeStore.colors.inputBg;
										e.currentTarget.style.borderColor = $themeStore.colors.inputBorder;
									}
								}}
							>
								{prio}
							</button>
						{/each}
					</div>
				</div>

				<div>
					<label style="display: block; margin-bottom: 8px; color: {$themeStore.colors.text}; font-weight: 500; font-size: 14px;">
						Deadline
					</label>
					<input
						bind:value={deadline}
						type="date"
						style="
							width: 100%;
							padding: 12px 16px;
							background: {$themeStore.colors.inputBg};
							border: 1px solid {$themeStore.colors.inputBorder};
							border-radius: 10px;
							color: {$themeStore.colors.text};
							font-size: 16px;
							transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
						"
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

				<div style="display: flex; gap: 12px; margin-top: 8px;">
					<button
						type="button"
						on:click={handleClose}
						style="
							flex: 1;
							padding: 14px 24px;
							background: {$themeStore.colors.inputBg};
							color: {$themeStore.colors.text};
							border: 1px solid {$themeStore.colors.inputBorder};
							border-radius: 10px;
							font-size: 16px;
							font-weight: 600;
							cursor: pointer;
							transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
						"
						on:mouseenter={(e) => {
							e.currentTarget.style.background = $themeStore.colors.cardBorder + '20';
						}}
						on:mouseleave={(e) => {
							e.currentTarget.style.background = $themeStore.colors.inputBg;
						}}
					>
						Cancel
					</button>
					<button
						type="submit"
						disabled={!title.trim()}
						style="
							flex: 1;
							padding: 14px 24px;
							background: linear-gradient(135deg, {$themeStore.colors.primary} 0%, {$themeStore.colors.secondary} 100%);
							color: white;
							border: none;
							border-radius: 10px;
							font-size: 16px;
							font-weight: 600;
							cursor: pointer;
							transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
							box-shadow: 0 4px 15px {$themeStore.colors.primary}40;
							opacity: {title.trim() ? 1 : 0.6};
							cursor: {title.trim() ? 'pointer' : 'not-allowed'};
						"
						on:mouseenter={(e) => {
							if (title.trim()) {
								e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
								e.currentTarget.style.boxShadow = `0 6px 20px ${$themeStore.colors.primary}60`;
							}
						}}
						on:mouseleave={(e) => {
							e.currentTarget.style.transform = 'translateY(0) scale(1)';
							e.currentTarget.style.boxShadow = `0 4px 15px ${$themeStore.colors.primary}40`;
						}}
					>
						{selectedTask ? '💾 Update Task' : '➕ Create Task'}
					</button>
				</div>
			</form>
		</div>
	</div>

	<style>
		@keyframes fadeIn {
			from { opacity: 0; }
			to { opacity: 1; }
		}

		@keyframes slideUp {
			from { 
				opacity: 0;
				transform: translateY(20px);
			}
			to { 
				opacity: 1;
				transform: translateY(0);
			}
		}
	</style>
{/if}
