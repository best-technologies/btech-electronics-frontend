"use client";

import { useEffect } from "react";

export default function PaymentsPage() {
  useEffect(() => {
    document.title = "Payments";
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-foreground">Payments</h1>
      <p className="mt-2 text-muted-foreground">
        Payments content will go here.
      </p>
    </div>
  );
}
