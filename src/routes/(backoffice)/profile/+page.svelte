<script lang="ts">
    const { data } = $props();
</script>

<!-- profile -->
<div>
    <h2>Profile</h2>
    {#if data.profile}
        <p><strong>Name:</strong> {data.users.name}</p>
        <p><strong>Email:</strong> {data.users.email}</p>
        <p><strong>Bio:</strong> {data.profile.bio}</p>
        <p><strong>Subject:</strong> {data.profile.subject}</p>
        <p><strong>Hourly Rate:</strong> {data.profile.hourlyRate}</p>
        {#if data.profile.profileImageUrl}
            <!-- svelte-ignore a11y_img_redundant_alt -->
            <img src={data.profile.profileImageUrl} alt="Profile Image"  class="h-40"/>
        {/if}
    {:else}
        <p>No profile found.</p>
    {/if}
</div>