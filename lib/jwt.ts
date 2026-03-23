import { SignJWT, jwtVerify } from 'jose';
import { env } from './env';

const secret = new TextEncoder().encode(env.JWT_SECRET);

export type SessionJwt = {
  userId: string;
  tokenId: string;
  email: string;
};

export async function signSession(payload: SessionJwt) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
}

export async function verifySession(token: string) {
  const result = await jwtVerify<SessionJwt>(token, secret);
  return result.payload;
}
