import { redirect } from '@sveltejs/kit';

export async function load({ locals }: { locals: { user?: any } }) {

    if (!locals.user) {
        throw redirect(302, "/landing");
    }

    const users = locals.user;

    return {
        users
    };
}
