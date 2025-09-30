<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import Swal from 'sweetalert2';
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
	const showAddModal = () => {
		Swal.fire({
			title: 'Add New Availability',
			html: `
            <div class="space-y-5 p-4 text-left">
                <div>
                    <label for="swal-date" class="block mb-1 font-semibold text-gray-600">Date</label>
                    <input id="swal-date" type="date" class="w-full p-2 border border-gray-300 rounded-md">
                </div>

                <div class="flex gap-4">
                    <div class="w-1/2">
                        <label for="swal-startTime" class="block mb-1 font-semibold text-gray-600">Start Time</label>
                        <input id="swal-startTime" type="time" class="w-full p-2 border border-gray-300 rounded-md">
                    </div>
                    <div class="w-1/2">
                        <label for="swal-endTime" class="block mb-1 font-semibold text-gray-600">End Time</label>
                        <input id="swal-endTime" type="time" class="w-full p-2 border border-gray-300 rounded-md">
                    </div>
                </div>
                
                <div>
                    <label for="swal-zoomLink" class="block mb-1 font-semibold text-gray-600">Zoom/Meet Link (Optional)</label>
                    <input id="swal-zoomLink" type="text" placeholder="https://zoom.us/j/..." class="w-full p-2 border border-gray-300 rounded-md">
                </div>

                <div>
                    <label for="swal-maxStudents" class="block mb-1 font-semibold text-gray-600">Max Students</label>
                    <input id="swal-maxStudents" type="number" placeholder="1" value="1" class="w-full p-2 border border-gray-300 rounded-md">
                </div>
            </div>`,
			width: '32rem',
			focusConfirm: false,
			showCancelButton: true,
			confirmButtonText: 'Add Slot',
			confirmButtonColor: '#334EAC',
			preConfirm: () => {
				const dateValue = (document.getElementById('swal-date') as HTMLInputElement).value;
				const startTimeValue = (document.getElementById('swal-startTime') as HTMLInputElement).value;
				const endTimeValue = (document.getElementById('swal-endTime') as HTMLInputElement).value;
				const zoomLinkValue = (document.getElementById('swal-zoomLink') as HTMLInputElement).value;
				const maxStudentsValue = (document.getElementById('swal-maxStudents') as HTMLInputElement).value;

				if (!dateValue || !startTimeValue || !endTimeValue || !maxStudentsValue) {
					Swal.showValidationMessage('Date, times, and max students are required.');
					return false;
				}

				return {
					date: dateValue,
					startTime: startTimeValue,
					endTime: endTimeValue,
					zoomLink: zoomLinkValue,
					maxStudents: maxStudentsValue
				};
			}
		}).then((result) => {
			if (result.isConfirmed && result.value) {
				date = result.value.date;
				startTime = result.value.startTime;
				endTime = result.value.endTime;
				zoomLink = result.value.zoomLink;
				maxStudents = result.value.maxStudents;

				handleAddAvailability();
			}
		});
	};
</script>

<div class="p-6 md:p-10">
	<div class="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
		<h1 class="text-4xl font-bold text-center">Your Availability</h1>
		<button
			class="w-full md:w-auto rounded-full bg-[#334EAC90] px-6 py-3 text-white font-semibold shadow-lg hover:bg-[#334EAC] transition-transform hover:scale-105"
			onclick={showAddModal}>+ Add New Availability</button
		>
	</div>

	{#if message}
		<div
			class="mb-6 rounded-lg bg-green-100 p-4 text-center font-semibold text-green-800 transition-opacity"
		>
			{message}
		</div>
	{/if}

	<!-- Availability List Container -->
	<div class="space-y-4">
		<!-- Header for Desktop View -->
		<div
			class="hidden md:flex rounded-xl border-1 border-[#081F5C5A] bg-[#0000005A] inset-shadow-[0px_0px_5px_8px_000000] p-4 items-center text-white text-lg font-bold gap-4"
		>
			<div class="flex-1">Date & Time</div>
			<div class="flex-1">Meeting Link</div>
			<div class="w-48 text-center">Students</div>
			<div class="w-64 text-right">Actions</div>
		</div>

		<!-- List of Availability Slots -->
		{#if availability.length === 0}
			<div
				class="text-center text-gray-500 font-medium p-10 border-2 border-dashed border-gray-300 rounded-xl"
			>
				<p>You haven't added any availability slots yet.</p>
				<p>Click the button above to get started!</p>
			</div>
		{/if}

		{#each availability as ava}
			{@const baseClasses =
				'rounded-2xl p-4 flex flex-col md:flex-row md:items-center text-black text-lg font-semibold mt-4 gap-4 transition-all duration-300'}

			{@const defaultClasses =
				'border-1 border-[#334EAC59] bg-[#334EAC59] inset-shadow-[0px_0px_5px_8px_#d0d7f1]'}

			{@const cancelledClasses =
				'border-1 border-[#AC333359] bg-[#AC333359] inset-shadow-[0px_0px_5px_8px_#f1d7d7]'}

			{@const completedClasses =
				'border-1 border-[#33AC4D59] bg-[#33AC4D59] inset-shadow-[0px_0px_5px_8px_#d0f1d7]'}

			<div
				class="{baseClasses} {ava.isCompleted
					? completedClasses
					: ava.isCancelled
						? cancelledClasses
						: defaultClasses}"
			>
				<!-- Date & Time Block -->
				<div class="flex-1">
					<div class="flex items-center gap-2">
						<span class="font-bold text-gray-700 text-xl">{ava.date}</span>
					</div>
					<div class="text-gray-600 font-medium text-base">{ava.startTime} - {ava.endTime}</div>
				</div>

				<!-- Zoom Link -->
				<div class="flex-1 truncate">
					<a
						href={ava.zoomLink}
						class="text-blue-600 hover:underline font-medium text-base"
						target="_blank"
						rel="noopener noreferrer">{ava.zoomLink || 'No link provided'}</a
					>
				</div>

				<!-- Students -->
				<div class="w-48 text-left md:text-center">
					<span class="font-bold text-gray-600 md:hidden">Students: </span>
					<span class="text-gray-800"
						>{ava.studentCount} / <span class="font-bold">{ava.maxStudents}</span></span
					>
				</div>

				<!-- Actions -->
				<div class="w-64 flex flex-wrap gap-2 justify-start md:justify-end items-center">
					{#if ava.isCompleted}
						<span
							class="font-bold text-green-700 px-3 py-1 text-sm rounded-full bg-green-200"
							>Completed</span
						>
					{:else if parseThaiDate(ava.date) < new Date() && !ava.isCancelled || (parseThaiDate(ava.date).toDateString() === new Date().toDateString() && ava.endTime <= nowtime() && !ava.isCancelled)}
						<button
							class="rounded-full bg-green-500 px-4 py-2 text-sm text-white font-bold hover:bg-green-600 transition"
							onclick={() => {
								showCompleteModal = true;
								completeAvailabilityId = ava.id;
							}}>Complete</button
						>
					{:else if ava.isCancelled}
						<span class="font-bold text-red-700 px-3 py-1 text-sm rounded-full bg-red-200"
							>Cancelled</span
						>
					{:else if ava.studentCount > 0}
						<button
							class="rounded-full bg-gray-500 px-4 py-2 text-sm text-white font-bold hover:bg-gray-600 transition"
							onclick={() => {
								showCancelModal = true;
								cancelAvailabilityId = ava.id;
							}}>Cancel</button
						>
					{:else}
						<button
							class="rounded-full bg-yellow-500 px-4 py-2 text-sm text-white font-bold hover:bg-yellow-600 transition"
							onclick={() => {
								showEditModal = true;
								editAvailability = ava;
								const [day, month, year] = ava.date.split('/');
								editAvailabilityDate = `${Number(year) - 543}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
								editAvailabilityStartTime = ava.startTime;
								editAvailabilityEndTime = ava.endTime;
								editAvailabilityZoomLink = ava.zoomLink || '';
								editAvailabilityMaxStudents = ava.maxStudents;
							}}>Edit</button
						>
						<button
							class="rounded-full bg-red-500 px-4 py-2 text-sm text-white font-bold hover:bg-red-600 transition"
							onclick={() => handleDeleteAvailability(ava.id, ava.studentCount)}>Delete</button
						>
					{/if}
				</div>
			</div>
		{/each}
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
