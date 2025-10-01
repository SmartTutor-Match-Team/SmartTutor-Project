import prisma from '$lib/server/prisma';

export async function load({ locals }: { locals: any }) {
    if (!locals.user) {
        return { bookings: [] };
    }
    const bookings = await prisma.booking.findMany({
        where: { studentId: locals.user.id },
        include: { availability: {
            include: { tutor: {
                include: { user: true }
            }, bookings: true }
        }, reviews: true },
    });
    return {
        bookings
    };
}