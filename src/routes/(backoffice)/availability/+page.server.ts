import prisma from '$lib/server/prisma';
import type { Actions } from './$types';

export const actions: Actions = {
    create: async ({ request, cookies }) => {
        const formData = await request.formData();

        const date = formData.get('date') as string;
        const startTime = formData.get('startTime') as string;
        const endTime = formData.get('endTime') as string;
        const zoomLink = formData.get('zoomLink') as string;
        const maxStudents = parseInt(formData.get('maxStudents') as string, 10);

        if (!date || !startTime || !endTime || !zoomLink || isNaN(maxStudents)) {
            return { success: false, message: 'Invalid input' };
        }

        const tutorId = cookies.get('profileId');

        if (!tutorId) {
            return { success: false, message: 'Tutor ID is required' };
        }

        const parsedDate = new Date(`${date}T00:00:00+07:00`);
        const parsedStartTime = new Date(`${date}T${startTime}:00+07:00`);
        const parsedEndTime = new Date(`${date}T${endTime}:00+07:00`);

        if (isNaN(parsedDate.getTime()) || isNaN(parsedStartTime.getTime()) || isNaN(parsedEndTime.getTime())) {
            return { success: false, message: 'Invalid date or time' };
        }

        await prisma.availability.create({
            data: {
                date: parsedDate,
                startTime: parsedStartTime,
                endTime: parsedEndTime,
                zoomLink,
                maxStudents,
                tutor: {
                    connect: { id: tutorId }
                }
            }
        });

        return { success: true, message: 'Availability added successfully' };
    },

    delete: async ({ request }) => {
        const formData = await request.formData();
        const id = formData.get('id') as string;

        if (!id) {
            return { success: false, message: 'Invalid request' };
        }

        try {
            await prisma.availability.delete({
                where: { id }
            });

            return { success: true, message: 'Availability deleted successfully' };
        } catch (err) {
            console.error(err);
            return { success: false, message: 'Failed to delete availability' };
        }
    }
};

export async function load({ cookies }: { cookies: any }) {
    // get now student count from booking
    const availability = await prisma.availability.findMany({
        where: {
            tutorId: cookies.get('profileId')
        },
        orderBy: [
            { date: 'asc' },
            { startTime: 'asc' }
        ]
    });

    // count booking this availability
    const bookings = await prisma.booking.findMany({
        where: {
            availabilityId: {
                in: availability.map(av => av.id)
            },
            status: 'COMPLETED'
        }
    });

    // Map student count to each availability
    const availabilityWithStudentCount = availability.map(av => {
        const studentCount = bookings.filter(b => b.availabilityId === av.id).length;

        // ✅ แปลงเป็น timezone ไทย
        const date = new Date(av.date).toLocaleDateString('th-TH', {
            timeZone: 'Asia/Bangkok'
        });

        const startTime = new Date(av.startTime).toLocaleTimeString('th-TH', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Bangkok'
        });

        const endTime = new Date(av.endTime).toLocaleTimeString('th-TH', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Bangkok'
        });

        return { ...av, studentCount, date, startTime, endTime };
    });


    return { availability: availabilityWithStudentCount };
}
