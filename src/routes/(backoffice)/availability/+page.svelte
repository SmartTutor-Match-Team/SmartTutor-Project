<script lang="ts">
	import { invalidateAll } from '$app/navigation';

	const { data } = $props();

	let availability = $state(data.availability || []) as unknown as {
		id: string;
		date: string; // in format DD/MM/YYYY
		startTime: string; // in format HH:MM
		endTime: string; // in format HH:MM
		zoomLink: string | null;
		maxStudents: number;
		studentCount: number;
		isCancelled: boolean;
		isCompleted: boolean;
	}[];

	$effect(() => {
		availability = (data.availability || []).map((ava: any) => ({
			...ava,
			isCompleted: ava.isCompleted ?? false
		}));
	});

	let date = $state('');
	let startTime = $state('');
	let endTime = $state('');
	let zoomLink = $state('');
	let maxStudents = $state('');

	let message = $state('');

	let showEditModal = $state(false);
	let editAvailability = $state<{
		id: string;
		date: string;
		startTime: string;
		endTime: string;
		zoomLink: string | null;
		maxStudents: number;
		studentCount: number;
	} | null>(null);

	let editAvailabilityDate = $state('');
	let editAvailabilityStartTime = $state('');
	let editAvailabilityEndTime = $state('');
	let editAvailabilityZoomLink = $state('');
	let editAvailabilityMaxStudents = $state(0);

	let showCancelModal = $state(false);
	let cancelAvailabilityId = $state<string | null>(null);
	let cancelComment = $state('');

	let showCompleteModal = $state(false);
	let completeAvailabilityId = $state<string | null>(null);
	let vdoLink = $state('');

	const nowtime = () => {
		const now = new Date();
		now.setHours(now.getHours() + 7);
		return now.toISOString().slice(11, 16);
	};

	function parseThaiDate(dateStr: string): Date {
		const [day, month, buddhistYear] = dateStr.split('/').map(Number);
		const year = buddhistYear - 543; // แปลงกลับเป็น ค.ศ.
		return new Date(year, month - 1, day);
	}

	const handleAddAvailability = async () => {
		const formData = new FormData();
		formData.append('date', date);
		formData.append('startTime', startTime);
		formData.append('endTime', endTime);
		formData.append('zoomLink', zoomLink);
		formData.append('maxStudents', maxStudents);

		try {
			const response = await fetch('/availability?/create', {
				method: 'POST',
				body: formData
			});

			const result = await response.json();

			if (response.ok) {
				date = '';
				startTime = '';
				endTime = '';
				zoomLink = '';
				maxStudents = '';
				message = 'Availability added successfully';

				setTimeout(() => {
					message = '';
				}, 3000);

				await invalidateAll();
			} else {
				message = result.message;
				console.error('Failed to add availability');
			}
		} catch (error) {
			console.error('Error adding availability:', error);
		}
	};

	const handleDeleteAvailability = async (id: string, studentCount: number) => {
		if (studentCount > 0) {
			alert('Cannot delete availability with booked students');
			return;
		}

		try {
			const formData = new FormData();
			formData.append('id', id);

			const response = await fetch(`/availability?/delete`, {
				method: 'POST',
				body: formData
			});

			if (response.ok) {
				message = 'Availability deleted successfully';

				setTimeout(() => {
					message = '';
				}, 3000);

				await invalidateAll();
			} else {
				console.error('Failed to delete availability');
			}
		} catch (error) {
			console.error('Error deleting availability:', error);
		}
	};

	const handleEditAvailability = async (id: string) => {
		try {
			const formData = new FormData();
			formData.append('id', id);
			formData.append('date', editAvailabilityDate);
			formData.append('startTime', editAvailabilityStartTime);
			formData.append('endTime', editAvailabilityEndTime);
			formData.append('zoomLink', editAvailabilityZoomLink);
			formData.append('maxStudents', editAvailabilityMaxStudents.toString());

			const response = await fetch(`/availability?/edit`, {
				method: 'POST',
				body: formData
			});

			if (response.ok) {
				message = 'Availability updated successfully';
				showEditModal = false;
				editAvailability = null;

				setTimeout(() => {
					message = '';
				}, 3000);

				await invalidateAll();
			} else {
				console.error('Failed to update availability');
			}
		} catch (error) {
			console.error('Error updating availability:', error);
		}
	};

	const handleCancelAvailability = async (id: string, comment: string) => {
		// fetch to cancel availability 'api/cancelAvailability'
		try {
			const response = await fetch('/api/cancelAvailability', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ availabilityId: id, comment, role: data.users.role })
			});

			if (response.ok) {
				message = 'Availability canceled successfully';

				setTimeout(() => {
					message = '';
				}, 3000);

				await invalidateAll();
			} else {
				console.error('Failed to cancel availability');
			}
		} catch (error) {
			console.error('Error canceling availability:', error);
		}
		showCancelModal = false;
		cancelAvailabilityId = null;
	};

	const handleCompleteAvailability = async (id: string) => {
		try {
			const formData = new FormData();
			formData.append('id', id);
			formData.append('vdoLink', vdoLink);

			const response = await fetch(`/availability?/complete`, {
				method: 'POST',
				body: formData
			});

			if (response.ok) {
				message = 'Availability marked as complete';

				setTimeout(() => {
					message = '';
				}, 3000);

				showCompleteModal = false;
				completeAvailabilityId = null;
				vdoLink = '';

				await invalidateAll();
			} else {
				console.error('Failed to complete availability');
			}
		} catch (error) {
			console.error('Error completing availability:', error);
		}
	};
</script>

<div class="p-10">
	<h1 class="text-2xl font-bold">Availability</h1>

	{#if message}
		<div class="mt-4 rounded bg-green-100 p-4 text-green-800">{message}</div>
	{/if}

	<!-- form add availability -->
	<div class="mt-4">
		<input
			type="date"
			placeholder="Date"
			class="border border-gray-300 px-4 py-2"
			bind:value={date}
		/>
		<input
			type="time"
			placeholder="Start Time"
			class="border border-gray-300 px-4 py-2"
			bind:value={startTime}
		/>
		<input
			type="time"
			placeholder="End Time"
			class="border border-gray-300 px-4 py-2"
			bind:value={endTime}
		/>
		<input
			type="text"
			placeholder="Zoom/Meet Link"
			class="border border-gray-300 px-4 py-2"
			bind:value={zoomLink}
		/>
		<input
			type="number"
			placeholder="Max Students"
			class="border border-gray-300 px-4 py-2"
			bind:value={maxStudents}
		/>
		<button
			class="mt-2 rounded-full bg-[#334EAC] px-4 py-2 text-white"
			onclick={handleAddAvailability}>Add</button
		>
	</div>

	<div class="mt-8">
		<table class="w-full table-auto border-collapse border border-gray-300">
			<thead>
				<tr class="bg-gray-200">
					<th class="border border-gray-300 px-4 py-2">Date</th>
					<th class="border border-gray-300 px-4 py-2">Time</th>
					<th class="border border-gray-300 px-4 py-2">Zoom/Meet Link</th>
					<th class="border border-gray-300 px-4 py-2">Students</th>
					<th class="border border-gray-300 px-4 py-2">Max Students</th>
					<th class="border border-gray-300 px-4 py-2">Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each availability as ava}
					<tr>
						<td class="border border-gray-300 px-4 py-2">{ava.date}</td>
						<td class="border border-gray-300 px-4 py-2">{ava.startTime} - {ava.endTime}</td>
						<td class="border border-gray-300 px-4 py-2"
							><a href={ava.zoomLink} class="text-blue-500" target="_blank">{ava.zoomLink}</a></td
						>
						<td class="border border-gray-300 px-4 py-2">{ava.studentCount}</td>
						<td class="border border-gray-300 px-4 py-2">{ava.maxStudents}</td>
						<td class="border border-gray-300 px-4 py-2">
							{#if ava.isCompleted}
								<span class="font-bold text-green-500">Completed</span>
							{:else if parseThaiDate(ava.date) < new Date() && !ava.isCancelled}
								<button
									class="rounded-full bg-green-500 px-3 py-1 text-white"
									onclick={() => {
										showCompleteModal = true;
										completeAvailabilityId = ava.id;
									}}>Complete</button
								>
							{:else if parseThaiDate(ava.date).toDateString() === new Date().toDateString() && ava.endTime <= nowtime() && !ava.isCancelled}
								<button
									class="rounded-full bg-green-500 px-3 py-1 text-white"
									onclick={() => {
										showCompleteModal = true;
										completeAvailabilityId = ava.id;
									}}>Complete</button
								>
							{:else if ava.isCancelled}
								<span class="font-bold text-red-500">Cancelled</span>
							{:else if ava.studentCount > 0}
								<button
									class="rounded-full bg-gray-500 px-3 py-1 text-white"
									onclick={() => {
										showCancelModal = true;
										cancelAvailabilityId = ava.id;
									}}>Cancel</button
								>
							{:else}
								<button
									class="rounded-full bg-red-500 px-3 py-1 text-white"
									onclick={() => handleDeleteAvailability(ava.id, ava.studentCount)}>Delete</button
								>
								<button
									class="rounded-full bg-yellow-500 px-3 py-1 text-white"
									onclick={() => {
										showEditModal = true;
										editAvailability = ava;
										const day = ava.date.split('/')[0];
										const month = ava.date.split('/')[1];
										const year = ava.date.split('/')[2];
										editAvailabilityDate = `${Number(year) - 543}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
										editAvailabilityStartTime = ava.startTime;
										editAvailabilityEndTime = ava.endTime;
										editAvailabilityZoomLink = ava.zoomLink || '';
										editAvailabilityMaxStudents = ava.maxStudents;
									}}>Edit</button
								>
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
	<!-- edit modal -->
	{#if showEditModal}
		<div class="fixed inset-0 flex items-center justify-center">
			<div class="rounded bg-white p-6 shadow-lg">
				<h2 class="mb-4 text-xl">Edit Availability</h2>
				<!-- Form fields for editing availability would go here -->
				<div class="mt-4">
					<input
						type="date"
						placeholder="Date"
						class="border border-gray-300 px-4 py-2"
						bind:value={editAvailabilityDate}
					/>
					<input
						type="time"
						placeholder="Start Time"
						class="border border-gray-300 px-4 py-2"
						bind:value={editAvailabilityStartTime}
					/>
					<input
						type="time"
						placeholder="End Time"
						class="border border-gray-300 px-4 py-2"
						bind:value={editAvailabilityEndTime}
					/>
					<input
						type="text"
						placeholder="Zoom/Meet Link"
						class="border border-gray-300 px-4 py-2"
						bind:value={editAvailabilityZoomLink}
					/>
					<input
						type="number"
						placeholder="Max Students"
						class="border border-gray-300 px-4 py-2"
						bind:value={editAvailabilityMaxStudents}
					/>
				</div>
				<div class="mt-4 flex justify-end">
					<button
						class="mr-2 rounded bg-gray-300 px-4 py-2 hover:bg-gray-400"
						onclick={() => {
							showEditModal = false;
							editAvailability = null;
						}}>Cancel</button
					>
					<button
						class="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
						onclick={() => {
							if (editAvailability) {
								handleEditAvailability(editAvailability.id);
							}
						}}>Save</button
					>
				</div>
			</div>
		</div>
	{/if}

	<!-- cancel modal -->
	{#if showCancelModal}
		<div class="fixed inset-0 flex items-center justify-center">
			<div class="rounded bg-white p-6 shadow-lg">
				<h2 class="mb-4 text-xl">Confirm Cancel Availability</h2>
				<input
					type="text"
					placeholder="Comment to your student"
					class="mb-4 w-full border border-gray-300 px-4 py-2"
					bind:value={cancelComment}
				/>
				<div class="mt-4 flex justify-end">
					<button
						class="mr-2 rounded bg-gray-300 px-4 py-2 hover:bg-gray-400"
						onclick={() => {
							showCancelModal = false;
							cancelAvailabilityId = null;
						}}>No</button
					>
					<button
						class="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
						onclick={() => {
							if (cancelAvailabilityId) {
								handleCancelAvailability(cancelAvailabilityId, cancelComment);
							}
						}}>Yes</button
					>
				</div>
			</div>
		</div>
	{/if}

	<!-- complete modal -->
	{#if showCompleteModal}
		<div class="fixed inset-0 flex items-center justify-center">
			<div class="rounded bg-white p-6 shadow-lg">
				<h2 class="mb-4 text-xl">Confirm Complete Availability</h2>
				<input
					type="text"
					placeholder="VDO Link"
					class="mb-4 w-full border border-gray-300 px-4 py-2"
					bind:value={vdoLink}
				/>
				<div class="mt-4 flex justify-end">
					<button
						class="mr-2 rounded bg-gray-300 px-4 py-2 hover:bg-gray-400"
						onclick={() => {
							showCompleteModal = false;
						}}>Cancel</button
					>
					<button
						class="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
						onclick={() => {
							if (completeAvailabilityId) {
								handleCompleteAvailability(completeAvailabilityId);
							}
						}}>Confirm</button
					>
				</div>
			</div>
		</div>
		
	{/if}
</div>
