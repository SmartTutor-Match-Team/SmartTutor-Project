import type { Actions } from "@sveltejs/kit";
import prisma from "$lib/server/prisma";
import { fail, redirect } from "@sveltejs/kit";
import bcrypt from "bcryptjs";

export const actions: Actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    const name = (data.get("name") || "").toString().trim();
    const email = (data.get("email") || "").toString().toLowerCase().trim();
    const password = (data.get("password") || "").toString();
    const role = (data.get("role") || "STUDENT").toString(); // "STUDENT" | "TUTOR"

    if (!name || !email || !password || !role) {
      return fail(400, { message: "กรอกข้อมูลให้ครบถ้วน" });
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return fail(400, { message: "อีเมลนี้ถูกใช้แล้ว" });

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: { name, email, passwordHash, role: role === "TUTOR" ? "TUTOR" : "STUDENT" }
    });

    throw redirect(303, "/auth/login");
  }
};
