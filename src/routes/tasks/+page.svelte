<script lang="ts">
    import { onMount } from 'svelte';
    import { themeStore } from '$lib/theme';
    import type { Task } from '$lib/db';
    import BottomNavigation from '$lib/components/BottomNavigation.svelte';

    let tasks: Task[] = [];
    let loading = true;
    let error: string | null = null;
    let filter = 'all';
    let searchTerm = '';

    async function loadTasks() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                error = 'Please login to view tasks';
                return;
            }

            const response = await fetch('/api/tasks', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    error = 'Please login to view tasks';
                } else {
                    error = 'Failed to load tasks';
                }
                return;
            }

            tasks = await response.json();
        } catch (err) {
            error = 'Failed to load tasks';
            console.error('Error loading tasks:', err);
        } finally {
            loading = false;
        }
    }

    async function toggleTask(taskId: string) {
        try {
            const token = localStorage.getItem('token');
            const task = tasks.find(t => t.id === taskId);
            
            if (!task || !token) return;

            const response = await fetch('/api/tasks', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    id: taskId,
                    status: task.status === 'completed' ? 'pending' : 'completed'
                })
            });

            if (response.ok) {
                const updatedTask = await response.json();
                tasks = tasks.map(t => t.id === taskId ? updatedTask : t);
            }
        } catch (err) {
            console.error('Error updating task:', err);
        }
    }

    $: filteredTasks = tasks.filter(task => {
        const matchesFilter = filter === 'all' || 
            (filter === 'completed' && task.status === 'completed') ||
            (filter === 'pending' && task.status !== 'completed');
        const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
        return matchesFilter && matchesSearch;
    });

    function getPriorityColor(priority: string) {
        switch (priority) {
            case 'high': return '#ef4444';
            case 'medium': return '#f59e0b';
            case 'low': return '#10b981';
            default: return '#6b7280';
        }
    }

    function getPriorityIcon(priority: string) {
        switch (priority) {
            case 'high': return '🔴';
            case 'medium': return '🟡';
            case 'low': return '🟢';
            default: return '⚪';
        }
    }

    function getStatusIcon(status: string) {
        switch (status) {
            case 'completed': return '✅';
            case 'in-progress': return '🔄';
            case 'pending': return '⏳';
            default: return '📋';
        }
    }

    onMount(() => {
        loadTasks();
    });
</script>

<BottomNavigation />

<div class="tasks-container">
    <div class="tasks-header">
        <h1 class="page-title">My Tasks</h1>
        <div class="tasks-stats">
            <div class="stat-card">
                <div class="stat-number">{tasks.filter(t => t.status === 'completed').length}</div>
                <div class="stat-label">Completed</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">{tasks.filter(t => t.status !== 'completed').length}</div>
                <div class="stat-label">Pending</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">{tasks.length}</div>
                <div class="stat-label">Total</div>
            </div>
        </div>
    </div>

    <div class="tasks-controls">
        <div class="search-box">
            <input 
                type="text" 
                placeholder="Search tasks..." 
                bind:value={searchTerm}
                class="search-input"
            />
            <span class="search-icon">🔍</span>
        </div>
        
        <div class="filter-buttons">
            <button 
                class="filter-btn" 
                class:active={filter === 'all'}
                on:click={() => filter = 'all'}
            >
                All
            </button>
            <button 
                class="filter-btn" 
                class:active={filter === 'pending'}
                on:click={() => filter = 'pending'}
            >
                Pending
            </button>
            <button 
                class="filter-btn" 
                class:active={filter === 'completed'}
                on:click={() => filter = 'completed'}
            >
                Completed
            </button>
        </div>
    </div>

    <div class="tasks-list">
        {#if loading}
            <div class="loading-state">
                <div class="loading-spinner">⏳</div>
                <h3>Loading tasks...</h3>
                <p>Please wait while we fetch your tasks</p>
            </div>
        {:else if error}
            <div class="error-state">
                <div class="error-icon">❌</div>
                <h3>Error loading tasks</h3>
                <p>{error}</p>
                <button class="retry-button" on:click={loadTasks}>
                    🔄 Retry
                </button>
            </div>
        {:else if filteredTasks.length === 0}
            <div class="empty-state">
                <div class="empty-icon">📝</div>
                <h3>No tasks found</h3>
                <p>Try adjusting your search or filter criteria</p>
            </div>
        {:else}
            {#each filteredTasks as task (task.id)}
                <div class="task-card" class:completed={task.status === 'completed'}>
                    <div class="task-header">
                        <div class="task-checkbox">
                            <input 
                                type="checkbox" 
                                checked={task.status === 'completed'}
                                on:change={() => toggleTask(task.id)}
                                id="task-{task.id}"
                            />
                            <label for="task-{task.id}" class="checkbox-label"></label>
                        </div>
                        <div class="task-title-section">
                            <h3 class="task-title">{task.title}</h3>
                            <p class="task-description">{task.description || ''}</p>
                        </div>
                        <div class="task-actions">
                            <span class="priority-badge" style="color: {getPriorityColor(task.priority)}">
                                {getPriorityIcon(task.priority)} {task.priority}
                            </span>
                            <span class="status-badge">
                                {getStatusIcon(task.status)}
                            </span>
                        </div>
                    </div>
                    <div class="task-footer">
                        <div class="task-meta">
                            <span class="due-date">
                                📅 Due: {task.dueDate || 'No due date'}
                            </span>
                            <span class="task-id">
                                #{task.id}
                            </span>
                        </div>
                    </div>
                </div>
            {/each}
        {/if}
    </div>
</div>

<style>
    .tasks-container {
        max-width: 1000px;
        margin: 0 auto;
        padding: 20px;
        min-height: 100vh;
        padding-bottom: 100px;
        background: var(--background);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .tasks-header {
        margin-bottom: 32px;
    }

    .page-title {
        font-size: 32px;
        font-weight: 700;
        color: var(--primary);
        margin: 0 0 24px 0;
    }

    .tasks-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 16px;
        margin-bottom: 32px;
    }

    .stat-card {
        background: var(--cardBackground);
        backdrop-filter: blur(20px);
        border: 1px solid var(--cardBorder);
        border-radius: 16px;
        padding: 20px;
        text-align: center;
        box-shadow: var(--cardShadow);
    }

    .stat-number {
        font-size: 28px;
        font-weight: 700;
        color: var(--primary);
        margin-bottom: 4px;
    }

    .stat-label {
        font-size: 14px;
        color: var(--textSecondary);
        font-weight: 500;
    }

    .tasks-controls {
        display: flex;
        flex-direction: column;
        gap: 20px;
        margin-bottom: 32px;
    }

    .search-box {
        position: relative;
        max-width: 400px;
    }

    .search-input {
        width: 100%;
        padding: 12px 16px 12px 48px;
        border: 1px solid var(--inputBorder);
        border-radius: 12px;
        background: var(--inputBg);
        font-size: 16px;
        color: var(--text);
        transition: all 0.3s ease;
    }

    .search-input:focus {
        outline: none;
        border-color: var(--primary);
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }

    .search-icon {
        position: absolute;
        left: 16px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 18px;
        color: var(--textSecondary);
    }

    .filter-buttons {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
    }

    .filter-btn {
        padding: 8px 20px;
        border: 1px solid var(--cardBorder);
        border-radius: 20px;
        background: var(--cardBackground);
        color: var(--textSecondary);
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .filter-btn:hover {
        background: rgba(99, 102, 241, 0.1);
        border-color: var(--primary);
        color: var(--primary);
    }

    .filter-btn.active {
        background: var(--primary);
        color: white;
        border-color: var(--primary);
    }

    .tasks-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .task-card {
        background: var(--cardBackground);
        backdrop-filter: blur(20px);
        border: 1px solid var(--cardBorder);
        border-radius: 16px;
        padding: 20px;
        box-shadow: var(--cardShadow);
        transition: all 0.3s ease;
    }

    .task-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    }

    .task-card.completed {
        opacity: 0.7;
        background: rgba(16, 185, 129, 0.05);
    }

    .task-header {
        display: flex;
        align-items: flex-start;
        gap: 16px;
        margin-bottom: 16px;
    }

    .task-checkbox {
        position: relative;
        margin-top: 4px;
    }

    .task-checkbox input[type="checkbox"] {
        opacity: 0;
        position: absolute;
        width: 20px;
        height: 20px;
        cursor: pointer;
    }

    .checkbox-label {
        display: block;
        width: 20px;
        height: 20px;
        border: 2px solid var(--cardBorder);
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.3s ease;
        position: relative;
    }

    .checkbox-label::after {
        content: '✓';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0);
        color: white;
        font-size: 12px;
        font-weight: bold;
        transition: transform 0.3s ease;
    }

    .task-checkbox input[type="checkbox"]:checked + .checkbox-label {
        background: var(--primary);
        border-color: var(--primary);
    }

    .task-checkbox input[type="checkbox"]:checked + .checkbox-label::after {
        transform: translate(-50%, -50%) scale(1);
    }

    .task-title-section {
        flex: 1;
    }

    .task-title {
        font-size: 18px;
        font-weight: 600;
        color: var(--text);
        margin: 0 0 8px 0;
    }

    .task-card.completed .task-title {
        text-decoration: line-through;
        color: var(--textSecondary);
    }

    .task-description {
        font-size: 14px;
        color: var(--textSecondary);
        margin: 0;
        line-height: 1.5;
    }

    .task-actions {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .priority-badge, .status-badge {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        font-weight: 600;
        padding: 4px 8px;
        border-radius: 8px;
        background: rgba(99, 102, 241, 0.1);
    }

    .status-badge {
        background: rgba(107, 114, 128, 0.1);
    }

    .task-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 16px;
        border-top: 1px solid var(--cardBorder);
    }

    .task-meta {
        display: flex;
        gap: 16px;
        font-size: 12px;
        color: var(--textSecondary);
    }

    .due-date, .task-id {
        display: flex;
        align-items: center;
        gap: 4px;
    }

    .empty-state {
        text-align: center;
        padding: 60px 20px;
        color: var(--textSecondary);
    }

    .empty-icon {
        font-size: 48px;
        margin-bottom: 16px;
    }

    .empty-state h3 {
        font-size: 20px;
        font-weight: 600;
        margin: 0 0 8px 0;
        color: var(--text);
    }

    .empty-state p {
        margin: 0;
        font-size: 14px;
    }

    .loading-state, .error-state {
        text-align: center;
        padding: 60px 20px;
        color: var(--textSecondary);
    }

    .loading-spinner, .error-icon {
        font-size: 48px;
        margin-bottom: 16px;
        animation: spin 2s linear infinite;
    }

    .error-icon {
        animation: none;
    }

    .loading-state h3, .error-state h3 {
        font-size: 20px;
        font-weight: 600;
        margin: 0 0 8px 0;
        color: var(--text);
    }

    .loading-state p, .error-state p {
        margin: 0 0 20px 0;
        font-size: 14px;
    }

    .retry-button {
        padding: 8px 20px;
        border: 1px solid var(--primary);
        border-radius: 20px;
        background: var(--primary);
        color: white;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .retry-button:hover {
        background: #6366f1;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    /* Responsive design */
    @media (max-width: 768px) {
        .tasks-container {
            padding: 16px;
        }

        .page-title {
            font-size: 24px;
        }

        .task-header {
            flex-direction: column;
            gap: 12px;
        }

        .task-actions {
            align-self: flex-start;
        }

        .task-footer {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
        }

        .filter-buttons {
            justify-content: center;
        }
    }
</style>
