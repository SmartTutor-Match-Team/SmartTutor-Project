import type { RequestHandler } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';

export const POST: RequestHandler = async ({ request, cookies }) => {
    try {
        const contentType = (request.headers.get('content-type') || '').toLowerCase();

        let date: string | undefined;
        let startTime: string | undefined;
        let endTime: string | undefined;
        let zoomLink: string | undefined;
        let maxStudents: number | undefined;

        if (contentType.includes('application/json')) {
            const json = await request.json();
            date = json.date;
            startTime = json.startTime;
            endTime = json.endTime;
            zoomLink = json.zoomLink;
            maxStudents = json.maxStudents !== undefined ? Number(json.maxStudents) : undefined;
        } else {
            const formData = await request.formData();
            date = formData.get('date') as string;
            startTime = formData.get('startTime') as string;
            endTime = formData.get('endTime') as string;
            zoomLink = formData.get('zoomLink') as string;
            maxStudents = parseInt(formData.get('maxStudents') as string, 10);
        }

        if (!date || !startTime || !endTime || !zoomLink || maxStudents === undefined || Number.isNaN(maxStudents)) {
            return new Response(JSON.stringify({ message: 'Invalid input' }), { status: 400 });
        }

        const tutorId = cookies.get('profileId');
        console.log('[POST /availability] profileId cookie:', tutorId);

        if (!tutorId) {
            return new Response(JSON.stringify({ message: 'Tutor ID is required' }), { status: 400 });
        }

        const parsedDate = new Date(`${date}T00:00:00+07:00`);
        const parsedStartTime = new Date(`${date}T${startTime}:00+07:00`);
        const parsedEndTime = new Date(`${date}T${endTime}:00+07:00`);

        if (isNaN(parsedDate.getTime()) || isNaN(parsedStartTime.getTime()) || isNaN(parsedEndTime.getTime())) {
            return new Response(JSON.stringify({ message: 'Invalid date or time' }), { status: 400 });
        }

        const created = await prisma.availability.create({
            data: {
                date: parsedDate,
                startTime: parsedStartTime,
                endTime: parsedEndTime,
                zoomLink,
                maxStudents,
                tutor: { connect: { id: tutorId } }
            }
        });

        return new Response(JSON.stringify({ message: 'Availability added successfully', id: created.id }), { status: 200 });
    } catch (err) {
        console.error('[POST /availability] error:', err);
        return new Response(JSON.stringify({ message: 'Failed to add availability' }), { status: 500 });
    }
};
