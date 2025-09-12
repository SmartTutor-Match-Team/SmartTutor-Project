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

<h1>Tutor Profile</h1>

<div>
	<h2>{tutor.user.name}</h2>
	<p>Email: {tutor.user.email}</p>
	<p>Bio: {tutor.bio}</p>
	<p>Subject: {tutor.subject}</p>
	<p>Hourly Rate: ${tutor.hourlyRate}</p>
	<p>Rating: {tutor.avgRating ? tutor.avgRating.toFixed(1) : 'No ratings yet'}</p>
	<!-- svelte-ignore a11y_img_redundant_alt -->
	<img src={tutor.profileImageUrl} alt="Profile Picture" class="w-36" />

	<!-- Availability -->
	<h3>Availability Time</h3>
	<ul class="list-disc pl-5">
		{#each tutor.availabilities as availability}
			<li class="mb-2">
				Date: {formatDate(availability.date + '')} Time: {formatTime(availability.startTime + '')} -
				{formatTime(availability.endTime + '')} Seat: {availability.bookings
					.length}/{availability.maxStudents}
				{#if availability.isCancelled}
					<span class="ml-4 rounded bg-red-500 px-2 py-1 text-white">Cancelled</span>
				{:else if availability.bookings.length < availability.maxStudents}
					<button
						class="ml-4 rounded bg-blue-500 px-2 py-1 text-white hover:bg-blue-600"
						onclick={() => {
							showBookingModal = true;
							selectedAvailability = availability;
							selectedAvailabilityId = availability.id;
						}}
					>
						Book Now
					</button>
				{:else}
					<span class="ml-4 rounded bg-gray-400 px-2 py-1 text-white">Fully Booked</span>
				{/if}
			</li>
		{/each}
	</ul>
	{#if showBookingModal}
		<div class="fixed inset-0 flex items-center justify-center">
			<div class="rounded bg-white p-6 shadow-lg">
				<h2 class="mb-4 text-xl">Confirm Booking</h2>
				<p>Are you sure you want to book this session?</p>
				{#if selectedAvailability}
					<p>
						Date: {formatDate(selectedAvailability.date + '')} Time:
						{formatTime(selectedAvailability.startTime + '')} -
						{formatTime(selectedAvailability.endTime + '')}
					</p>
					<p>Price: ${tutor.hourlyRate * ((new Date(selectedAvailability?.endTime).getTime() - new Date(selectedAvailability?.startTime).getTime()) / 3600000)}</p>
				{/if}
				<div class="mt-4 flex justify-end">
					<button
						class="mr-2 rounded bg-gray-300 px-4 py-2 hover:bg-gray-400"
						onclick={() => (showBookingModal = false)}
					>
						Cancel
					</button>
					<button
						class="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
						onclick={() => {
							if (selectedAvailabilityId) {
								handleBooking(selectedAvailabilityId);
							}
							showBookingModal = false;
						}}
					>
						Confirm
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>
