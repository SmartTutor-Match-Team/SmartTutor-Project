<script>
	let { children } = $props();
	import Nav from '$lib/Nav.svelte';
</script>

<svelte:head>
</svelte:head>

<Nav />
<main class="bg-[#F9FCFF] min-h-screen mt-30">
	{@render children?.()}
</main>
