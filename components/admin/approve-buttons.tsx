"use client";

import { updateWebsiteStatus } from "@/lib/actions/admin";
import { Check, X } from "lucide-react";
import { useTransition } from "react";

export default function ApproveButtons({ websiteId, currentStatus }: { websiteId: string; currentStatus: string }) {
  const [isPending, startTransition] = useTransition();

  if (currentStatus !== "pending") return null;

  return (
    <div className="flex gap-2">
      <button
        disabled={isPending}
        onClick={() => startTransition(async () => await updateWebsiteStatus(websiteId, "approved"))}
        className="p-1.5 rounded-md bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50"
      >
        <Check className="h-4 w-4" />
      </button>
      <button
        disabled={isPending}
        onClick={() => startTransition(async () => await updateWebsiteStatus(websiteId, "rejected"))}
        className="p-1.5 rounded-md bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
