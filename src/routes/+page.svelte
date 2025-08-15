<script lang="ts">
    import { goto } from '$app/navigation';
    const { data } = $props();
    let successMessage = $state("");

    const handleLogout = async () => {
        successMessage = '';
        try {
            const res = await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });

            if (res.ok) {
                successMessage = 'Logout successful! Redirecting...';
                setTimeout(() => {
                    goto('/auth/login');
                }, 1500);
            }
        } catch {
            console.error('Logout failed');
        }
    }
</script>

svelte+prisma

<br>

Hello {data.users.name}!

<button onclick={handleLogout}>logout</button>

{#if successMessage}
    <p>{successMessage}</p>
{/if}