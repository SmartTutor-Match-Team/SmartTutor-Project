<script lang="ts">
	import { ArrowUpCircle } from '@lucide/svelte';
	let our_tutor = [
		{
			name: 'Mr.A',
			subject: 'Math',
			rating: 4.5,
			image: '/Logo.svg'
		},
		{
			name: 'Ms.B',
			subject: 'Science',
			rating: 4.7,
			image: '/Logo.svg'
		},
		{
			name: 'Dr.C',
			subject: 'English',
			rating: 4.9,
			image: '/Logo.svg'
		},
		{
			name: 'Ms.D',
			subject: 'History',
			rating: 4.8,
			image: '/Logo.svg'
		}
	];
</script>

<section class="flex h-screen w-full flex-col items-center justify-center p-6" id="home">
	<img
		src="/bg-Lesson.svg"
		alt="Lesson Background"
		class="absolute top-[15%] left-[10%] w-[300px] lg:w-[594px]"
	/>
	<img
		src="/bg-Book.svg"
		alt="Books Background"
		class="absolute right-[10%] bottom-[5%] w-[360px] lg:w-[630px]"
	/>
	<h1 class="z-10 text-2xl font-bold lg:text-4xl">SMART TUTOR MATCH</h1>
	<h2 class="text-md z-10 mt-3 font-semibold lg:text-2xl">AN ONLINE EDUCATION MATCHING FOR YOU</h2>
	<a href="/auth/login" class="z-50">
		<button
			class="mt-3 rounded-3xl border-1 border-[#081F5C5A] bg-[#081e5c32] px-10 py-2 font-bold inset-shadow-[0px_0px_10px_2px_#ffffff] transition-colors hover:bg-[#334EAC59]"
		>
			GET STARTED
		</button>
	</a>
</section>

<section
	class="flex h-screen w-full items-center justify-center p-20 lg:justify-around"
	id="about-us"
>
	<div class="lg:w-[45%]">
		<h1 class="text-4xl font-bold">ABOUT US</h1>
		<p class="mt-2 text-lg">
			At Smart Tutor Match, we make learning easier by helping you find the right tutor for your
			goals. Whether it’s catching up in class, prepping for exams, or learning something new, we’ve
			got you covered. Our tutors aren’t just here to teach—they’re here to guide, support, and
			inspire. We believe learning should feel personal, flexible, and even fun. Because finding a
			tutor shouldn’t be stressful
		</p>
		<div class="flex justify-end">
			<a href="#our-tutor">
				<button
					class="mt-4 rounded-3xl border-1 border-[#081F5C5A] bg-[#081e5c32] px-10 py-2 font-bold inset-shadow-[0px_0px_10px_2px_#ffffff] transition-colors hover:bg-[#334EAC59]"
					>NEXT</button
				>
			</a>
		</div>
	</div>

	<img src="Education-Set.svg" alt="Education Set" class="hidden lg:block" />
</section>

<section class="flex min-h-screen w-full flex-col items-center justify-center p-6" id="our-tutor">
	<h1 class="text-4xl font-bold">OUR TUTORS</h1>
	<h2 class="mt-3 text-xl font-semibold">
		our websites have many of experienced tutor here are some examples
	</h2>
	<div class="mt-10 grid grid-cols-1 gap-4 xl:grid-cols-4">
		{#each our_tutor as tutor}
			<div
				class="w-64 rounded-2xl border-1 border-[#334EAC59] bg-[#334EAC59] p-4 inset-shadow-[0px_0px_5px_8px_#d0d7f1]"
			>
				<img src={tutor.image} alt={tutor.name} class="h-40 w-full rounded-2xl" />
				<h3 class="mt-2 text-xl font-bold">{tutor.name}</h3>
				<p class="text-md font-medium">Subject: {tutor.subject}</p>
				<p class="text-md font-medium">Rating: {tutor.rating} ⭐</p>
			</div>
		{/each}
	</div>
	<h1 class="mt-10 text-xl font-semibold">and more...</h1>
</section>
