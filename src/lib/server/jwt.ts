import { SignJWT, jwtVerify } from "jose";
import { JWT_SECRET, JWT_EXPIRES_IN } from "$env/static/private";

const secret = new TextEncoder().encode(JWT_SECRET);

type JwtPayload = {
  sub: string;         // user id
  email: string;
  role: string;
};

export async function signJwt(payload: JwtPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN || "7d")
    .sign(secret);
}

export async function verifyJwt(token: string) {
  const { payload } = await jwtVerify(token, secret, {
    algorithms: ["HS256"]
  });
  return payload as JwtPayload;
}
