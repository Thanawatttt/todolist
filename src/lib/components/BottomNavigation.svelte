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
        { id: 'dashboard', label: 'Home', icon: '🏠', href: '/dashboard' },
        { id: 'tasks', label: 'Tasks', icon: '📝', href: '/tasks' },
        { id: 'settings', label: 'Settings', icon: '⚙️', href: '/settings' },
        { id: 'profile', label: 'Profile', icon: '👤', href: '/profile' },
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
                    transform: translateY(100%) scale(0.95);
                    opacity: 0;
                }
                100% {
                    transform: translateY(0) scale(1);
                    opacity: 1;
                }
            }
            
            @keyframes glow {
                0%, 100% {
                    box-shadow: 0 0 15px rgba(99, 102, 241, 0.2);
                }
                50% {
                    box-shadow: 0 0 25px rgba(99, 102, 241, 0.4);
                }
            }
            
            @keyframes float {
                0%, 100% {
                    transform: translateY(0) scale(1);
                }
                50% {
                    transform: translateY(-2px) scale(1.05);
                }
            }
            
            @keyframes dropdownSlideUp {
                0% {
                    transform: translateY(15px) scale(0.9);
                    opacity: 0;
                }
                100% {
                    transform: translateY(0) scale(1);
                    opacity: 1;
                }
            }
            
            @keyframes fadeIn {
                0% {
                    opacity: 0;
                }
                100% {
                    opacity: 1;
                }
            }
            
            @keyframes shimmer {
                0% {
                    background-position: -100% center;
                }
                100% {
                    background-position: 100% center;
                }
            }
            
            @keyframes pulse-glow {
                0%, 100% {
                    box-shadow: 0 0 15px rgba(99, 102, 241, 0.3);
                }
                50% {
                    box-shadow: 0 0 25px rgba(99, 102, 241, 0.6);
                }
            }
            
            @keyframes aurora {
                0% {
                    background-position: 0% 50%;
                }
                50% {
                    background-position: 100% 50%;
                }
                100% {
                    background-position: 0% 50%;
                }
            }
            
            @keyframes slideIn {
                0% {
                    transform: translateX(-10px);
                    opacity: 0;
                }
                100% {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes bounce {
                0%, 100% {
                    transform: translateY(0);
                }
                25% {
                    transform: translateY(-8px);
                }
                50% {
                    transform: translateY(-4px);
                }
                75% {
                    transform: translateY(-6px);
                }
            }
            
            @keyframes float-bubble {
                0%, 100% {
                    transform: translateY(0) rotate(0deg);
                }
                33% {
                    transform: translateY(-10px) rotate(120deg);
                }
                66% {
                    transform: translateY(5px) rotate(240deg);
                }
            }
            
            @keyframes neon-pulse {
                0%, 100% {
                    filter: brightness(1) drop-shadow(0 0 10px rgba(99, 102, 241, 0.8));
                }
                50% {
                    filter: brightness(1.2) drop-shadow(0 0 20px rgba(99, 102, 241, 1));
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
    --nav-bg: {$themeStore.theme === 'light' 
        ? 'rgba(255, 255, 255, 0.85)' 
        : 'rgba(17, 24, 39, 0.85)'};
    --nav-border: {$themeStore.theme === 'light' 
        ? 'rgba(229, 231, 235, 0.3)' 
        : 'rgba(75, 85, 99, 0.3)'};
    --shadow-1: {$themeStore.theme === 'light' 
        ? 'rgba(0, 0, 0, 0.05)' 
        : 'rgba(0, 0, 0, 0.3)'};
    --shadow-2: {$themeStore.theme === 'light' 
        ? 'rgba(0, 0, 0, 0.03)' 
        : 'rgba(0, 0, 0, 0.15)'};
    --shadow-3: {$themeStore.theme === 'light' 
        ? 'rgba(255, 255, 255, 0.9)' 
        : 'rgba(255, 255, 255, 0.08)'};
    --gradient-color: {$themeStore.theme === 'light' 
        ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(168, 85, 247, 0.05))' 
        : 'linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(168, 85, 247, 0.08))'};
    --primary-color: {$themeStore.colors.primary};
    --primary-opacity-40: {$themeStore.colors.primary}40;
    --primary-opacity-10: {$themeStore.colors.primary}1a;
    --icon-filter: {$themeStore.theme === 'light' 
        ? 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.08))' 
        : 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2))'};
    --icon-active-filter: {$themeStore.theme === 'light' 
        ? 'drop-shadow(0 2px 6px rgba(99, 102, 241, 0.3))' 
        : 'drop-shadow(0 2px 6px rgba(129, 140, 248, 0.5))'};
    --label-color: {$themeStore.theme === 'light' ? '#6b7280' : '#e5e7eb'};
    --theme-toggle-bg: {$themeStore.theme === 'light' 
        ? 'rgba(0, 0, 0, 0.03)' 
        : 'rgba(255, 255, 255, 0.03)'};
    --theme-toggle-hover: {$themeStore.theme === 'light' 
        ? 'rgba(0, 0, 0, 0.08)' 
        : 'rgba(255, 255, 255, 0.08)'};
    --theme-toggle-icon-filter: {$themeStore.theme === 'light' 
        ? 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.15))' 
        : 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))'};
    --theme-toggle-text: {$themeStore.theme === 'light' ? '#374151' : '#e5e7eb'};
    --indicator-primary: {$themeStore.colors.primary};
    --indicator-secondary: {$themeStore.colors.secondary || $themeStore.colors.primary};
    ">
        <!-- Modern Background Effects -->
        <div class="nav-bg-effect"></div>
        <div class="nav-glow"></div>
        <div class="nav-shimmer"></div>
        
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
    </div>
    
    <!-- Modern Navigation Indicator -->
    <div class="nav-indicator">
        <div class="indicator-dot" style="transform: translateX({navItems.findIndex(item => item.href === currentPath) * 25}%)"></div>
    </div>
</div>

<style>
    .bottom-nav {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 1000;
        height: 85px;
        background: transparent;
        pointer-events: none;
        animation: slideUp 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }
    
    .bottom-nav.animating {
        pointer-events: none;
    }
    
    .nav-container {
        position: fixed;
        bottom: 12px;
        left: 50%;
        transform: translateX(-50%);
        width: min(90%, 420px);
        height: 70px;
        background: var(--nav-bg);
        backdrop-filter: blur(20px) saturate(180%);
        -webkit-backdrop-filter: blur(20px) saturate(180%);
        border: 1px solid var(--nav-border);
        border-radius: 24px;
        box-shadow: 
            0 8px 32px var(--shadow-1),
            0 2px 8px var(--shadow-2),
            inset 0 1px 0 var(--shadow-3);
        display: flex;
        align-items: center;
        justify-content: space-around;
        padding: 0 24px;
        pointer-events: auto;
        z-index: 100;
        overflow: hidden;
    }
    
    /* Modern Background Effects */
    .nav-bg-effect {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: var(--gradient-color);
        opacity: 0.6;
        z-index: 0;
    }
    
    .nav-glow {
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: radial-gradient(
            circle at center,
            var(--primary-opacity-10) 0%,
            transparent 70%
        );
        opacity: 0;
        transition: opacity 0.3s ease;
        z-index: 1;
        pointer-events: none;
    }
    
    .nav-shimmer {
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.1) 50%,
            transparent 100%
        );
        animation: shimmer 3s ease-in-out infinite;
        z-index: 2;
        pointer-events: none;
    }
    
    .nav-container:hover .nav-glow {
        opacity: 1;
        animation: pulse-glow 4s ease-in-out infinite;
    }
    
    .nav-item {
        position: relative;
        flex: 1;
        height: 100%;
        background: transparent;
        border: none;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        padding: 10px 6px;
        max-width: 90px;
        border-radius: 16px;
        z-index: 10;
    }
    
    .nav-item::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0);
        width: 50px;
        height: 50px;
        background: radial-gradient(
            circle,
            var(--primary-opacity-10) 0%,
            transparent 70%
        );
        border-radius: 50%;
        transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        z-index: -1;
    }
    
    .nav-item:hover::before {
        transform: translate(-50%, -50%) scale(1);
    }
    
    .nav-item.active {
        background: var(--primary-opacity-10);
        transform: scale(1.05);
    }
    
    .nav-item.active::before {
        transform: translate(-50%, -50%) scale(1.2);
        background: radial-gradient(
            circle,
            var(--primary-opacity-20) 0%,
            var(--primary-opacity-10) 50%,
            transparent 70%
        );
    }
    
    .nav-item.active .nav-icon {
        color: var(--primary-color);
        transform: scale(1.1);
    }
    
    .nav-item.active .nav-label {
        color: var(--primary-color);
        font-weight: 600;
        transform: translateY(-1px);
    }
    
    .nav-item .nav-icon {
        color: var(--label-color);
        font-size: 22px;
        margin-bottom: 6px;
        transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        position: relative;
        z-index: 2;
    }
    
    .nav-item .nav-label {
        color: var(--label-color);
        font-size: 11px;
        font-weight: 500;
        transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        text-align: center;
        line-height: 1.2;
        position: relative;
        z-index: 2;
    }
    
    .nav-item:hover .nav-icon {
        color: var(--primary-color);
        transform: translateY(-2px) scale(1.05);
    }
    
    .nav-item:hover .nav-label {
        color: var(--primary-color);
        transform: translateY(-1px);
    }
    
    .nav-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
        padding: 8px;
        position: relative;
        z-index: 2;
    }
    
    .nav-icon-wrapper {
        position: relative;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .nav-icon {
        font-size: 22px;
        line-height: 1;
        display: block;
        transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        filter: var(--icon-filter);
    }
    
    .nav-icon.icon-active {
        transform: scale(1.15);
        filter: var(--icon-active-filter);
        animation: bounce 2s ease-in-out infinite;
    }
    
    .nav-ripple-effect {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 45px;
        height: 45px;
        border-radius: 50%;
        background: radial-gradient(
            circle,
            var(--primary-opacity-15) 0%,
            var(--primary-opacity-10) 50%,
            transparent 70%
        );
        animation: glow 3s ease-in-out infinite;
    }
    
    .nav-badge {
        position: absolute;
        top: -6px;
        right: -6px;
        min-width: 18px;
        height: 18px;
        background: linear-gradient(135deg, var(--primary-color), var(--indicator-secondary));
        color: white;
        border-radius: 10px;
        font-size: 10px;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 5px;
        box-shadow: 
            0 2px 8px rgba(99, 102, 241, 0.3),
            0 1px 3px rgba(0, 0, 0, 0.1);
        animation: bounce 2s ease-in-out infinite;
        z-index: 3;
        border: 1px solid rgba(255, 255, 255, 0.2);
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
        transform: translateY(-1px);
    }
    
    /* Modern Navigation Indicator */
    .nav-indicator {
        position: absolute;
        bottom: 12px;
        left: 50%;
        transform: translateX(-50%);
        width: min(90%, 420px);
        height: 4px;
        background: linear-gradient(
            90deg,
            var(--indicator-primary) 0%,
            var(--indicator-secondary) 100%
        );
        border-radius: 2px;
        overflow: hidden;
        pointer-events: none;
        z-index: 99;
    }
    
    .nav-indicator::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 25%;
        height: 100%;
        background: linear-gradient(
            90deg,
            var(--indicator-primary) 0%,
            var(--indicator-secondary) 100%
        );
        border-radius: 2px;
        transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        box-shadow: 0 0 12px var(--indicator-primary);
    }
    
    .indicator-dot {
        position: absolute;
        top: 0;
        left: 0;
        width: 25%;
        height: 100%;
        background: linear-gradient(
            90deg,
            var(--indicator-primary) 0%,
            var(--indicator-secondary) 100%
        );
        border-radius: 2px;
        transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        box-shadow: 0 0 12px var(--indicator-primary);
    }
    
    /* Responsive Design */
    @media (max-width: 380px) {
        .nav-container {
            width: 95%;
            height: 68px;
            bottom: 10px;
            padding: 0 20px;
        }
        
        .nav-icon {
            font-size: 20px;
        }
        
        .nav-label {
            font-size: 9px;
        }
        
        .nav-indicator {
            width: 95%;
        }
    }
    
    @media (min-width: 768px) {
        .nav-container {
            width: 420px;
            height: 72px;
            bottom: 16px;
        }
        
        .nav-indicator {
            width: 420px;
        }
    }
    
    /* Dark theme optimizations */
    @media (prefers-color-scheme: dark) {
        .nav-container {
            box-shadow: 
                0 8px 32px rgba(0, 0, 0, 0.4),
                0 2px 16px rgba(0, 0, 0, 0.2),
                inset 0 1px 0 rgba(255, 255, 255, 0.08);
        }
    }
</style>
