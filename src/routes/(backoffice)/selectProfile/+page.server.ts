import prisma from '$lib/server/prisma';
import { redirect } from '@sveltejs/kit';

export async function load({ locals }: { locals: { user?: any } }) {
    const profiles = await prisma.tutorProfile.findMany({
        where: {
            userId: locals.user.id
        }
    });

    if (profiles.length === 0) {
        throw redirect(302, '/createProfile');
    }

    return { profiles }
}