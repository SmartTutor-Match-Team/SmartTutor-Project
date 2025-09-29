<script>
	let { children } = $props();
	import TutorNav from '$lib/TutorNav.svelte';
</script>

<svelte:head>
</svelte:head>

<TutorNav />
<main class="bg-[#F9FCFF] min-h-screen pt-30">
	{@render children?.()}
</main>
