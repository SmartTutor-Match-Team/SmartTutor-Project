<script>
	let { children } = $props();
</script>

<svelte:head>
</svelte:head>

<nav class="flex justify-center w-full">
	Nav
</nav>

{@render children?.()}
