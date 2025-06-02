import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { logEvent } from "../utils/sentry";

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET);
const cookieName = "auth_token";

// ENCRYPT AND SIGN TOKEN
export const signAuthToken = async (payload: any) => {
  try {
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(SECRET_KEY);

    return token;
  } catch (error) {
    logEvent("Token signing failed", "auth", { payload }, "error", error);
    throw new Error("Token Signing Failed");
  }
};

// DECRYPT AND VERIFY TOKEN
export const verifyAuthToken = async <T>(token: string): Promise<T> => {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as T;
  } catch (error) {
    logEvent(
      "Token decryption failed",
      "auth",
      { tokenSnippet: token.slice(0, 10) },
      "error",
      error
    );
    throw new Error("Token Decryption Failed");
  }
};

// SET AUTH  COOKIE
export const setAuthCookie = async (token: string) => {
  try {
    const cookieStore = await cookies();
    cookieStore.set(cookieName, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
  } catch (error) {
    logEvent("Failed to set cookie", "auth", { token }, "error", error);
  }
};

// GET AUTH TOKEN FROM COOKIE
export const getAuthCookie = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(cookieName)?.value;
  return token;
};

// REMOVE AUTH TOKEN COOKIE
export const removeAuthCookie = async () => {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(cookieName);
  } catch (error) {
    logEvent("Failed to remove cookie", "auth", {}, "error", error);
  }
};
