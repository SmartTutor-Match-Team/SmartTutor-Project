import type { RequestHandler } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const contentType = (request.headers.get('content-type') || '').toLowerCase();
    let id: string | undefined;
    let date: string | undefined;
    let startTime: string | undefined;
    let endTime: string | undefined;
    let zoomLink: string | undefined;
    let maxStudents: number | undefined;

    if (contentType.includes('application/json')) {
      const json = await request.json();
      id = json.id;
      date = json.date;
      startTime = json.startTime;
      endTime = json.endTime;
      zoomLink = json.zoomLink;
      maxStudents = json.maxStudents !== undefined ? Number(json.maxStudents) : undefined;
    } else {
      const form = await request.formData();
      id = form.get('id') as string;
      date = form.get('date') as string;
      startTime = form.get('startTime') as string;
      endTime = form.get('endTime') as string;
      zoomLink = form.get('zoomLink') as string;
      maxStudents = parseInt(form.get('maxStudents') as string, 10);
    }

    if (!id || !date || !startTime || !endTime || maxStudents === undefined || Number.isNaN(maxStudents)) {
      return new Response(JSON.stringify({ message: 'Invalid input' }), { status: 400 });
    }

    const parsedDate = new Date(`${date}T00:00:00+07:00`);
    const parsedStartTime = new Date(`${date}T${startTime}:00+07:00`);
    const parsedEndTime = new Date(`${date}T${endTime}:00+07:00`);

    if (isNaN(parsedDate.getTime()) || isNaN(parsedStartTime.getTime()) || isNaN(parsedEndTime.getTime())) {
      return new Response(JSON.stringify({ message: 'Invalid date or time' }), { status: 400 });
    }

    await prisma.availability.update({
      where: { id },
      data: {
        date: parsedDate,
        startTime: parsedStartTime,
        endTime: parsedEndTime,
        zoomLink,
        maxStudents
      }
    });

    return new Response(JSON.stringify({ message: 'Availability updated successfully' }), { status: 200 });
  } catch (err) {
    console.error('[POST /api/availability/edit] error:', err);
    return new Response(JSON.stringify({ message: 'Failed to update availability' }), { status: 500 });
  }
};
