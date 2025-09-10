
import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ request, locals }) => {
    if (locals.user === null) {
        throw redirect(302, '/auth/login');
    }

    if (locals.user.role != 'STUDENT') {
        redirect(302, '/')
    }

    return {
        users: locals.user,
    };
};