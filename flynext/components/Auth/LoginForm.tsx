"use client";
import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserContext } from "@/contexts/UserContext";

const LoginForm = () => {
  const router = useRouter();
  const { login } = useUserContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Check for redirect after login
  const [redirectPath, setRedirectPath] = useState("/");
  
  useEffect(() => {
    // Check if there's a redirect path stored in session
    const storedRedirect = sessionStorage.getItem("redirectAfterLogin");
    if (storedRedirect) {
      setRedirectPath(storedRedirect);
    }
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Use the login function from UserContext
      await login(formData.email, formData.password);

      // Clear the redirect path from session storage
      const redirect = redirectPath;
      sessionStorage.removeItem("redirectAfterLogin");

      // Redirect to the stored path or home page
      router.push(redirect);
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to log in. Please check your credentials."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full"
      autoComplete="on"
      method="post"
      name="loginForm"
      id="loginForm"
    >
      {/* Thin separator line */}
      <div className="border-b border-border mb-3"></div>

      {error && (
        <div
          className="bg-destructive/10 border border-destructive/30 text-destructive px-3 py-2 rounded mb-3 text-sm"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Email */}
      <div className="mb-3">
        <div className="relative border border-border rounded-lg overflow-visible">
          <label
            htmlFor="emailAddress"
            className="absolute top-1 left-3 text-muted-foreground text-xs z-10"
          >
            Email
          </label>
          <input
            type="email"
            id="emailAddress"
            name="email"
            autoComplete="email username"
            className="w-full pt-5 px-3 pb-1 bg-transparent focus:outline-none text-foreground text-sm z-20"
            value={formData.email}
            onChange={handleChange}
            required
            autoCapitalize="off"
            spellCheck={false}
          />
        </div>
      </div>

      {/* Password */}
      <div className="mb-4">
        <div className="relative border border-border rounded-lg">
          <label
            htmlFor="current-password"
            className="absolute top-1 left-3 text-muted-foreground text-xs"
          >
            Password
          </label>
          <input
            type="password"
            id="current-password"
            name="password"
            autoComplete="current-password"
            className="w-full pt-5 px-3 pb-1 bg-transparent focus:outline-none text-foreground text-sm"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      {/* Submit button */}
      <button
        type="submit"
        className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-medium hover:bg-primary/90 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isLoading}
      >
        {isLoading ? "Logging in..." : "Continue"}
      </button>

      {/* Signup link */}
      <div className="text-center mt-3">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <a href="/signup" className="text-primary hover:text-primary/80">
            Sign up
          </a>
        </p>
      </div>
    </form>
  );
};

export default LoginForm;