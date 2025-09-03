<script lang="ts">
    import { User, Lock, Mail, KeyRound, Group } from '@lucide/svelte';
	import { goto } from '$app/navigation';

	// export let form;

	let name = $state('');
	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let role = $state('STUDENT');

	let errorMessage = $state('');
	let successMessage = $state('');

	async function handleRegister() {
		errorMessage = '';
		successMessage = '';

        if (password !== confirmPassword) {
            errorMessage = 'Passwords do not match';
            return;
        }

		try {
			const res = await fetch('/api/auth/register', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ name, email, password, role })
			});

			const data = await res.json();

			if (!res.ok) {
				errorMessage = data.message || 'Registration failed';
				return;
			}

			successMessage = 'Registration successful! Redirecting...';
			setTimeout(() => {
				goto('/auth/login');
			}, 1500);
		} catch (err) {
			errorMessage = 'Something went wrong. Please try again.';
		}
	}
</script>

<div
	class="mx-auto mt-10 max-w-md p-6 rounded-3xl border-1 border-[#334EAC59] bg-[#334EAC59] inset-shadow-[0px_0px_5px_8px_#d0d7f1]">
    <img src="/Logo.svg" alt="logo-Smart Tutor" class="mx-auto mb-4 w-28 h-28"/>
	<h1 class="mb-6 text-2xl font-bold text-center">SMART TUTOR</h1>

	{#if errorMessage}
		<div class="mb-4 rounded bg-red-100 p-2 text-red-700">
			{errorMessage}
		</div>
	{/if}

	{#if successMessage}
		<div class="mb-4 rounded bg-green-100 p-2 text-green-700">
			{successMessage}
		</div>
	{/if}

	<!-- <form method="POST" class="space-y-3"> -->
	<div class="mb-4">
		<label for="name" class="mb-1 block font-medium">Name</label>
        <User class="absolute mt-2 ml-3"/>
		<input
			id="name"
			name="name"
			type="text"
			bind:value={name}
			class="w-full rounded-2xl p-2 border-1 border-[#334EAC59] bg-[#E7F1FF11] inset-shadow-[1px_2px_5px_2px_#ffffff] pl-10"
			placeholder="Your name"
			autocomplete="given-name"
			required
		/>
	</div>

	<div class="mb-4">
		<label for="email" class="mb-1 block font-medium">Email</label>
        <Mail class="absolute mt-2 ml-3"/>
		<input
			id="email"
			name="email"
			type="email"
			bind:value={email}
			class="w-full rounded-2xl p-2 border-1 border-[#334EAC59] bg-[#E7F1FF11] inset-shadow-[1px_2px_5px_2px_#ffffff] pl-10"
			placeholder="you@example.com"
			autocomplete="email"
			required
		/>
	</div>

	<div class="mb-4">
		<label for="password" class="mb-1 block font-medium">Password</label>
        <KeyRound class="absolute mt-2 ml-3"/>
		<input
			id="password"
			name="password"
			type="password"
			bind:value={password}
			class="w-full rounded-2xl p-2 border-1 border-[#334EAC59] bg-[#E7F1FF11] inset-shadow-[1px_2px_5px_2px_#ffffff] pl-10"
			placeholder="password"
			autocomplete="off"
			required
		/>
	</div>

    <!-- confirm password -->
    <div class="mb-4">
		<label for="confirm-password" class="mb-1 block font-medium">Confirm Password</label>
        <Lock class="absolute mt-2 ml-3"/>
		<input
			id="confirm-password"
			name="confirm-password"
			type="password"
			bind:value={confirmPassword}
			class="w-full rounded-2xl p-2 border-1 border-[#334EAC59] bg-[#E7F1FF11] inset-shadow-[1px_2px_5px_2px_#ffffff] pl-10"
			placeholder="Confirm password"
			autocomplete="off"
			required
		/>
	</div>

	<div class="mb-4">
		<label for="role" class="mb-1 block font-medium">Role</label>
        <Group class="absolute mt-2 ml-3"/>
		<select id="role" bind:value={role} class="w-full rounded-2xl p-2 border-1 border-[#334EAC59] bg-[#E7F1FF11] inset-shadow-[1px_2px_5px_2px_#ffffff] pl-10">
			<option value="STUDENT">Student</option>
			<option value="TUTOR">Tutor</option>
		</select>
        <p class="mt-4 text-sm text-[#334EAC] text-end">
			Already have an account? <a href="/auth/login" class="text-blue-500 hover:underline"
				>Sign In</a
			>
		</p>
	</div>

	<div class="text-center">
		<button
			onclick={handleRegister}
			class="px-10 rounded-3xl py-2 font-bold border-1 border-[#334EAC59] bg-[#E7F1FF11] inset-shadow-[1px_2px_5px_2px_#ffffff] hover:bg-blue-100 transition-colors"
		>
			REGISTER
		</button>
	</div>
	<!-- </form> -->
</div>
