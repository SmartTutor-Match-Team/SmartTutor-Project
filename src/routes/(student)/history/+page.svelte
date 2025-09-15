<script lang="ts">
	import { invalidateAll } from '$app/navigation';

    const { data } = $props();

    let history = $state(data.history || []);

    $effect(() => {
        history = data.history;
    })

    let no_review = $derived(history.filter((item) => item.reviews.length === 0));

    let completed = $derived(history.filter((item) => item.reviews.length > 0));

    let showReviewModal: boolean = $state(false);
    let selectedBooking: any = $state(null);
    let rating: number = $state(0);
    let comment: string = $state('');

    let message: string = $state('');

    const handleAddReview = async (bookingId: string, tutorProfileId: string, rating: number, comment: string) => {
        try {
            const response = await fetch('/api/reviews', {
                method: 'POST',
                body: JSON.stringify({
                    bookingId,
                    reviewerId: data.users.id,
                    tutorProfileId,
                    rating,
                    comment
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const result = await response.json();
            message = result.message;

            await invalidateAll();
        } catch (error) {
            console.error('Error adding review:', error);
        }
    };
</script>

<div class="container mx-auto p-4">
    <h1 class="text-5xl font-bold text-center">History</h1>
    {#if message}
        <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative my-4" role="alert">
            <span class="block sm:inline">{message}</span>
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <span class="absolute top-0 bottom-0 right-0 px-4 py-3" onclick={() => message = ''}>
                <svg class="fill-current h-6 w-6 text-green-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.03a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
            </span>
        </div>
    {/if}
    <div class="mt-8 space-y-4">
        <h2 class="text-2xl font-bold">YOUR BOOKING</h2>
        {#each no_review as item}
            <div class="border border-gray-300 rounded p-4 flex justify-around items-center space-x-4">
                <p>
                    Date: {new Date(item.availability.date).toLocaleDateString('en-GB')} 
                </p>
                <p>Time:
                    {new Date(item.availability.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                    {new Date(item.availability.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                <button class="bg-blue-500 text-white rounded px-4 py-2" onclick={() => {
                    showReviewModal = true;
                    selectedBooking = item;
                }}>Review</button>
            </div>
        {/each}
    </div>
    <div class="mt-8 space-y-4">
        <h2 class="text-2xl font-bold">COMPLETED</h2>
        {#each completed as item}
            <div class="border border-gray-300 rounded p-4 flex justify-around items-center space-x-4">
                <p>
                    Date: {new Date(item.availability.date).toLocaleDateString('en-GB')} 
                </p>
                <p>Time:
                    {new Date(item.availability.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                    {new Date(item.availability.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                <p>Rating: {item.reviews[0]?.rating} / 5</p>
                <p>Comment: {item.reviews[0]?.comment}</p>
            </div>
        {/each}
    </div>

    <!-- modal review -->
    {#if showReviewModal}
        <div class="fixed inset-0 flex items-center justify-center">
            <div class="bg-white p-6 rounded shadow-lg w-96">
                <h2 class="text-xl font-bold mb-4">Leave a Review</h2>
                <label class="block mb-2">
                    Rating:
                    <select class="w-full border border-gray-300 rounded p-2" bind:value={rating}>
                        <option value={0} disabled>Select rating</option>
                        <option value={5}>5 - Excellent</option>
                        <option value={4}>4 - Very Good</option>
                        <option value={3}>3 - Good</option>
                        <option value={2}>2 - Fair</option>
                        <option value={1}>1 - Poor</option>
                    </select>
                </label>
                <label class="block mb-4">
                    Comment:
                    <textarea class="w-full border border-gray-300 rounded p-2" rows="4" bind:value={comment}></textarea>
                </label>
                <div class="flex justify-end space-x-2">
                    <button class="bg-gray-300 text-black rounded px-4 py-2" onclick={() => {
                        showReviewModal = false;
                    }}>Cancel</button>
                    <button class="bg-blue-500 text-white rounded px-4 py-2" onclick={() => {
                        if (selectedBooking) {
                            handleAddReview(selectedBooking.id, selectedBooking.availability.tutorId, rating, comment);
                        }
                        showReviewModal = false;
                    }}>Submit</button>
                </div>
            </div>
        </div>
    {/if}
</div>