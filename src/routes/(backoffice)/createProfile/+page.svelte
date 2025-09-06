<script lang="ts">
	import { goto } from '$app/navigation';

	let fileInput: HTMLInputElement;
	let successMessage = $state('');
	let errorMessage = $state('');

	const { data } = $props();
	let bio = $state('');
	let subject = $state('');
	let hourlyRate = $state('');
	let profileImageUrl = $state('');

	let subjects = $state(['MATH', 'SCIENCE', 'ENGLISH', 'HISTORY', 'GEOGRAPHY']);

	const handleSubmit = async () => {
		if (!fileInput.files || fileInput.files.length === 0) {
			errorMessage = 'Please select a file to upload.';
			return;
		}

		const file = fileInput.files[0];

		const formData = new FormData();
        formData.append('userId', data.users.id);
		formData.append('bio', bio);
		formData.append('subject', subject);
		formData.append('hourlyRate', hourlyRate.toString());
		formData.append('image', file);

		try {
			const response = await fetch('/createProfile', {
				method: 'POST',
				body: formData
			});

			const result = await response.json();

			if (response.ok) {
				profileImageUrl = result.data.url;
				successMessage = 'Upload successful!';
                setTimeout(() => {
                    goto('/overview');
                }, 1500);
			} else {
				errorMessage = `Upload failed: ${result.message}`;
			}
		} catch (error) {
			errorMessage = 'An error occurred during upload.';
		}
	};
</script>

<!-- create Tutor Profile -->
<div
	class="mx-auto mt-26 max-w-md rounded-3xl border-1 border-[#334EAC59] bg-[#334EAC59] p-6 inset-shadow-[0px_0px_5px_8px_#d0d7f1]"
>
	<h1 class="mb-6 text-center text-2xl font-bold">Create Tutor Profile</h1>
	{#if successMessage}
		<p class="mb-4 rounded bg-green-100 p-2 text-green-700">{successMessage}</p>
	{/if}
	{#if errorMessage}
		<p class="mb-4 rounded bg-red-100 p-2 text-red-700">{errorMessage}</p>
	{/if}
	<div class="mb-4">
		<label for="bio" class="mb-1 block font-medium">Bio</label>
		<textarea
			id="bio"
			class="w-full rounded-2xl border-1 border-[#334EAC59] bg-[#E7F1FF11] p-2 inset-shadow-[1px_2px_5px_2px_#ffffff]"
			bind:value={bio}
			placeholder="Enter your bio"
		></textarea>
	</div>
	<div class="mb-4">
		<label for="subject" class="mb-1 block font-medium">Subject</label>
		<select
			id="subject"
			class="w-full rounded-2xl border-1 border-[#334EAC59] bg-[#E7F1FF11] p-2 inset-shadow-[1px_2px_5px_2px_#ffffff]"
			bind:value={subject}
		>
			<option value="" disabled selected>Select a subject</option>
			{#each subjects as subj}
				<option value={subj}>{subj}</option>
			{/each}
		</select>
	</div>
	<div class="mb-4">
		<label for="hourlyRate" class="mb-1 block font-medium">Hourly Rate</label>
		<input
			id="hourlyRate"
			type="number"
			class="w-full rounded-2xl border-1 border-[#334EAC59] bg-[#E7F1FF11] p-2 inset-shadow-[1px_2px_5px_2px_#ffffff]"
			bind:value={hourlyRate}
			placeholder="Enter your hourly rate"
		/>
	</div>
	<div class="mb-4">
		<label for="profileImageUrl" class="mb-1 block font-medium">Profile Image</label>
		<input
			type="file"
			id="profileImageUrl"
			class="w-full rounded-2xl border-1 border-[#334EAC59] bg-[#E7F1FF11] p-2 inset-shadow-[1px_2px_5px_2px_#ffffff]"
			bind:this={fileInput}
		/>
	</div>
	<div class="text-center">
		<button
			type="submit"
			class="rounded-3xl border-1 border-[#334EAC59] bg-[#E7F1FF11] px-10 py-2 font-bold inset-shadow-[1px_2px_5px_2px_#ffffff] transition-colors hover:bg-blue-100"
			onclick={handleSubmit}>Create Profile</button
		>
	</div>
</div>
