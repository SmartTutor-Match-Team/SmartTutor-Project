<script lang="ts">
	import { onMount } from 'svelte';
    import { fly } from 'svelte/transition';
    const { data } = $props();

    onMount(() => {
        handleSearch();
    })

    let tutors = $state(data.tutors || []) as unknown as {
        id: string;
        bio: string | null;
        subject: string;
        hourlyRate: number;
        profileImageUrl: string | null;
        user: {
            name: string;
        };
        avgRating: number | null;
    }[];

    let searchName = $state('');
    let selectedSubject = $state('');
    let selectedAvailability = $state('');
    let selectedPrice = $state('desc');
    let selectedRating = $state('desc');

    const handleSearch = async () => {
        try {
            const response = await fetch('/api/searchTutor', {
                method: 'POST',
                body: JSON.stringify({
                    name: searchName,
                    subject: selectedSubject,
                    availability: selectedAvailability,
                    price: selectedPrice,
                    rating: selectedRating
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const result = await response.json();
            tutors = result.tutors;
        } catch (error) {
            console.error('Error fetching tutors:', error);
        }
    };
</script>

<!-- search Tutor -->
<section aria-labelledby="tutor-search-heading" class="flex flex-col items-center">
	<h1 id="tutor-search-heading" class="text-4xl font-semibold text-center">FIND YOUR CUPID TUTOR</h1>

	<!-- The onsubmit event makes the form functional -->
	<form
		transition:fly={{ y: 20, duration: 600, delay: 200 }}
		class="w-[70%] rounded-4xl border-1 border-[#334EAC59] bg-[#334EAC59] inset-shadow-[0px_0px_5px_8px_#d0d7f1] p-2 mx-auto top-5 flex flex-wrap justify-around items-center text-white font-semibold mt-4 gap-4"
		onsubmit={handleSearch}
	>
		<!-- Primary Filters: Search and Subject -->
		<div class="w-full rounded-4xl border-1 border-[#E7F1FF5A] inset-shadow-[1px_2px_5px_2px_#ffffff] flex md:w-auto md:flex-1">
			<label for="search-tutor" class="sr-only">Search by Tutor Name</label>
			<input
				type="text"
				id="search-tutor"
				placeholder="Search Tutor..."
				class="m-2 rounded-4xl w-full bg-transparent border-transparent text-black placeholder:text-gray-600 focus:border-transparent focus:ring-0"
				bind:value={searchName}
			/>
			<label for="subject-filter" class="sr-only">Filter by Subject</label>
			<select
				name="subject"
				id="subject-filter"
				class="m-2 text-sm rounded-4xl bg-transparent border-transparent text-black focus:border-transparent focus:ring-0"
				bind:value={selectedSubject}
			>
				<option value="">All Subjects</option>
				<option value="MATH">Math</option>
				<option value="SCIENCE">Science</option>
				<option value="ENGLISH">English</option>
			</select>
		</div>

		<!-- Secondary Filters: Availability and Sorting -->
		<div class="flex flex-wrap justify-center items-center gap-x-2">
			<div>
				<label for="availability-filter" class="sr-only">Filter by Availability</label>
				<select
					name="availability"
					id="availability-filter"
					class="p-2 text-sm rounded-4xl text-black bg-transparent border-transparent focus:border-transparent focus:ring-0"
					bind:value={selectedAvailability}
				>
					<option value="">All Availability</option>
					<option value="true">Available</option>
					<option value="false">Busy</option>
				</select>
			</div>
			<div>
				<label for="price-sort" class="sr-only">Sort by Price</label>
				<select
					name="price"
					id="price-sort"
					class="p-2 text-sm rounded-4xl text-black bg-transparent border-transparent focus:border-transparent focus:ring-0"
					bind:value={selectedPrice}
				>
					<option value="desc">Price: High to Low</option>
					<option value="asc">Price: Low to High</option>
				</select>
			</div>
			<div>
				<label for="rating-sort" class="sr-only">Sort by Rating</label>
				<select
					name="rating"
					id="rating-sort"
					class="p-2 text-sm rounded-4xl text-black bg-transparent border-transparent focus:border-transparent focus:ring-0"
					bind:value={selectedRating}
				>
					<option value="desc">Rating: High to Low</option>
					<option value="asc">Rating: Low to High</option>
				</select>
			</div>
		</div>

		<!-- Search Button -->
		<button type="submit" class="px-6 py-2 rounded-4xl border-1 border-[#E7F1FF5A] inset-shadow-[1px_2px_5px_2px_#ffffff] hover:bg-[#E7F1FF5A] hover:text-[#334EAC] transition-colors font-semibold">
			Search
		</button>
	</form>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 w-full my-2 mx-auto px-32"
        transition:fly={{ y: 20, duration: 600, delay: 400 }}>
        {#each tutors as tutor (tutor.id)}
			<!-- Changed div to article for better semantics -->
            <article class="rounded-4xl border-1 border-[#334EAC59] bg-[#334EAC59] inset-shadow-[0px_0px_5px_8px_#d0d7f1] p-4 flex flex-col items-center text-white">
                <img src={tutor.profileImageUrl || '/Logo.svg'} alt={`Profile of ${tutor.user.name}`} class="w-24 h-24 rounded-full mb-4 object-cover" />
                <h2 class="text-xl font-bold">{tutor.user.name}</h2>
                <p class="text-black">Subject: {tutor.subject}</p>
                <p class="text-black text-center px-2">Bio: {tutor.bio || 'No bio available'}</p>
                <p class="text-black">Hourly Rate: ${tutor.hourlyRate}</p>
                <p class="text-orange-300">Rating: {tutor.avgRating ? tutor.avgRating.toFixed(1) : 'No ratings yet'}</p>
                <a href={`/tutorProfile/${tutor.id}`} class="mt-4 px-4 py-2 rounded-4xl border-1 border-[#E7F1FF5A] inset-shadow-[1px_2px_5px_2px_#ffffff] hover:bg-[#E7F1FF5A] hover:text-[#334EAC] transition-colors">
                    View Profile
                </a>
            </article>
        {/each}
        {#if tutors.length === 0}
            <p class="text-gray-600 text-center col-span-full">No tutors found matching your criteria.</p>
        {/if}
    </div>
</section>