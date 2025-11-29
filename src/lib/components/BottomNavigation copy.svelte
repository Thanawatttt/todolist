<script lang="ts">
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { themeStore } from '$lib/theme';
    import { onMount } from 'svelte';
    
    interface NavItem {
        id: string;
        label: string;
        icon: string;
        href: string;
    }

    const navItems: NavItem[] = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊', href: '/dashboard' },
        { id: 'settings', label: 'Settings', icon: '⚙️', href: '/settings' },
    ];

    let rippleElements: Map<HTMLElement, HTMLElement> = new Map();

    function getNavItemStyles(active: boolean): string {
        const styles = {
            '--ripple-color': $themeStore.theme === 'light' 
                ? 'rgba(79, 70, 229, 0.15)' 
                : 'rgba(129, 140, 248, 0.25)',
            '--hover-bg': $themeStore.theme === 'light'
                ? 'rgba(79, 70, 229, 0.08)'
                : 'rgba(129, 140, 248, 0.15)',
            '--active-bg': $themeStore.theme === 'light'
                ? 'rgba(79, 70, 229, 0.12)'
                : 'rgba(129, 140, 248, 0.2)',
            '--active-color': $themeStore.colors.primary,
            '--inactive-color': $themeStore.theme === 'light' 
                ? $themeStore.colors.textSecondary 
                : $themeStore.colors.textLightSecondary
        };
        return Object.entries(styles).map(([key, value]) => `${key}: ${value}`).join('; ');
    }

    function createRipple(event: MouseEvent, element: HTMLElement) {
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        const ripple = document.createElement('span');
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: var(--ripple-color);
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            pointer-events: none;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
        `;
        
        element.appendChild(ripple);
        rippleElements.set(element, ripple);
        
        setTimeout(() => {
            if (element.contains(ripple)) {
                element.removeChild(ripple);
                rippleElements.delete(element);
            }
        }, 600);
    }

    function handleThemeToggle() {
        themeStore.toggle();
    }

    onMount(() => {
        // Add ripple animation keyframes
        const style = document.createElement('style');
        style.textContent = `
            @keyframes ripple {
                0% {
                    transform: scale(0);
                    opacity: 1;
                }
                100% {
                    transform: scale(2);
                    opacity: 0;
                }
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

<nav class="navbar" style="
    --bottom-nav-bg: {$themeStore.colors.bottomNav};
    --nav-border: {$themeStore.colors.navBorder};
    --nav-shadow: {$themeStore.colors.navShadow};
    --primary-color: {$themeStore.colors.primary}20;
    --icon-shadow: {$themeStore.theme === 'light' 
        ? 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))' 
        : 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))'};
    --active-icon-shadow: {$themeStore.theme === 'light' 
        ? 'drop-shadow(0 2px 4px rgba(79, 70, 229, 0.3))' 
        : 'drop-shadow(0 2px 4px rgba(129, 140, 248, 0.4))'};
">
    <div class="navbar-container">
        {#each navItems as item (item.id)}
            {@const active = $page.url.pathname === item.href}
            <a
                href={item.href}
                class="nav-item {active ? 'active' : ''}"
                style={getNavItemStyles(active)}
                on:click|preventDefault={(e) => {
                    createRipple(e, e.currentTarget);
                    if ($page.url.pathname !== item.href) {
                        goto(item.href);
                    }
                }}
            >
                <div class="nav-icon">
                    <span class="icon-emoji">{item.icon}</span>
                    {#if active}
                        <div class="active-indicator"></div>
                    {/if}
                </div>
                <span class="nav-label">{item.label}</span>
            </a>
        {/each}

        <button
            class="theme-toggle"
            on:click={handleThemeToggle}
            aria-label="Toggle theme"
        >
            <div class="theme-icon">
                <span class="icon-emoji">
                    {$themeStore.theme === 'light' ? '🌙' : '☀️'}
                </span>
            </div>
            <span class="theme-label">
                {$themeStore.theme === 'light' ? 'Dark' : 'Light'}
            </span>
        </button>
    </div>
</nav>

<style>
    :global(.navbar) {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 1000;
        padding: 0;
        background: transparent;
        pointer-events: none;
    }
    
    :global(.navbar-container) {
        background: var(--bottom-nav-bg);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid var(--nav-border);
        border-bottom: none;
        box-shadow: var(--nav-shadow);
        margin: 0 16px;
        border-radius: 24px 24px 0 0;
        padding: 12px 16px;
        display: flex;
        justify-content: space-around;
        align-items: center;
        gap: 4px;
        min-height: 70px;
        pointer-events: auto;
        position: relative;
        overflow: hidden;
    }
    
    :global(.navbar-container)::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 1px;
        background: linear-gradient(
            90deg,
            transparent,
            var(--primary-color),
            transparent
        );
        opacity: 0.6;
    }
    
    :global(.nav-item) {
        position: relative;
        overflow: hidden;
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 10px 8px;
        border-radius: 16px;
        text-decoration: none;
        font-size: 11px;
        font-weight: 500;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        cursor: pointer;
        color: var(--inactive-color);
        min-width: 0;
    }
    
    :global(.nav-item):hover {
        background: var(--hover-bg);
        transform: translateY(-2px);
    }
    
    :global(.nav-item.active) {
        color: var(--active-color);
        font-weight: 600;
        background: var(--active-bg);
    }
    
    :global(.nav-item.active):hover {
        transform: translateY(-2px) scale(1.02);
    }
    
    :global(.nav-icon) {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        margin-bottom: 4px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    :global(.nav-item.active .nav-icon) {
        transform: scale(1.1);
    }
    
    :global(.icon-emoji) {
        font-size: 20px;
        line-height: 1;
        display: block;
        filter: var(--icon-shadow);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    :global(.nav-item.active .icon-emoji) {
        filter: var(--active-icon-shadow);
    }
    
    :global(.active-indicator) {
        position: absolute;
        bottom: -2px;
        left: 50%;
        transform: translateX(-50%);
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--active-color);
        box-shadow: 0 0 8px var(--active-color);
        animation: pulse 2s infinite;
    }
    
    :global(.nav-label) {
        font-size: 11px;
        font-weight: 500;
        text-align: center;
        line-height: 1.2;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    :global(.theme-toggle) {
        background: transparent;
        border: none;
        padding: 10px 8px;
        border-radius: 16px;
        color: var(--inactive-color);
        font-size: 11px;
        font-weight: 500;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        min-width: 0;
        position: relative;
        overflow: hidden;
    }
    
    :global(.theme-toggle):hover {
        background: var(--hover-bg);
        transform: translateY(-2px);
    }
    
    :global(.theme-toggle):active {
        transform: translateY(-2px) scale(0.96);
    }
    
    :global(.theme-icon) {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    :global(.theme-icon .icon-emoji) {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    :global(.theme-toggle):hover .theme-icon {
        transform: rotate(15deg) scale(1.1);
    }
    
    :global(.theme-label) {
        font-size: 11px;
        font-weight: 500;
        text-align: center;
        line-height: 1.2;
    }
    
    @keyframes pulse {
        0%, 100% {
            opacity: 1;
            transform: translateX(-50%) scale(1);
        }
        50% {
            opacity: 0.7;
            transform: translateX(-50%) scale(1.2);
        }
    }
    
    @media (min-width: 768px) {
        :global(.navbar-container) {
            max-width: 420px;
            margin: 0 auto;
            left: 50%;
            transform: translateX(-50%);
            border-radius: 24px 24px 0 0;
            padding: 14px 20px;
        }
        
        :global(.nav-item) {
            padding: 12px 10px;
        }
        
        :global(.theme-toggle) {
            padding: 12px 10px;
        }
    }
    
    @media (max-width: 380px) {
        :global(.navbar-container) {
            margin: 0 8px;
            padding: 10px 12px;
        }
        
        :global(.nav-item) {
            padding: 8px 6px;
        }
        
        :global(.nav-label), :global(.theme-label) {
            font-size: 10px;
        }
    }
</style>