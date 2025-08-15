import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import bcrypt from 'bcrypt';
import { signJwt } from "$lib/server/jwt";
import prisma from '$lib/server/prisma';

export const POST: RequestHandler = async ({ request, cookies }) => {
    try {
        const { name, email, password, role } = await request.json();

        if (!name || !email || !password) {
            return json({ message: 'All fields are required' }, { status: 400 });
        }

        // เช็คว่ามี email อยู่แล้วหรือยัง
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return json({ message: 'Email already exists' }, { status: 400 });
        }

        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // สร้าง user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash: hashedPassword,
                role
            }
        });

        // สร้าง JWT token
        // const token = await signJwt({ sub: user.id, email: user.email, role: user.role });

        // cookies.set("auth_token", token, {
        //     path: "/",
        //     httpOnly: true, // JS อ่านไม่ได้
        //     sameSite: "lax",
        //     secure: process.env.NODE_ENV === "production",
        //     maxAge: 60 * 60 * 24 * 7 // 7 วัน
        // });

        return json({ message: 'User registered successfully' }, { status: 201 });
    } catch (error) {
        console.error(error);
        return json({ message: 'Internal server error' }, { status: 500 });
    }
};
