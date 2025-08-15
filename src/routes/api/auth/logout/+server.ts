import { json, type RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ cookies }) => {
  try {
    cookies.delete("auth_token", { path: "/" });
    return json({ message: 'Logout successful' }, { status: 200 });
  } catch {
    return json({ message: 'Logout failed' }, { status: 500 });
  }
};
