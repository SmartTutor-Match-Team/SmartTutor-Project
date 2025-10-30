import type { RequestHandler } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';
import { json } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, cookies }) => {
    try {
        const body = await request.json();
        const { profileId } = body;
        console.log('[selectProfile] body:', body);

        if (!profileId) {
            return json({ message: 'Profile ID is required' }, { status: 400 });
        }

        const profile = await prisma.tutorProfile.findUnique({ where: { id: profileId } });

        if (!profile) {
            console.warn('[selectProfile] profile not found for id:', profileId);
            return json({ message: 'Profile not found' }, { status: 404 });
        } else {
            cookies.set('profileId', profile.id, {
                path: '/',
                httpOnly: true,
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production'
            });
            console.log('[selectProfile] set profileId cookie:', profile.id);
            return json({ message: 'Success' }, { status: 200 });
        }
    } catch (error) {
        console.error(error);
        return json({ message: 'Internal server error' }, { status: 500 });
    }
};
