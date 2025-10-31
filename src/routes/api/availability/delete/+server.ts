import type { RequestHandler } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const contentType = (request.headers.get('content-type') || '').toLowerCase();
    let id: string | undefined;

    if (contentType.includes('application/json')) {
      const json = await request.json();
      id = json.id;
    } else {
      const form = await request.formData();
      id = form.get('id') as string;
    }

    if (!id) return new Response(JSON.stringify({ message: 'Invalid request' }), { status: 400 });

    await prisma.availability.delete({ where: { id } });

    return new Response(JSON.stringify({ message: 'Availability deleted successfully' }), { status: 200 });
  } catch (err) {
    console.error('[POST /api/availability/delete] error:', err);
    return new Response(JSON.stringify({ message: 'Failed to delete availability' }), { status: 500 });
  }
};
