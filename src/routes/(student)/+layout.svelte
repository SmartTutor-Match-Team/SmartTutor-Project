<script>
	let { children } = $props();
	import StudentNav from '$lib/StudentNav.svelte';
</script>

<svelte:head>
</svelte:head>

<StudentNav />
<main class="bg-[#F9FCFF] min-h-screen pt-30">
	{@render children?.()}
</main>
