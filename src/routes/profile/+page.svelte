<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { themeStore } from '$lib/theme';
    import BottomNavigation from '$lib/components/BottomNavigation.svelte';
    import type { User } from '$lib/db';

    let currentUser: User | null = null;
    let loading = true;
    let error: string | null = null;

    onMount(async () => {
        await loadUserProfile();
    });

    async function loadUserProfile() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                goto('/login');
                return;
            }

            const response = await fetch('/api/user/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const userData = await response.json();
                currentUser = userData;
            } else {
                error = 'Failed to load profile data';
            }
        } catch (err) {
            error = 'Error loading profile';
            console.error('Profile load error:', err);
        } finally {
            loading = false;
        }
    }

    function handleLogout() {
        localStorage.removeItem('token');
        goto('/login');
    }
</script>

<BottomNavigation />

<div class="profile-container">
    {#if loading}
        <div class="loading-state">
            <div class="loading-spinner">⏳</div>
            <h3>Loading Profile</h3>
            <p>Please wait while we load your profile data...</p>
        </div>
    {:else if error}
        <div class="error-state">
            <div class="error-icon">❌</div>
            <h3>Error Loading Profile</h3>
            <p>{error}</p>
        </div>
    {:else if currentUser}
        <div class="profile-header">
            <div class="profile-avatar-large">
                👤
            </div>
            <div class="profile-info">
                <h1 class="profile-name">{currentUser.username}</h1>
                <p class="profile-email">{currentUser.email}</p>
                <div class="profile-badge">
                    <span class="badge-icon">⭐</span>
                    <span class="badge-text">Premium Member</span>
                </div>
            </div>
        </div>

        <div class="profile-content">
            <div class="profile-section">
                <h2 class="section-title">Account Information</h2>
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Username</div>
                        <div class="info-value">{currentUser.username}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Email</div>
                        <div class="info-value">{currentUser.email}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Member Since</div>
                        <div class="info-value">{new Date(currentUser.createdAt || Date.now()).toLocaleDateString()}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Plan</div>
                        <div class="info-value plan-badge">Premium</div>
                    </div>
                </div>
            </div>

            <div class="profile-section">
                <h2 class="section-title">Actions</h2>
                <div class="actions-list">
                    <button class="action-button logout-button" on:click={handleLogout}>
                        <span class="action-icon">🚪</span>
                        <span class="action-text">Logout</span>
                    </button>
                </div>
            </div>
        </div>
    {/if}
</div>

<style>
    .profile-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
        min-height: 100vh;
        padding-bottom: 100px;
        background: var(--background);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .profile-header {
        display: flex;
        align-items: center;
        gap: 24px;
        margin-bottom: 40px;
        padding: 32px;
        background: var(--cardBackground);
        backdrop-filter: blur(20px);
        border-radius: 24px;
        border: 1px solid var(--cardBorder);
        box-shadow: var(--cardShadow);
    }

    .profile-avatar-large {
        width: 80px;
        height: 80px;
        border-radius: 40px;
        background: linear-gradient(135deg, var(--primary-color, #6366f1), var(--indicator-secondary, #a855f7));
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 36px;
        font-weight: 700;
        box-shadow: 0 8px 24px rgba(99, 102, 241, 0.3);
        border: 3px solid rgba(255, 255, 255, 0.2);
    }

    .profile-info {
        flex: 1;
    }

    .profile-name {
        font-size: 32px;
        font-weight: 700;
        color: var(--primary);
        margin: 0 0 8px 0;
    }

    .profile-email {
        font-size: 16px;
        color: var(--textSecondary);
        margin: 0 0 16px 0;
    }

    .profile-badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        background: linear-gradient(135deg, var(--primary-color, #6366f1), var(--indicator-secondary, #a855f7));
        color: white;
        border-radius: 20px;
        font-size: 14px;
        font-weight: 600;
        box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    }

    .badge-icon {
        font-size: 16px;
    }

    .profile-content {
        display: flex;
        flex-direction: column;
        gap: 32px;
    }

    .profile-section {
        background: var(--cardBackground);
        backdrop-filter: blur(20px);
        border-radius: 20px;
        border: 1px solid var(--cardBorder);
        padding: 24px;
        box-shadow: var(--cardShadow);
    }

    .section-title {
        font-size: 20px;
        font-weight: 700;
        color: var(--primary);
        margin: 0 0 20px 0;
    }

    .info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
    }

    .info-item {
        padding: 16px;
        background: rgba(99, 102, 241, 0.05);
        border-radius: 12px;
        border: 1px solid rgba(99, 102, 241, 0.1);
    }

    .info-label {
        font-size: 12px;
        font-weight: 600;
        color: var(--textSecondary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 8px;
    }

    .info-value {
        font-size: 16px;
        font-weight: 600;
        color: var(--text);
    }

    .plan-badge {
        background: linear-gradient(135deg, var(--primary-color, #6366f1), var(--indicator-secondary, #a855f7));
        color: white;
        padding: 4px 12px;
        border-radius: 12px;
        display: inline-block;
    }

    .actions-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .action-button {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px 20px;
        border: none;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        font-size: 16px;
        font-weight: 600;
        width: 100%;
        text-align: left;
    }

    .logout-button {
        background: rgba(239, 68, 68, 0.1);
        color: #ef4444;
        border: 1px solid rgba(239, 68, 68, 0.2);
    }

    .logout-button:hover {
        background: rgba(239, 68, 68, 0.2);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
    }

    .action-icon {
        font-size: 20px;
    }

    .action-text {
        flex: 1;
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
        margin: 0;
        font-size: 14px;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    /* Responsive design */
    @media (max-width: 768px) {
        .profile-container {
            padding: 16px;
        }

        .profile-header {
            flex-direction: column;
            text-align: center;
            padding: 24px;
        }

        .profile-avatar-large {
            width: 60px;
            height: 60px;
            font-size: 28px;
        }

        .profile-name {
            font-size: 24px;
        }

        .info-grid {
            grid-template-columns: 1fr;
        }
    }
</style>
