<script lang="ts">
	import { invalidateAll } from '$app/navigation';

    const { data } = $props();

    let history = $state(data.history || []);
    console.log(data.history);

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

    const setRating = (value: number) => {
        rating = value;
    };

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
            <div class="rounded-4xl border-1 border-[#334EAC59] bg-[#334EAC59] inset-shadow-[0px_0px_5px_8px_#d0d7f1] p-4 mx-auto top-5 flex flex-wrap justify-around items-center text-black text-xl font-semibold mt-4 gap-4">
                <p>
                    Date: {new Date(item.availability.date).toLocaleDateString('en-GB')} 
                </p>
                <p>Time:
                    {new Date(item.availability.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                    {new Date(item.availability.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                <button class="px-12 py-2 rounded-4xl border-1 border-[#E7F1FF5A] inset-shadow-[1px_2px_5px_2px_#ffffff] hover:bg-[#E7F1FF5A] hover:text-[#334EAC] transition-colors font-bold" onclick={() => {
                    showReviewModal = true;
                    selectedBooking = item;
                }}>REVIEW</button>
            </div>
        {/each}
    </div>
    <div class="mt-8 space-y-4">
        <h2 class="text-2xl font-bold">COMPLETED</h2>
        {#each completed as item}
            <div class="rounded-4xl border-1 border-[#33AC4D59] bg-[#33AC4D59] inset-shadow-[0px_0px_5px_8px_#d0f1d7] p-4 mx-auto top-5 flex flex-wrap justify-around items-center text-black text-xl font-semibold mt-4 gap-4">
                <p>
                    Date: {new Date(item.availability.date).toLocaleDateString('en-GB')} 
                </p>
                <p>Time:
                    {new Date(item.availability.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                    {new Date(item.availability.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                <p>Rating: {item.reviews[0]?.rating} / 5</p>
                <p>Link: <a href={item.videoLink} class="underline">Watch Video</a></p>
                <button class="px-6 py-2 rounded-4xl border-1 border-[#E7F1FF5A] inset-shadow-[1px_2px_5px_2px_#ffffff] font-bold">COMPLETED</button>
            </div>
        {/each}
    </div>

    <!-- modal review -->
    {#if showReviewModal}
        <div class="fixed inset-0 flex items-center justify-center">
            <div class="bg-white px-12 p-6 rounded-3xl border shadow-lg">
                <h2 class="text-xl font-bold mb-4 text-center">Leave a Review</h2>
                {#if selectedBooking}
                    <div class="mb-2">
                        <p><strong>DATE:</strong> {new Date(selectedBooking.availability.date).toLocaleDateString('en-GB')}</p>
                        <p><strong>TIME:</strong> {new Date(selectedBooking.availability.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(selectedBooking.availability.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        <p><strong>TUTOR:</strong> {selectedBooking.availability.tutor.user.name}</p>
                        <p><strong>SUBJECT:</strong> {selectedBooking.availability.tutor.subject}</p>
                        <p><strong>LINK:</strong> {selectedBooking.videoLink}</p>
                    </div>
                {/if}
                <div class="flex space-x-2 justify-center mb-2">
                    {#each Array(5) as _, i}
                        <button
                            class="w-12 h-12 text-4xl focus:outline-none
                                {i < rating ? 'text-yellow-400' : 'text-gray-300'}"
                        onclick={() => setRating(i + 1)}
                        >
                        ★
                        </button>
                    {/each}
                </div>

                <label class="block mb-4">
                    Comment:
                    <textarea class="w-full border border-gray-300 rounded-2xl p-2" rows="4" bind:value={comment} placeholder="Feel free to leave a comment"></textarea>
                </label>
                <div class="flex justify-end space-x-2">
                    <button class="rounded-3xl bg-[#FF0000]/50 px-4 py-2 font-bold hover:bg-[#d70000]/50 transition-colors" onclick={() => {
                        showReviewModal = false;
                    }}>Cancel</button>
                    <button class="rounded-3xl bg-[#09FF00]/50 px-4 py-2 font-bold hover:bg-[#02e600]/50 transition-colors" onclick={() => {
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