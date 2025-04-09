"use client";
import React, { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";

const SignupForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    countryCode: "+1",
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Handle phone number formatting
    if (name === "phone") {
      // Remove all non-digit characters
      const digits = value.replace(/\D/g, "");
      
      // Limit to max 10 digits
      const limitedDigits = digits.slice(0, 10);
      
      // Format with dashes
      let formattedValue = limitedDigits;
      if (limitedDigits.length > 3) {
        formattedValue = `${limitedDigits.slice(0, 3)}-${limitedDigits.slice(3)}`;
      }
      if (limitedDigits.length > 6) {
        formattedValue = `${formattedValue.slice(0, 7)}-${formattedValue.slice(7)}`;
      }
      
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    if (name === "password" || name === "confirmPassword") {
      setPasswordError("");
    }
  };

  const validatePasswords = (): boolean => {
    if (formData.password !== formData.confirmPassword) {
      setPasswordError("Passwords don't match");
      return false;
    }
    
    if (formData.password.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
      return false;
    }
    
    return true;
  };

  const validateEmail = (): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Invalid email format");
      return false;
    }
    return true;
  };

  const validatePhone = (): boolean => {
    // Phone is required, so check if it's empty or incomplete
    if (!formData.phone || formData.phone.replace(/\D/g, "").length < 10) {
      setError("Please enter a valid 10-digit phone number");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validatePasswords()) {
      return;
    }

    if (!validateEmail()) {
      return;
    }

    if (!validatePhone()) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const apiFormData = new FormData();

      apiFormData.append("firstName", formData.firstName);
      apiFormData.append("lastName", formData.lastName);
      apiFormData.append("email", formData.email);
      apiFormData.append("password", formData.password);
      
      // Only send phone digits (no dashes)
      const phoneDigits = formData.phone.replace(/\D/g, "");
      apiFormData.append("phone", formData.countryCode + phoneDigits);

      const response = await fetch("/api/users/signup", {
        method: "POST",
        body: apiFormData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      console.log("Signup successful:", data);
      
      // Removed sessionStorage usage - we'll rely on the login process
      // to handle user data storage
      
      // Redirect to login page
      router.push("/login");
    } catch (err) {
      console.error("Signup error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to sign up. Please try again."
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
      name="signupForm"
      id="signupForm"
    >
      {/* Thin separator line with less margin */}
      <div className="border-b border-border mb-3"></div>

      {error && (
        <div
          className="bg-destructive/10 border border-destructive/30 text-destructive px-3 py-2 rounded mb-2 text-sm"
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 mb-3">
        {/* First name - more compact */}
        <div>
          <div className="relative border border-border rounded-lg">
            <label
              htmlFor="firstName"
              className="absolute top-1 left-3 text-muted-foreground text-xs"
            >
              First name
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              autoComplete="given-name"
              className="w-full pt-5 px-3 pb-1 bg-transparent focus:outline-none text-foreground text-sm"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Last name - more compact */}
        <div>
          <div className="relative border border-border rounded-lg">
            <label
              htmlFor="lastName"
              className="absolute top-1 left-3 text-muted-foreground text-xs"
            >
              Last name
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              autoComplete="family-name"
              className="w-full pt-5 px-3 pb-1 bg-transparent focus:outline-none text-foreground text-sm"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>
        </div>
      </div>

      {/* Email - more compact */}
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

      {/* Password field - more compact */}
      <div className="mb-2">
        <div className="relative border border-border rounded-lg">
          <label
            htmlFor="newPassword"
            className="absolute top-1 left-3 text-muted-foreground text-xs"
          >
            Password
          </label>
          <input
            type="password"
            id="newPassword"
            name="password"
            autoComplete="new-password"
            className="w-full pt-5 px-3 pb-1 bg-transparent focus:outline-none text-foreground text-sm"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={8}
          />
        </div>
      </div>

      {/* Confirm Password field - more compact */}
      <div className="mb-3">
        <div
          className={`relative border ${
            passwordError ? "border-destructive" : "border-border"
          } rounded-lg`}
        >
          <label
            htmlFor="confirmPassword"
            className={`absolute top-1 left-3 ${
              passwordError ? "text-destructive" : "text-muted-foreground"
            } text-xs`}
          >
            Re-enter password
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            autoComplete="new-password"
            className="w-full pt-5 px-3 pb-1 bg-transparent focus:outline-none text-foreground text-sm"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            minLength={8}
          />
        </div>
        {passwordError && (
          <p className="text-xs text-destructive mt-0.5">{passwordError}</p>
        )}
      </div>

      {/* Country/Region dropdown - more compact */}
      <div className="mb-3">
        <div className="relative border border-border rounded-lg">
          <label
            htmlFor="countryCode"
            className="absolute top-1 left-3 text-muted-foreground text-xs"
          >
            Country/Region
          </label>
          <div className="pt-5 px-3 pb-1">
            <select
              id="countryCode"
              name="countryCode"
              autoComplete="country"
              className="w-full appearance-none bg-transparent focus:outline-none text-foreground text-sm"
              value={formData.countryCode}
              onChange={handleChange}
            >
              <option value="+1">Canada (+1)</option>
              <option value="+1">United States (+1)</option>
              <option value="+44">United Kingdom (+44)</option>
              <option value="+61">Australia (+61)</option>
              <option value="+33">France (+33)</option>
            </select>
          </div>
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 9L12 15L18 9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Phone number field - more compact with auto-formatting */}
      <div className="mb-4">
        <div className="relative border border-border rounded-lg">
          <label
            htmlFor="phoneNumber"
            className="absolute top-1 left-3 text-muted-foreground text-xs"
          >
            Phone number
          </label>
          <input
            type="tel"
            id="phoneNumber"
            name="phone"
            placeholder="123-456-7890"
            autoComplete="tel-national"
            className="w-full pt-5 px-3 pb-1 bg-transparent focus:outline-none text-foreground text-sm"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      {/* Submit button - slightly smaller */}
      <button
        type="submit"
        className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-medium hover:bg-primary/90 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isLoading}
      >
        {isLoading ? "Creating account..." : "Continue"}
      </button>

      {/* Login link - smaller margin */}
      <div className="text-center mt-3">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <a href="/login" className="text-primary hover:text-primary/80">
            Log in
          </a>
        </p>
      </div>
    </form>
  );
};

export default SignupForm;