"use client"
import LoginForm from "@/components/Auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="container mx-auto max-w-md py-8 px-4">
      <div className="bg-card rounded-xl shadow-lg border border-border/50 p-6">
        <h1 className="text-2xl font-bold text-center mb-4 text-foreground">
          Log in to FlyNext
        </h1>
        <LoginForm />
      </div>
    </div>
  );
}