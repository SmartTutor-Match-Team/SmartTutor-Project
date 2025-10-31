import type { RequestHandler } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const contentType = (request.headers.get('content-type') || '').toLowerCase();
    let id: string | undefined;
    let vdoLink: string | undefined;

    if (contentType.includes('application/json')) {
      const json = await request.json();
      id = json.id;
      vdoLink = json.vdoLink;
    } else {
      const form = await request.formData();
      id = form.get('id') as string;
      vdoLink = form.get('vdoLink') as string;
    }

    if (!id) return new Response(JSON.stringify({ message: 'Invalid request' }), { status: 400 });

    await prisma.booking.updateMany({
      where: { availabilityId: id, status: 'BOOKED' },
      data: { status: 'COMPLETED', videoLink: vdoLink }
    });

    return new Response(JSON.stringify({ message: 'Availability completed successfully' }), { status: 200 });
  } catch (err) {
    console.error('[POST /api/availability/complete] error:', err);
    return new Response(JSON.stringify({ message: 'Failed to complete availability' }), { status: 500 });
  }
};
