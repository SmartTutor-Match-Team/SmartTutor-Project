<script lang="ts">
	import { invalidateAll } from '$app/navigation';

	const { data } = $props();

	let availability = $state(data.availability || []);

	$effect(() => {
		availability = data.availability || [];
	});

	let date = $state('');
	let startTime = $state('');
	let endTime = $state('');
	let zoomLink = $state('');
	let maxStudents = $state('');

	let message = $state('');

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
							<button class="rounded-full bg-red-500 px-3 py-1 text-white" onclick={() => handleDeleteAvailability(ava.id, ava.studentCount)}>Delete</button>
							<!-- later: แก้ไข, cancel -->
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
