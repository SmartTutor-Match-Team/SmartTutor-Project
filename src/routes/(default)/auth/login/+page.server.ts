import type { Actions } from "@sveltejs/kit";
import prisma from "$lib/server/prisma";
import { signJwt } from "$lib/server/jwt";
import { fail, redirect } from "@sveltejs/kit";
import bcrypt from "bcryptjs";

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const data = await request.formData();
    const email = (data.get("email") || "").toString().toLowerCase().trim();
    const password = (data.get("password") || "").toString();

    if (!email || !password) {
      return fail(400, { message: "กรอกข้อมูลให้ครบถ้วน" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return fail(400, { message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return fail(400, { message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });

    const token = await signJwt({
      sub: user.id,
      email: user.email,
      role: user.role
    });

    // ตั้งค่า cookie แบบปลอดภัย
    cookies.set("auth_token", token, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      // อายุคุกกี้ (ให้พอดีกับ exp ของ JWT)
      maxAge: 60 * 60 * 24 * 7 // 7 วัน
    });

    throw redirect(303, "/");
  }
};
