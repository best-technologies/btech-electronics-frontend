"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { ApiError } from "@/lib/api";

const RESEND_COOLDOWN_SECONDS = 5 * 60; // 5 minutes

function formatCountdown(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [resendSecondsLeft, setResendSecondsLeft] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Forgot password";
  }, []);

  useEffect(() => {
    if (resendSecondsLeft <= 0) return;
    const t = setInterval(() => {
      setResendSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [resendSecondsLeft]);

  async function handleRequestOtp(e: React.FormEvent) {
    e.preventDefault();
    if (sent || loading) return;
    setError(null);
    setLoading(true);
    try {
      await authApi.requestPasswordResetOtp({ email });
      setSent(true);
      setResendSecondsLeft(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await authApi.verifyPasswordResetOtp({
        email,
        otp,
        new_password: newPassword,
      });
      router.push("/sign-in");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to reset password");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (resendSecondsLeft > 0) return;
    setError(null);
    try {
      await authApi.requestPasswordResetOtp({ email });
      setResendSecondsLeft(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to resend OTP");
    }
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Forgot password</CardTitle>
        <CardDescription>
          {sent
            ? "Enter the OTP from your email and your new password."
            : "Enter your email and we'll send you an OTP to reset your password."}
        </CardDescription>
      </CardHeader>
      <form onSubmit={sent ? handleReset : handleRequestOtp}>
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
              disabled={sent}
            />
          </div>

          {sent && (
            <>
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
              <div className="space-y-2">
                <Label htmlFor="new-password">New password</Label>
                <Input
                  id="new-password"
                  name="new_password"
                  type="password"
                  placeholder="New password"
                  autoComplete="new-password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm password</Label>
                <Input
                  id="confirm-password"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          {!sent ? (
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending…" : "Send OTP"}
            </Button>
          ) : (
            <>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Resetting…" : "Reset password"}
              </Button>
              <div className="flex items-center justify-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  disabled={resendSecondsLeft > 0}
                  onClick={handleResend}
                >
                  Resend OTP
                </Button>
                {resendSecondsLeft > 0 && (
                  <span className="text-sm text-muted-foreground">
                    (in {formatCountdown(resendSecondsLeft)})
                  </span>
                )}
              </div>
            </>
          )}
          <Link
            href="/sign-in"
            className="text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to sign in
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}
