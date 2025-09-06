import type { Handle } from "@sveltejs/kit";
import { verifyJwt } from "$lib/server/jwt";
import prisma from "$lib/server/prisma";

export const handle: Handle = async ({ event, resolve }) => {
  const token = event.cookies.get("auth_token");

  event.locals.user = null; // default

  if (token) {
    try {
      const payload = await verifyJwt(token);
      // ดึงผู้ใช้จาก DB เพื่อความสดใหม่ของข้อมูล/role
      const user = await prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, name: true, email: true, role: true, image: true }
      });
      if (user) {
        event.locals.user = user;

        if (user.role == 'TUTOR') {
          const profileId = event.cookies.get('profileId');
          event.locals.profile = null;
          if (profileId) {
            const profile = await prisma.tutorProfile.findUnique({ where: { id: profileId } });
            if (profile) event.locals.profile = profile;
          }
        }
      }

    } catch {
      // โทเค็นไม่ถูกต้อง/หมดอายุ → ลบทิ้ง
      event.cookies.delete("auth_token", { path: "/" });
    }
  }

  return resolve(event);
};
