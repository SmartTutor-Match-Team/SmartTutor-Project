<script lang="ts">
    import type { PageProps } from './$types';
    import { invalidateAll } from '$app/navigation';
    import { getLocalTimeZone, today, parseDate } from "@internationalized/date";
    import type { DateValue } from "@internationalized/date";
    import { Calendar } from "$lib/components/ui/calendar/index.js";

    let value = $state(today(getLocalTimeZone()));
    let { data }: PageProps = $props();
    let bookings = $state(data.bookings || []);
    let upcoming = $derived(bookings.filter((item) => new Date(item.availability.date) >= new Date() && item.status !== 'CANCELLED'));
    let cancel = $derived(bookings.filter((item) => item.status == 'CANCELLED'));
    let past = $derived(bookings.filter((item) => new Date(item.availability.date) < new Date()));
    let showDetailModal: boolean = $state(false);
    let selectedBooking: any = $state(null);
    let rating: number = $state(0);
    let comment: string = $state('');
    let message: string = $state('');
    function toYYYYMMDD(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    const upcomingDates = $derived(new Set(
        upcoming.map(item => {
            const dateObj = new Date(item.availability.date);
            return toYYYYMMDD(dateObj);
        })
    ));

    const isDateMarked = (date: DateValue) => {
        const dateString = date.toString();
        return upcomingDates.has(dateString);
    };
</script>

<div class="container mx-auto p-4">
    <h1 class="text-5xl font-bold text-center mb-8">Dashboard</h1>
    <div class="flex justify-center">
        <Calendar
            type="single"
            bind:value
            class="rounded-md border shadow-sm w-fit"
            captionLayout="dropdown"
            isDateUnavailable={isDateMarked}
        />
    </div>
    <h2 class="text-3xl font-semibold mb-4">Upcoming Sessions</h2>
    {#if upcoming.length === 0}
        <p class="text-gray-500 mb-4">No upcoming sessions.</p>
    {:else}
        <div class="flex flex-col mb-8">
            {#each upcoming as item}
                <div class="w-full rounded-4xl border-1 border-[#334EAC59] bg-[#334EAC59] inset-shadow-[0px_0px_5px_8px_#d0d7f1] p-4 mx-auto top-5 flex flex-wrap justify-around items-center text-black text-xl font-semibold mt-4 gap-4">
                    <p>
                        Date: {new Date(item.availability.date).toLocaleDateString('en-GB')} 
                    </p>
                    <p>Time:
                        {new Date(item.availability.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                        {new Date(item.availability.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    <p>Seats:
                        {item.availability.bookings.length}/{item.availability.maxStudents}
                    </p>
                    <button class="px-12 py-2 rounded-4xl border-1 border-[#E7F1FF5A]    inset-shadow-[1px_2px_5px_2px_#ffffff] hover:bg-[#E7F1FF5A] hover:text-[#334EAC] transition-colors font-bold" onclick={() => {
                        showDetailModal = true;
                        selectedBooking = item;
                    }}>DETAIL</button>
                </div>
            {/each}
        </div>
    {/if}

    <h2 class="text-3xl font-semibold mb-4">Cancel Sessions</h2>
    {#if upcoming.length === 0}
        <p class="text-gray-500 mb-4">No Cancel sessions.</p>
    {:else}
        <div class="flex flex-col mb-8">
            {#each cancel as item}
                <div class="w-full rounded-4xl border-1 border-[#AC333359] bg-[#AC333359] inset-shadow-[0px_0px_5px_8px_#f1d7d7] p-4 mx-auto top-5 flex flex-wrap justify-around items-center text-black text-xl font-semibold mt-4 gap-4">
                    <p>
                        Date: {new Date(item.availability.date).toLocaleDateString('en-GB')} 
                    </p>
                    <p>Time:
                        {new Date(item.availability.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                        {new Date(item.availability.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    <p>Seats:
                        {item.availability.bookings.length}/{item.availability.maxStudents}
                    </p>
                    <button class="px-12 py-2 rounded-4xl border-1 border-[#E7F1FF5A]    inset-shadow-[1px_2px_5px_2px_#ffffff] hover:bg-[#E7F1FF5A] hover:text-[#334EAC] transition-colors font-bold" onclick={() => {
                        showDetailModal = true;
                        selectedBooking = item;
                    }}>DETAIL</button>
                </div>
            {/each}
        </div>
    {/if}


    {#if showDetailModal}
        <div class="fixed inset-0 flex items-center justify-center">
            <div class="bg-white px-12 p-6 rounded-3xl border shadow-lg">
                <h2 class="text-xl font-bold mb-4 text-center">Bookings Detail</h2>
                {#if selectedBooking}
                    <div class="mb-2">
                        <p><strong>DATE:</strong> {new Date(selectedBooking.availability.date).toLocaleDateString('en-GB')}</p>
                        <p><strong>TIME:</strong> {new Date(selectedBooking.availability.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(selectedBooking.availability.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        <p><strong>TUTOR:</strong> {selectedBooking.availability.tutor.user.name}</p>
                        <p><strong>SUBJECT:</strong> {selectedBooking.availability.tutor.subject}</p>
                        <p><strong>LINK:</strong> {selectedBooking.availability.zoomLink}</p>
                    </div>
                {/if}
                <div class="flex justify-end space-x-2">
                    <button class="rounded-3xl bg-[#FF0000]/50 px-4 py-2 font-bold hover:bg-[#d70000]/50 transition-colors" onclick={() => {
                        showDetailModal = false;
                    }}>Close</button>
                </div>
            </div>
        </div>
    {/if}
</div>
