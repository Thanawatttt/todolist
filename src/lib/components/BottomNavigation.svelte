<script lang="ts">
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { themeStore } from '$lib/theme';
    import { onMount } from 'svelte';
    import { createEventDispatcher } from 'svelte';
    
    interface NavItem {
        id: string;
        label: string;
        icon: string;
        href: string;
        badge?: number;
    }

    const navItems: NavItem[] = [
        { id: 'dashboard', label: 'Dashboard', icon: '✨', href: '/dashboard' },
        { id: 'settings', label: 'Settings', icon: '⚡', href: '/settings' },
    ];

    let isAnimating = false;
    let currentPath = '';
    const dispatch = createEventDispatcher();

    $: currentPath = $page.url.pathname;

    function navigateTo(href: string) {
        if (href !== currentPath) {
            isAnimating = true;
            goto(href);
            setTimeout(() => {
                isAnimating = false;
            }, 300);
        }
    }

    function createRipple(event: MouseEvent, element: HTMLElement) {
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        ripple.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: ${$themeStore.theme === 'light' 
                ? 'rgba(99, 102, 241, 0.3)' 
                : 'rgba(129, 140, 248, 0.4)'};
        `;
        
        element.appendChild(ripple);
        
        setTimeout(() => {
            ripple.classList.add('ripple-active');
        }, 10);
        
        setTimeout(() => {
            if (element.contains(ripple)) {
                element.removeChild(ripple);
            }
        }, 600);
    }

    function handleThemeToggle() {
        const button = document.querySelector('.theme-toggle-btn');
        if (button) {
            button.classList.add('theme-rotating');
            setTimeout(() => {
                button.classList.remove('theme-rotating');
            }, 600);
        }
        themeStore.toggle();
        dispatch('themeChanged');
    }

    onMount(() => {
        // Add custom styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes rippleExpand {
                0% {
                    transform: scale(0);
                    opacity: 1;
                }
                100% {
                    transform: scale(2);
                    opacity: 0;
                }
            }
            
            @keyframes slideUp {
                0% {
                    transform: translateY(100%);
                    opacity: 0;
                }
                100% {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
            
            @keyframes glow {
                0%, 100% {
                    box-shadow: 0 0 20px rgba(99, 102, 241, 0.3);
                }
                50% {
                    box-shadow: 0 0 30px rgba(99, 102, 241, 0.6);
                }
            }
            
            @keyframes float {
                0%, 100% {
                    transform: translateY(0);
                }
                50% {
                    transform: translateY(-3px);
                }
            }
            
            .ripple {
                position: absolute;
                border-radius: 50%;
                pointer-events: none;
                transform: scale(0);
                transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .ripple-active {
                animation: rippleExpand 0.6s ease-out;
            }
            
            .theme-rotating {
                animation: rotate 0.6s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            @keyframes rotate {
                0% { transform: rotate(0deg) scale(1); }
                50% { transform: rotate(180deg) scale(1.2); }
                100% { transform: rotate(360deg) scale(1); }
            }
        `;
        document.head.appendChild(style);
        
        return () => {
            if (document.head.contains(style)) {
                document.head.removeChild(style);
            }
        };
    });
</script>

<div class="bottom-nav" class:animating={isAnimating}>
    <div class="nav-container" style="
    --nav-bg: {$themeStore.theme === 'light' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(15, 23, 42, 0.95)'};
    --nav-border: {$themeStore.theme === 'light' ? 'rgba(203, 213, 225, 0.6)' : 'rgba(71, 85, 105, 0.6)'};
    --shadow-1: {$themeStore.theme === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(0, 0, 0, 0.4)'};
    --shadow-2: {$themeStore.theme === 'light' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(0, 0, 0, 0.2)'};
    --shadow-3: {$themeStore.theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.05)'};
    --gradient-color: {$themeStore.theme === 'light' ? 'linear-gradient(90deg, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1))' : 'linear-gradient(90deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1))'};
    --primary-color: {$themeStore.colors.primary};
    --primary-opacity-40: {$themeStore.colors.primary}40;
    --primary-opacity-10: {$themeStore.colors.primary}1a;
    --icon-filter: {$themeStore.theme === 'light' ? 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))' : 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))'};
    --icon-active-filter: {$themeStore.theme === 'light' ? 'drop-shadow(0 2px 8px rgba(99, 102, 241, 0.4))' : 'drop-shadow(0 2px 8px rgba(129, 140, 248, 0.6))'};
    --label-color: {$themeStore.theme === 'light' ? '#6b7280' : '#9ca3af'};
    --theme-toggle-bg: {$themeStore.theme === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)'};
    --theme-toggle-hover: {$themeStore.theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'};
    --theme-toggle-icon-filter: {$themeStore.theme === 'light' ? 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2))' : 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.4))'};
    --theme-toggle-text: {$themeStore.theme === 'light' ? '#374151' : '#e5e7eb'};
    --indicator-primary: {$themeStore.colors.primary};
    --indicator-secondary: {$themeStore.colors.secondary || $themeStore.colors.primary};
    ">
        <!-- Background Effects -->
        <div class="nav-bg-effect"></div>
        <div class="nav-glow"></div>
        
        <!-- Navigation Items -->
        {#each navItems as item (item.id)}
            {@const active = currentPath === item.href}
            <button
                class="nav-item"
                class:active={active}
                on:click={(e) => {
                    createRipple(e, e.currentTarget);
                    navigateTo(item.href);
                }}
                aria-label={item.label}
                aria-current={active ? 'page' : undefined}
            >
                <div class="nav-content">
                    <div class="nav-icon-wrapper">
                        <span class="nav-icon" class:icon-active={active}>
                            {item.icon}
                        </span>
                        {#if active}
                            <div class="nav-ripple-effect"></div>
                        {/if}
                        {#if item.badge && item.badge > 0}
                            <span class="nav-badge">{item.badge}</span>
                        {/if}
                    </div>
                    <span class="nav-label" class:label-active={active}>
                        {item.label}
                    </span>
                </div>
            </button>
        {/each}

        <!-- Theme Toggle Button -->
        <button
            class="theme-toggle-btn"
            on:click={handleThemeToggle}
            aria-label="Toggle theme"
        >
            <div class="theme-content">
                <div class="theme-icon-wrapper">
                    <span class="theme-icon">
                        {$themeStore.theme === 'light' ? '🌙' : '☀️'}
                    </span>
                    <div class="theme-glow-effect"></div>
                </div>
                <span class="theme-label">
                    {$themeStore.theme === 'light' ? 'Dark' : 'Light'}
                </span>
            </div>
        </button>
    </div>
    
    <!-- Floating Indicator -->
    <div class="nav-indicator" style="transform: translateX({navItems.findIndex(item => item.href === currentPath) * 100}%)"></div>
</div>

<style>
    .bottom-nav {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 1000;
        height: 80px;
        background: transparent;
        pointer-events: none;
        animation: slideUp 0.5s ease-out;
    }
    
    .bottom-nav.animating {
        pointer-events: none;
    }
    
    .nav-container {
        position: absolute;
        bottom: 12px;
        left: 50%;
        transform: translateX(-50%);
        width: min(90%, 400px);
        height: 68px;
        background: var(--nav-bg);
        backdrop-filter: blur(24px);
        -webkit-backdrop-filter: blur(24px);
        border: 1px solid var(--nav-border);
        border-radius: 24px;
        box-shadow: 
            0 20px 40px var(--shadow-1),
            0 8px 16px var(--shadow-2),
            inset 0 1px 0 var(--shadow-3);
        display: flex;
        align-items: center;
        justify-content: space-around;
        padding: 0 16px;
        gap: 4px;
        pointer-events: auto;
        overflow: hidden;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .nav-bg-effect {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 1px;
        background: linear-gradient(
            90deg,
            transparent,
            var(--primary-opacity-40),
            transparent
        );
        opacity: 0.8;
    }
    
    .nav-glow {
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: radial-gradient(
            circle,
            var(--primary-opacity-10) 0%,
            transparent 70%
        );
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
    }
    
    .nav-container:hover .nav-glow {
        opacity: 1;
    }
    
    .nav-item {
        position: relative;
        flex: 1;
        height: 100%;
        background: transparent;
        border: none;
        border-radius: 18px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        overflow: hidden;
    }
    
    .nav-item:hover {
        transform: translateY(-2px);
    }
    
    .nav-item.active {
        background: var(--primary-opacity-10);
        transform: translateY(-2px);
    }
    
    .nav-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 2px;
        padding: 8px;
        position: relative;
        z-index: 2;
    }
    
    .nav-icon-wrapper {
        position: relative;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .nav-icon {
        font-size: 20px;
        line-height: 1;
        display: block;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        filter: var(--icon-filter);
    }
    
    .nav-icon.icon-active {
        transform: scale(1.15);
        filter: var(--icon-active-filter);
        animation: float 3s ease-in-out infinite;
    }
    
    .nav-ripple-effect {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: var(--primary-opacity-10);
        animation: glow 2s ease-in-out infinite;
    }
    
    .nav-badge {
        position: absolute;
        top: -4px;
        right: -4px;
        min-width: 16px;
        height: 16px;
        background: var(--primary-opacity-10);
        color: white;
        border-radius: 8px;
        font-size: 10px;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 4px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        animation: pulse 2s ease-in-out infinite;
    }
    
    .nav-label {
        font-size: 10px;
        font-weight: 500;
        color: var(--label-color);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        text-align: center;
        line-height: 1;
    }
    
    .nav-label.label-active {
        color: var(--primary-color);
        font-weight: 600;
    }
    
    .theme-toggle-btn {
        position: relative;
        flex: 1;
        height: 100%;
        background: transparent;
        border: none;
        border-radius: 18px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        overflow: hidden;
    }
    
    .theme-toggle-btn:hover {
        transform: translateY(-2px);
    }
    
    .theme-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 2px;
        padding: 8px;
        position: relative;
        z-index: 2;
    }
    
    .theme-icon-wrapper {
        position: relative;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .theme-icon {
        font-size: 20px;
        line-height: 1;
        display: block;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        filter: var(--theme-toggle-icon-filter);
    }
    
    .theme-glow-effect {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: var(--theme-toggle-bg);
        opacity: 0;
        transition: opacity 0.3s ease;
    }
    
    .theme-toggle-btn:hover .theme-glow-effect {
        opacity: 1;
        animation: glow 2s ease-in-out infinite;
    }
    
    .theme-label {
        font-size: 10px;
        font-weight: 500;
        color: var(--theme-toggle-text);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        text-align: center;
        line-height: 1;
    }
    
.nav-indicator {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 25%;
    height: 3px;
    background: linear-gradient(90deg, var(--indicator-primary), var(--indicator-secondary));
    border-radius: 3px 3px 0 0;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 0 10px var(--indicator-primary);
}
    
    @keyframes pulse {
        0%, 100% {
            transform: scale(1);
            opacity: 1;
        }
        50% {
            transform: scale(1.1);
            opacity: 0.8;
        }
    }
    
    @media (max-width: 380px) {
        .nav-container {
            width: 95%;
            height: 64px;
            bottom: 8px;
        }
        
        .nav-icon, .theme-icon {
            font-size: 18px;
        }
        
        .nav-label, .theme-label {
            font-size: 9px;
        }
    }
    
    @media (min-width: 768px) {
        .nav-container {
            width: 420px;
            height: 72px;
        }
    }
</style>
