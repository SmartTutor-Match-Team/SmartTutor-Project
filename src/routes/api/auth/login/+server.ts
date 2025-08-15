import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import prisma from '$lib/server/prisma'
import bcrypt from 'bcrypt';
import { signJwt } from "$lib/server/jwt";


export const POST: RequestHandler = async ({ request, cookies }) => {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return json({ message: 'All fields are required' }, { status: 400 });
        }

        // หา user
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return json({ message: 'User not found' }, { status: 401 });
        }

        // ตรวจสอบรหัสผ่าน
        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
            return json({ message: 'Invalid password' }, { status: 401 });
        }

        // สร้าง token
        const token = await signJwt({ sub: user.id, email: user.email, role: user.role });

        cookies.set("auth_token", token, {
            path: "/",
            httpOnly: true, // JS อ่านไม่ได้
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24 * 7 // 7 วัน
        });

        return json({ message: 'Login successful' }, { status: 200 });
    } catch (error) {
        console.error(error);
        return json({ message: 'Internal server error' }, { status: 500 });
    }
};
