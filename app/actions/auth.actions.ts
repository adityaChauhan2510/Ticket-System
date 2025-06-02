"use server";
import { prisma } from "../db/prisma";
import bcrypt from "bcryptjs";
import { logEvent } from "../utils/sentry";
import { removeAuthCookie, setAuthCookie, signAuthToken } from "../lib/auth";

type ResponseResult = {
  success: boolean;
  message: string;
};

export const registerUser = async (
  prevState: ResponseResult,
  formData: FormData
): Promise<ResponseResult> => {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!name || !email || !password) {
      logEvent(
        "Validation error: Missing register fields",
        "auth",
        { name, email },
        "warning"
      );
      return { success: false, message: "All fields are required" };
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      logEvent(
        `Registration failed: User already exists - ${email}`,
        "auth",
        { email },
        "warning"
      );
      return { success: false, message: "User already exists" };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Sign and set auth token
    const token = await signAuthToken({ userId: user.id });
    await setAuthCookie(token);

    logEvent(
      `User registered succcessfully: ${email}`,
      "auth",
      { userId: user.id, email },
      "info"
    );
    return { success: true, message: "Registration successful" };
  } catch (error) {
    logEvent(
      "Unexpected error during registration",
      "auth",
      {},
      "error",
      error
    );
    return {
      success: false,
      message: "Something went wrong, please try again",
    };
  }
};

//logout user and remove auth cookie
export const logoutUser = async (): Promise<ResponseResult> => {
  try {
    await removeAuthCookie();
    logEvent("User logged out successfully", "auth", {}, "info");
    return { success: true, message: "Logout successfully." };
  } catch (error) {
    logEvent("Unexpected error during logout ", "auth", {}, "error", error);
    return {
      success: false,
      message: "Something went wrong, please try again.",
    };
  }
};

export const loginUser = async (
  prevState: ResponseResult,
  formData: FormData
): Promise<ResponseResult> => {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      logEvent(
        "Validation error: Missing login fields",
        "auth",
        { email },
        "warning"
      );
      return { success: false, message: "Email and password are required" };
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      logEvent(
        `Login Failed: User not found - ${email}`,
        "auth",
        { email },
        "warning"
      );

      return { success: false, message: "Invalid email or password" };
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      logEvent(
        "Login Failed: Incorrect password",
        "auth",
        { email },
        "warning"
      );

      return { success: false, message: "Invalid email or password" };
    }

    const token = await signAuthToken({ userId: user.id });
    await setAuthCookie(token);

    return { success: true, message: "Login successful" };
  } catch (error) {
    logEvent("Unexpected error during login", "auth", {}, "error", error);

    return { success: false, message: "Error during log in" };
  }
};
