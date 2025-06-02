"use client";
import { loginUser } from "@/app/actions/auth.actions";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";

const LoginForm = () => {
  const router = useRouter();

  const initialState = {
    success: false,
    message: "",
  };

  const [state, formAction] = useActionState(loginUser, initialState);

  useEffect(() => {
    if (state.success) {
      toast.success("Login successful!");
      router.push("/tickets");
    } else if (state.message) {
      toast.error(state.message);
    }
  }, [state, router]);
  return (
    <form action={formAction} className="space-y-4 text-gray-700">
      <input
        className="w-full border border-gray-200 p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        type="email"
        name="email"
        placeholder="Your Email"
        autoComplete="email"
        required
      />
      <input
        className="w-full border border-gray-200 p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        type="password"
        name="password"
        placeholder="Password"
        autoComplete="new-password"
        required
      />
      <button
        className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 transition disabled:opacity-50"
        type="submit"
      >
        Login
      </button>
    </form>
  );
};

export default LoginForm;
