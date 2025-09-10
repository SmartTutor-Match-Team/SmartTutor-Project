<script lang="ts">
	import { onMount } from 'svelte';

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
<h1 class="text-5xl font-bold text-center">Find Your Tutor</h1>
<input type="text" placeholder="Search Tutor..." class="m-4 p-2 border border-gray-300 rounded" bind:value={searchName} />
<select name="subject" id="subject" class="m-4 p-2 border border-gray-300 rounded w-36" bind:value={selectedSubject}>
    <option value="">All Subjects</option>
    <option value="MATH">Math</option>
    <option value="SCIENCE">Science</option>
    <option value="ENGLISH">English</option>
</select>
<select name="availability" id="availability" class="m-4 p-2 border border-gray-300 rounded w-36" bind:value={selectedAvailability}>
    <option value="">All Availability</option>
    <option value="true">Available</option>
    <option value="false">Busy</option>
</select>
<select name="price" id="price" class="m-4 p-2 border border-gray-300 rounded w-36" bind:value={selectedPrice}>
    <option value="desc">High to Low</option>
    <option value="asc">Low to High</option>
</select>
<select name="rating" id="rating" class="m-4 p-2 border border-gray-300 rounded w-36" bind:value={selectedRating}>
    <option value="desc">High to Low</option>
    <option value="asc">Low to High</option>
</select>
<button class="m-4 p-2 bg-blue-500 text-white rounded hover:bg-blue-600" onclick={handleSearch}>Search</button>

<!-- show Tutor -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
    {#each tutors as tutor}
        <div class="border border-gray-300 rounded p-4 flex flex-col items-center">
            <img src={tutor.profileImageUrl} alt={tutor.user.name} class="w-24 rounded-full mb-4" />
            <h2 class="text-xl font-bold">{tutor.user.name}</h2>
            <p class="text-gray-600">{tutor.subject}</p>
            <p class="text-gray-600">Bio: {tutor.bio}</p>
            <p class="text-gray-600">Hourly Rate: ${tutor.hourlyRate}</p>
            <p class="text-yellow-500">Rating: {tutor.avgRating ? tutor.avgRating.toFixed(1) : 'No ratings yet'}</p>
            <a href="/tutorProfile/{tutor.id}">
                <button class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                    View Profile
                </button>
            </a>
        </div>
    {/each}
</div>
