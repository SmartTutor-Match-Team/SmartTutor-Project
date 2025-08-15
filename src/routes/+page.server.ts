import { redirect } from '@sveltejs/kit';

export async function load({ locals }) {

    if (!locals.user) {
        throw redirect(302, "/auth/login");
    }

    const users = locals.user;

    return {
        users
    };
}
