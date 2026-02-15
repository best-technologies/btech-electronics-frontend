"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authApi } from "@/lib/api/auth-api";
import { useAuthStore } from "@/stores/authStore";
import { ApiError } from "@/lib/api";

export default function SignInPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const setUserProfile = useAuthStore((s) => s.setUserProfile);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsOtp, setNeedsOtp] = useState(false);

  useEffect(() => {
    document.title = "Sign in";
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (needsOtp) {
        const data = await authApi.adminVerifyLoginOtp({ email, otp });
        if (data?.access_token) {
          setAuth(data.access_token, "admin");
          const profile = await authApi.fetchUserDetails(data.access_token);
          if (profile) setUserProfile(profile);
          router.push("/");
          router.refresh();
        }
      } else {
        const data = await authApi.signIn({ email, password });
        if (!data) {
          setError("Invalid response");
          return;
        }
        if ("access_token" in data) {
          setAuth(data.access_token, "user");
          const profile = await authApi.fetchUserDetails(data.access_token);
          if (profile) setUserProfile(profile);
          router.push("/");
          router.refresh();
        } else if ("role" in data && data.role === "admin") {
          setNeedsOtp(true);
          setError(null);
        }
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Sign in</CardTitle>
        <CardDescription>
          {needsOtp
            ? "Enter the OTP sent to your email to continue."
            : "Enter your credentials to access your account."}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <p className="text-sm text-destructive font-medium" role="alert">
              {error}
            </p>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={needsOtp}
            />
          </div>
          {!needsOtp && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <PasswordInput
                id="password"
                name="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          )}
          {needsOtp && (
            <div className="space-y-2">
              <Label htmlFor="otp">OTP</Label>
              <Input
                id="otp"
                name="otp"
                type="text"
                placeholder="Enter OTP from email"
                autoComplete="one-time-code"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in…" : needsOtp ? "Verify OTP" : "Sign in"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            No account?{" "}
            <Link href="/" className="text-primary hover:underline">
              Contact us for wholesale access
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
