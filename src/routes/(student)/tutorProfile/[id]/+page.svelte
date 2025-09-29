<script lang="ts">
	import { goto } from '$app/navigation';

	const { data } = $props();

	type AvailabilityWithBooking = {
		id: string;
		createdAt: Date;
		date: Date;
		startTime: Date;
		endTime: Date;
		tutorId: string;
		zoomLink: string | null;
		maxStudents: number;
		isCancelled: boolean;
		bookings: { id: string }[]; // หรือ select fields ที่ต้องใช้
	};

	const tutor = $state(data.tutor) as unknown as {
		id: string;
		bio: string | null;
		subject: string;
		hourlyRate: number;
		profileImageUrl: string | null;
		user: {
			[x: string]: any;
			name: string;
		};
		availabilities: AvailabilityWithBooking[];
		avgRating: number | null;
	};

	let showBookingModal: boolean = $state(false);
	let selectedAvailability: AvailabilityWithBooking | null = $state(null);
	let selectedAvailabilityId: string | null = $state(null);

	const formatDate = (dateStr: string) => {
		return new Date(dateStr).toLocaleDateString('th-TH', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			timeZone: 'Asia/Bangkok'
		});
	};

	const formatTime = (timeStr: string) => {
		return new Date(timeStr).toLocaleTimeString('th-TH', {
			hour: '2-digit',
			minute: '2-digit',
			timeZone: 'Asia/Bangkok'
		});
	};

	const handleBooking = async (availabilityId: string) => {
		try {
			const response = await fetch('/api/bookings', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ availabilityId, studentId: data.users.id }) // Replace with actual student ID
			});
			const result = await response.json();
			if (response.ok) {
				alert('Booking successful!');
				goto('/searchTutor');
			} else {
				alert(`Booking failed: ${result.error}`);
			}
		} catch (error) {
			console.error('Error:', error);
			alert('Error during booking. Please try again.');
		}
	};
</script>

<div class="mx-auto mt-26 max-w-4xl p-6">
	<!-- Tutor Profile Section -->
	<div class="flex flex-col md:flex-row gap-8 mb-10">
		<div class="space-y-2 flex-grow">
			<h1 class="text-4xl font-semibold mb-4">{tutor.user.name} - {tutor.subject}</h1>
			<p><strong>Bio:</strong> {tutor.bio || 'No bio available'}</p>
			<p><strong>Hourly Rate:</strong> ${tutor.hourlyRate}</p>
			<p>
				<strong>Rating:</strong>
				{#if tutor.avgRating}
					{tutor.avgRating.toFixed(1)}
				{:else}
					No ratings yet
				{/if}
			</p>
			<p><strong>Contact:</strong> {tutor.user.email}</p>
		</div>
		<div class="flex-shrink-0 flex items-center justify-center">
			<img
				src={tutor.profileImageUrl || '/Logo.svg'}
				alt={`Profile of ${tutor.user.name}`}
				class="w-48 h-48 md:w-64 md:h-64 rounded-full object-cover shadow-lg"
			/>
		</div>
	</div>

	<!-- Availability Section -->
	<div>
		<h2 class="text-3xl font-semibold pb-2 mb-4">Available Slots</h2>
		{#if tutor.availabilities && tutor.availabilities.length > 0}
			<div class="space-y-4">
				{#each tutor.availabilities as availability (availability.id)}
					<article class="rounded-4xl border-1 border-[#334EAC59] bg-[#334EAC59] inset-shadow-[0px_0px_5px_8px_#d0d7f1] p-4 mx-auto top-5 flex flex-wrap justify-around items-center text-black font-semibold mt-4 gap-4">
							<p class="text-xl font-bold">Date: {formatDate(availability.date + '')}</p>
							<p class="text-xl font-bold">
								Time:
								{formatTime(availability.startTime + '')} - {formatTime(availability.endTime + '')}
							</p>
							<p class="text-xl font-bold">
								Seats:
								{availability.bookings.length}/{availability.maxStudents}
							</p>
						<div>
							{#if availability.bookings.length < availability.maxStudents}
								<button
									type="button"
									class="px-6 py-2 rounded-4xl border-1 border-[#E7F1FF5A] inset-shadow-[1px_2px_5px_2px_#ffffff] hover:bg-[#E7F1FF5A] hover:text-[#334EAC] transition-colors font-semibold"
									onclick={() => {
										showBookingModal = true;
										selectedAvailability = availability;
									}}
								>
									Book Now
								</button>
							{:else}
								<span class="rounded bg-gray-400 px-3 py-1.5 text-sm font-medium text-white">
									Fully Booked
								</span>
							{/if}
						</div>
					</article>
				{/each}
			</div>
		{:else}
			<p class="text-gray-500 mt-4 bg-gray-100 p-4 rounded-lg">
				There are currently no available booking slots for this tutor.
			</p>
		{/if}
	</div>
</div>

<!-- Booking Confirmation Modal -->
{#if showBookingModal && selectedAvailability}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50">
		<div class="rounded-lg bg-white p-6 shadow-lg w-full max-w-xl">
			<h2 class="mb-4 text-xl font-bold text-center">Confirm Booking</h2>
			<div class="grid grid-cols-2">
				<div class="text-left">
					<p><strong>DATE:</strong> {formatDate(selectedAvailability.date + '')}</p>
					<p><strong>TUTOR:</strong> {tutor.user.name}</p>
					<p><strong>PRICE:</strong> ${tutor.hourlyRate}</p>
				</div>
				<div class="text-right">
					<p><strong>TIME:</strong> {formatTime(selectedAvailability.startTime + '')} - {formatTime(selectedAvailability.endTime + '')}</p>
					<p><strong>SUBJECT:</strong> {tutor.subject}</p>
				</div>
				<div class="col-span-2"><p><strong>LINK:</strong> {selectedAvailability.zoomLink} </p></div>
			</div>
			<div class="mt-6 flex justify-end space-x-3">
				<button
					class="rounded-3xl bg-[#FF0000]/50 px-4 py-2 font-bold hover:bg-[#d70000]/50 transition-colors"
					onclick={() => (showBookingModal = false)}>Cancel</button
				>
				<button
					class="rounded-3xl bg-[#09FF00]/50 px-4 py-2 font-bold hover:bg-[#02e600]/50 transition-colors"
					onclick={() => {
						if (selectedAvailability) {
							handleBooking(selectedAvailability.id);
						}
						showBookingModal = false;
					}}>Confirm</button
				>
			</div>
		</div>
	</div>
{/if}