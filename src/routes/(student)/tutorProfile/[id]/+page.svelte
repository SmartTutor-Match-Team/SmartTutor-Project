<script lang="ts">
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
				{formatTime(availability.endTime + '')} Seat: {availability.bookings.length}/{availability.maxStudents}
				{#if availability.bookings.length < availability.maxStudents}
					<button class="ml-4 rounded bg-blue-500 px-2 py-1 text-white hover:bg-blue-600">
						Book Now
					</button>
				{:else}
					<span class="ml-4 rounded bg-gray-400 px-2 py-1 text-white">Fully Booked</span>
				{/if}
			</li>
		{/each}
	</ul>
</div>
