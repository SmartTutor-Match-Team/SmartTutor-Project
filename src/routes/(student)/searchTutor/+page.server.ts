import prisma from '$lib/server/prisma';

export async function load({}: { cookies: any }) {

    // order by rating from table review
    const tutors = await prisma.tutorProfile.findMany(
        {
            include: {
                user: true
            }
        }
    );

    return { tutors }
}
