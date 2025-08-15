<script lang="ts">
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

<div class="max-w-md mx-auto mt-10 p-6 border rounded shadow">
    {#if errorMessage}
        <p class="bg-red-100 text-red-700 p-2 mb-4 rounded">{errorMessage}</p>
    {/if}
    {#if successMessage}
        <p class="bg-green-100 text-green-700 p-2 mb-4 rounded">
            {successMessage}
        </p>
    {/if}
    <h1 class="text-2xl font-bold mb-6">Login</h1>
    <div class="mb-4">
        <p class="block mb-1 font-medium">Email</p>
        <input
            name="email"
            type="email"
            placeholder="Email"
            required
            class="w-full border rounded p-2"
            autocomplete="email"
            bind:value={email}
        />
    </div>
    <div class="mb-4">
        <p class="block mb-1 font-medium">Password</p>
        <input
            name="password"
            type="password"
            placeholder="Password"
            required
            class="w-full border rounded p-2"
            autocomplete="off"
            bind:value={password}
        />
    </div>
    <div class="text-center">
        <button
            class="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 btn"
            onclick={handleLogin}>Sign In</button
        >
        <p class="text-sm text-gray-600 mt-4">
            Don't have an account? <a
                href="/auth/register"
                class="text-blue-500 hover:underline">Sign Up</a
            >
        </p>
    </div>
</div>
