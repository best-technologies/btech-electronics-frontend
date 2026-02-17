"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";

export default function ManagementPage() {
  const router = useRouter();
  const role = useAuthStore((s) => s.role);

  useEffect(() => {
    if (role !== "admin") {
      router.replace("/dashboard");
      return;
    }
    router.replace("/dashboard/management/users");
  }, [role, router]);

  return null;
}
