import prisma from '$lib/server/prisma';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user) {
        return { history: [] };
    }

    const history = await prisma.booking.findMany({
        where: { studentId: locals.user.id, status: 'COMPLETED' },
        include: { availability: true, reviews: true },
    });

    return {
        history
    };
}