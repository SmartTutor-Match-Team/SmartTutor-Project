import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user) return new Response("Unauthorized", { status: 401 });
  return new Response(JSON.stringify({ message: "ok", user: locals.user }), {
    headers: { "content-type": "application/json" }
  });
};
