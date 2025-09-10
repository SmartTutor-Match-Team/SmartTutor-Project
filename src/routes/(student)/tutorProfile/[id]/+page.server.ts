import prisma from '$lib/server/prisma';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
    const tutor = await prisma.tutorProfile.findUnique({
        where: { id: params.id },
        include: {
            user: {
                select: { name: true, id: true, email: true }
            },
            review: {
                include: {
                    reviewer: { select: { name: true, id: true } }
                }
            }
        }
    });

    if (!tutor) throw new Error('Tutor not found');

    let availabilities = await prisma.availability.findMany({
        where: {
            tutorId: tutor.id,
            date: { gte: new Date() },
            startTime: { gte: new Date() }
        },
        include: {
            bookings: { where: { status: 'BOOKED' } }
        },
        orderBy: [
            { date: 'asc' },
            { startTime: 'asc' }
        ]
    });

    const avgRating =
        tutor.review.length > 0
            ? tutor.review.reduce((sum, r) => sum + r.rating, 0) / tutor.review.length
            : 0;

    return {
        tutor: { ...tutor, availabilities, avgRating }
    };
};
