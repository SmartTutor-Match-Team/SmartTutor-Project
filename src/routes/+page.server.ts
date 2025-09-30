import { redirect } from '@sveltejs/kit';

export async function load({ locals }: { locals: { user?: any } }) {

    if (!locals.user) {
        throw redirect(302, "/landing");
    }

    if (locals.user.role == 'TUTOR') {
        throw redirect(302, '/selectProfile');
    }

    if (locals.user.role == 'STUDENT') {
        throw redirect(302, '/dashboard');
    }

    const users = locals.user;

    return {
        users
    };
}
