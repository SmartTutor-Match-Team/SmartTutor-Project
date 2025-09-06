import type { RequestHandler } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';
import { json } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, cookies }) => {
    try {
        const { profileId } = await request.json();

        if (!profileId) {
            return json({ message: 'Profile ID is required' }, { status: 400 });
        }

        const profile = await prisma.tutorProfile.findUnique({ where: { id: profileId } });

        if (!profile) {
            return json({ message: 'Profile not found' }, { status: 404 });
        } else {
            cookies.set('profileId', profile.id, {
                path: '/',
                httpOnly: true
            });
            return json({ message: 'Success' }, { status: 200 });
        }
    } catch (error) {
        console.error(error);
        return json({ message: 'Internal server error' }, { status: 500 });
    }
};
