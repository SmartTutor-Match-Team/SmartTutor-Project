<script lang="ts">
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";

    // export let form;

    let name = "";
    let email = "";
    let password = "";
    let role = "STUDENT";

    let errorMessage = "";
    let successMessage = "";

    async function handleRegister() {
        errorMessage = "";
        successMessage = "";

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name, email, password, role }),
            });

            const data = await res.json();

            if (!res.ok) {
                errorMessage = data.message || "Registration failed";
                return;
            }

            successMessage = "Registration successful! Redirecting...";
            setTimeout(() => {
                goto("/auth/login");
            }, 1500);
        } catch (err) {
            errorMessage = "Something went wrong. Please try again.";
        }
    }
</script>

<div class="max-w-md mx-auto mt-10 p-6 border rounded shadow">
    <h1 class="text-2xl font-bold mb-6">Register</h1>

    {#if errorMessage}
        <div class="bg-red-100 text-red-700 p-2 mb-4 rounded">
            {errorMessage}
        </div>
    {/if}

    {#if successMessage}
        <div class="bg-green-100 text-green-700 p-2 mb-4 rounded">
            {successMessage}
        </div>
    {/if}

    <!-- <form method="POST" class="space-y-3"> -->
    <div class="mb-4">
        <label for="name" class="block mb-1 font-medium">Name</label>
        <input
            id="name"
            name="name"
            type="text"
            bind:value={name}
            class="w-full border rounded p-2"
            placeholder="Your name"
            autocomplete="given-name"
            required
        />
    </div>

    <div class="mb-4">
        <label for="email" class="block mb-1 font-medium">Email</label>
        <input
            id="email"
            name="email"
            type="email"
            bind:value={email}
            class="w-full border rounded p-2"
            placeholder="you@example.com"
            autocomplete="email"
            required
        />
    </div>

    <div class="mb-4">
        <label for="password" class="block mb-1 font-medium">Password</label>
        <input
            id="password"
            name="password"
            type="password"
            bind:value={password}
            class="w-full border rounded p-2"
            placeholder="password"
            autocomplete="off"
            required
        />
    </div>

    <div class="mb-4">
        <label for="role" class="block mb-1 font-medium">Role</label>
        <select id="role" bind:value={role} class="w-full border rounded p-2">
            <option value="STUDENT">Student</option>
            <option value="TUTOR">Tutor</option>
        </select>
    </div>

    <div class="text-center">
        <button
            onclick={handleRegister}
            class="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 btn"
        >
            Register
        </button>
        <p class="text-sm text-gray-600 mt-4">
            Already have an account? <a
                href="/auth/login"
                class="text-blue-500 hover:underline">Sign In</a
            >
        </p>
    </div>
    <!-- </form> -->
</div>
