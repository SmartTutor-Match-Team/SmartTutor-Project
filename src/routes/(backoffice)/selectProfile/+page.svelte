<script lang="ts">
    const { data } = $props();

    let message = $state('');

    const handleSelect = async (profileId: string) => {
        try {
            const response = await fetch('/api/selectProfile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ profileId })
            });

            if (!response.ok) {
                throw new Error('Failed to select profile');
            }

            const dat = await response.json();
            message = dat.message;
        } catch (error) {
            console.error('Error selecting profile:', error);
        }
    };
</script>

{#if message}
    <p>{message}</p>
{/if}

{#each data.profiles as profile}
    <div class="mb-6 rounded-3xl border-1 border-[#334EAC59] bg-[#334EAC59] p-6 inset-shadow-[0px_0px_5px_8px_#d0d7f1]">
        <h3>{profile.subject}</h3>
        <p><strong>Hourly Rate:</strong> {profile.hourlyRate}</p>
        {#if profile.profileImageUrl}
            <!-- svelte-ignore a11y_img_redundant_alt -->
            <img src={profile.profileImageUrl} alt="Profile Image" class="h-40"/>
        {/if}
        <button class="mt-4 rounded-full bg-[#334EAC] px-4 py-2 text-white" onclick={() => handleSelect(profile.id)}>select</button>
    </div>
{/each}