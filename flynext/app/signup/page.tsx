"use client";
import SignupForm from "@/components/Auth/SignupForm";

export default function SignupPage() {
  return (
    <div className="container mx-auto max-w-md py-8 px-4">
      <div className="bg-card rounded-xl shadow-lg border border-border/50 p-6">
        <h1 className="text-2xl font-bold text-center mb-4 text-foreground">
          Sign up for FlyNext
        </h1>
        <SignupForm />
      </div>
    </div>
  );
}