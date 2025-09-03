<script lang="ts">
    import { Mail, KeyRound } from '@lucide/svelte';
    import { goto } from "$app/navigation";
    let email = "";
    let password = "";
    let errorMessage = "";
    let successMessage = "";

    const handleLogin = async () => {
        errorMessage = "";
        successMessage = "";

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                errorMessage = data.message || "Login failed";
                return;
            }

            successMessage = "Login successful! Redirecting...";
            setTimeout(() => {
                goto("/");
            }, 1500);
        } catch (err) {
            errorMessage = "Something went wrong. Please try again.";
        }
    };
</script>

<div class="mx-auto mt-10 max-w-md p-6 rounded-3xl border-1 border-[#334EAC59] bg-[#334EAC59] inset-shadow-[0px_0px_5px_8px_#d0d7f1]">
    <img src="/Logo.svg" alt="logo-Smart Tutor" class="mx-auto mb-4 w-28 h-28"/>
	<h1 class="mb-6 text-2xl font-bold text-center">SMART TUTOR</h1>
    {#if errorMessage}
        <p class="bg-red-100 text-red-700 p-2 mb-4 rounded">{errorMessage}</p>
    {/if}
    {#if successMessage}
        <p class="bg-green-100 text-green-700 p-2 mb-4 rounded">
            {successMessage}
        </p>
    {/if}
    <div class="mb-4">
        <p class="block mb-1 font-medium">Email</p>
        <Mail class="absolute mt-2 ml-3"/>
        <input
            name="email"
            type="email"
            placeholder="Email"
            required
			class="w-full rounded-2xl p-2 border-1 border-[#334EAC59] bg-[#E7F1FF11] inset-shadow-[1px_2px_5px_2px_#ffffff] pl-10"
            autocomplete="email"
            bind:value={email}
        />
    </div>
    <div class="mb-4">
        <p class="block mb-1 font-medium">Password</p>
        <KeyRound class="absolute mt-2 ml-3"/>
        <input
            name="password"
            type="password"
            placeholder="Password"
            required
			class="w-full rounded-2xl p-2 border-1 border-[#334EAC59] bg-[#E7F1FF11] inset-shadow-[1px_2px_5px_2px_#ffffff] pl-10"
            autocomplete="off"
            bind:value={password}
        />
        <p class="text-sm text-gray-600 mt-4 text-end">
            Don't have an account? <a
                href="/auth/register"
                class="text-blue-500 hover:underline">Sign Up</a
            >
        </p>
    </div>
    <div class="text-center">
        <button
			onclick={handleLogin}
			class="px-10 rounded-3xl py-2 font-bold border-1 border-[#334EAC59] bg-[#E7F1FF11] inset-shadow-[1px_2px_5px_2px_#ffffff] hover:bg-blue-100 transition-colors"
		>
			LOGIN
		</button>
    </div>
</div>
