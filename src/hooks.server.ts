import type { Handle } from "@sveltejs/kit";
import { verifyJwt } from "$lib/server/jwt";
import prisma from "$lib/server/prisma";

export const handle: Handle = async ({ event, resolve }) => {
  const token = event.cookies.get("auth_token");
  event.locals.user = null;
  event.locals.profile = null;

  if (token) {
    try {
      const payload = await verifyJwt(token);

      const user = await prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, name: true, email: true, role: true, image: true }
      });

      if (user) {
        event.locals.user = user;

        if (user.role === "TUTOR") {
          const profileId = event.cookies.get("profileId");

          let profile = null;
          if (profileId) {
            profile = await prisma.tutorProfile.findFirst({
              where: { id: profileId, userId: user.id }
            });
          }

          if (!profile) {
            profile = await prisma.tutorProfile.findFirst({ where: { userId: user.id } });
          }

          if (profile) {
            event.locals.profile = profile;
            event.cookies.set("profileId", profile.id, { path: "/", httpOnly: true });
          } else {
            event.cookies.delete("profileId", { path: "/" });
          }
        }
      }
    } catch {
      event.cookies.delete("auth_token", { path: "/" });
      event.cookies.delete("profileId", { path: "/" });
    }
  }

  return resolve(event);
};
