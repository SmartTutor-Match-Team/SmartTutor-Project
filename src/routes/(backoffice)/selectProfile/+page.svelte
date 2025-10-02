<script lang="ts">
	import { goto } from '$app/navigation';
    import swal from 'sweetalert2';
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
            swal.fire({
                title: 'Profile Selected',
                icon: 'success',
                confirmButtonText: 'OK',
                timer: 1000
            });
            goto('/main');
        } catch (error) {
            console.error('Error selecting profile:', error);
        }
    };
</script>

<div class="mb-4">
    <h1 class="text-5xl font-bold text-center mb-8">Select Profile</h1>
    <div class="flex justify-end mr-32 gap-4">
        <a href="/createProfile" class="rounded-3xl border-1 border-[#081F5C5A] bg-[#0000005A] px-10 py-2 font-bold inset-shadow-[0px_0px_10px_2px_#e3e3e3be] transition-colors hover:bg-[#000000a5] text-white">CREATE NEW PROFILE</a>
        <a href="/auth/login" class="rounded-3xl border-1 border-[#081F5C5A] bg-[#0000005A] px-10 py-2 font-bold inset-shadow-[0px_0px_10px_2px_#e3e3e3be] transition-colors hover:bg-[#000000a5] text-white">LOGOUT</a>
    </div>
    <div class="container mx-auto p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {#each data.profiles as profile}
        <div class="mb-6 rounded-3xl border-1 border-[#334EAC59] bg-[#334EAC59] p-6 inset-shadow-[0px_0px_5px_8px_#d0d7f1]">
            <div class="mb-4 space-y-2 text-2xl">
            <h3><strong>Subject:</strong> {profile.subject}</h3>
            <p><strong>Hourly Rate:</strong> {profile.hourlyRate}</p>
            <p><strong>Bio:</strong> {profile.bio}</p>
            <div class="flex justify-center">
            {#if profile.profileImageUrl}
                <!-- svelte-ignore a11y_img_redundant_alt -->
                <img src={profile.profileImageUrl} alt="Profile Image" class="h-56 rounded-2xl"/>
            {/if}
            </div>
            </div>
            <div class="flex justify-end">
            <button class="mt-4 px-4 py-2 rounded-4xl border-1 border-[#E7F1FF5A] inset-shadow-[1px_2px_5px_2px_#ffffff] hover:bg-[#E7F1FF5A] hover:text-[#334EAC] transition-colors font-bold text-xl" onclick={() => handleSelect(profile.id)}>SELECT</button>
            </div>
        </div>
    {/each}
    </div>
</div>