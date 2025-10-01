<script lang="ts">
    import type { PageProps } from './$types';
    import swal from 'sweetalert2';
    let { data }: PageProps = $props();

    const availability = $state(data.availability || []) as unknown as {
        id: string;
        createdAt: Date;
        date: string;
        startTime: string;
        endTime: string;
        tutorId: string;
        zoomLink: string | null;
        maxStudents: number;
        isCancelled: boolean;
        isCompleted: boolean;
        studentCount: number;
    }[];
    
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

    const showDetailModal = (booking: {
        id: string;
        createdAt: Date;
        date: string;
        startTime: string;
        endTime: string;
        tutorId: string;
        zoomLink: string | null;
        maxStudents: number;
        isCancelled: boolean;
        isCompleted: boolean;
        studentCount: number;
    }) => {
        swal.fire({
            title: 'Session Details',
            html: `
            <div class="text-left">
                <p><strong>Date:</strong> ${booking.date}</p>
                <p><strong>Time:</strong> ${booking.startTime} - ${booking.endTime}</p>
                <p><strong>Students:</strong> ${booking.studentCount}/${booking.maxStudents}</p>
                <p><strong>Zoom Link:</strong> <a href="${booking.zoomLink}" target="_blank" rel="noopener noreferrer">${booking.zoomLink}</a></p>
                <p><strong>Status:</strong> ${booking.isCancelled ? 'Cancelled' : booking.isCompleted ? 'Completed' : (parseThaiDate(booking.date) < new Date() || (parseThaiDate(booking.date).toDateString() === new Date().toDateString() && booking.endTime < nowtime())) ? 'Completed' : 'Upcoming'}</p>
            </div>
            `,
            icon: 'info',
            confirmButtonText: 'Close',
        });
    };
</script>
<div class="container mx-auto p-4">
    <h1 class="text-5xl font-bold text-center mb-8">Booked Sessions</h1>
    <p class="text-3xl font-semibold">Welcome, {data.users.name}!</p>
    <p class="text-xl opacity-40">Your booked sessions will be displayed here.</p>
    <div class="flex flex-col mb-8">
        {#each availability as ava}
                <!-- date, time, student count, zoomLink -->
                {#if (!ava.isCompleted && !ava.isCancelled)}
					<div class="w-full rounded-3xl border-1 border-[#334EAC59] bg-[#334EAC59] inset-shadow-[0px_0px_5px_8px_#d0d7f1] p-4 mx-auto top-5 flex flex-wrap justify-around items-center text-black text-xl font-semibold mt-4 gap-4">
						<p class="">{ava.date}</p>
                        <p class="">{ava.startTime} - {ava.endTime}</p>
                        <p class="">Students: {ava.studentCount}/{ava.maxStudents}</p>
                        <p class="">Zoom Link: <a href="{ava.zoomLink}" class="text-blue-500 underline" target="_blank" rel="noopener noreferrer">{ava.zoomLink}</a></p>
                        <button class="px-6 py-2 rounded-4xl border-1 border-[#E7F1FF5A] inset-shadow-[1px_2px_5px_2px_#ffffff] hover:bg-[#E7F1FF5A] hover:text-[#334EAC] transition-colors" onclick={() => showDetailModal(ava)}>DETAILS</button>
					</div>
                {/if}
        {/each}
    </div>
</div>