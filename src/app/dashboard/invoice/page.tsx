"use client";

import { useEffect } from "react";

export default function InvoicePage() {
  useEffect(() => {
    document.title = "Invoice";
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-foreground">Invoice</h1>
      <p className="mt-2 text-muted-foreground">
        Invoice content will go here.
      </p>
    </div>
  );
}
