<script lang="ts">
	import { themeStore } from '$lib/theme';
	import type { Task } from '$lib/types';

	interface TaskDialogProps {
	isOpen?: boolean;
	selectedTask?: Task | undefined;
	onClose?: () => void;
	onSave?: (taskData: Partial<Task>) => void;
	isLoading?: boolean;
}

	let { 
		isOpen = false, 
		selectedTask = undefined as Task | undefined, 
		onClose = () => {}, 
		onSave = (taskData: Partial<Task>) => {},
		isLoading = false 
	}: TaskDialogProps = $props();

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
		onclick={handleBackdropClick}
		onkeydown={(e) => {
			if (e.key === 'Escape') {
				handleClose();
			}
		}}
		role="dialog"
		tabindex="-1"
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

			<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} style="display: flex; flex-direction: column; gap: 20px;">
				<div>
					<label for="task-title" style="display: block; margin-bottom: 8px; color: {$themeStore.colors.text}; font-weight: 500; font-size: 14px;">
						Title *
					</label>
					<input
						id="task-title"
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
						onfocus={(e) => {
							e.currentTarget.style.borderColor = $themeStore.colors.primary;
							e.currentTarget.style.boxShadow = `0 0 0 3px ${$themeStore.colors.primary}20`;
						}}
						onblur={(e) => {
							e.currentTarget.style.borderColor = $themeStore.colors.inputBorder;
							e.currentTarget.style.boxShadow = 'none';
						}}
					/>
				</div>

				<div>
					<label for="task-description" style="display: block; margin-bottom: 8px; color: {$themeStore.colors.text}; font-weight: 500; font-size: 14px;">
						Description
					</label>
					<textarea
						id="task-description"
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
						onfocus={(e) => {
							e.currentTarget.style.borderColor = $themeStore.colors.primary;
							e.currentTarget.style.boxShadow = `0 0 0 3px ${$themeStore.colors.primary}20`;
						}}
						onblur={(e) => {
							e.currentTarget.style.borderColor = $themeStore.colors.inputBorder;
							e.currentTarget.style.boxShadow = 'none';
						}}
					></textarea>
				</div>

				<div>
					<label for="task-priority" style="display: block; margin-bottom: 8px; color: {$themeStore.colors.text}; font-weight: 500; font-size: 14px;">
						Priority
					</label>
					<div style="display: flex; gap: 12px;">
						{#each ['LOW', 'MEDIUM', 'HIGH'] as prio}
							<button
								type="button"
								onclick={() => priority = prio as 'LOW' | 'MEDIUM' | 'HIGH'}
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
								onmouseenter={(e) => {
									if (priority !== prio) {
										e.currentTarget.style.background = $themeStore.colors.primary + '10';
										e.currentTarget.style.borderColor = $themeStore.colors.primary;
									}
								}}
								onmouseleave={(e) => {
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
					<label for="task-deadline" style="display: block; margin-bottom: 8px; color: {$themeStore.colors.text}; font-weight: 500; font-size: 14px;">
						Deadline
					</label>
					<input
						id="task-deadline"
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
						onfocus={(e) => {
							e.currentTarget.style.borderColor = $themeStore.colors.primary;
							e.currentTarget.style.boxShadow = `0 0 0 3px ${$themeStore.colors.primary}20`;
						}}
						onblur={(e) => {
							e.currentTarget.style.borderColor = $themeStore.colors.inputBorder;
							e.currentTarget.style.boxShadow = 'none';
						}}
					/>
				</div>

				<div style="display: flex; gap: 12px; margin-top: 8px;">
					<button
						type="button"
						onclick={handleClose}
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
						onmouseenter={(e) => {
							e.currentTarget.style.background = $themeStore.colors.cardBorder + '20';
						}}
						onmouseleave={(e) => {
							e.currentTarget.style.background = $themeStore.colors.inputBg;
						}}
					>
						Cancel
					</button>
					<button
						type="submit"
						disabled={!title.trim() || isLoading}
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
							opacity: {(title.trim() && !isLoading) ? 1 : 0.6};
							cursor: {(title.trim() && !isLoading) ? 'pointer' : 'not-allowed'};
							display: flex;
							align-items: center;
							justify-content: center;
							gap: 8px;
						"
					>
						{#if isLoading}
							<div style="width: 16px; height: 16px; border: 2px solid rgba(255, 255, 255, 0.3); border-top: 2px solid white; border-radius: 50%; animation: spin 1s linear infinite;"></div>
						{/if}
						{selectedTask ? (isLoading ? 'Updating...' : '💾 Update Task') : (isLoading ? 'Creating...' : '➕ Create Task')}
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
