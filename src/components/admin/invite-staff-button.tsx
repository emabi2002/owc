"use client";

import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function InviteStaffButton() {
  return (
    <Button
      size="sm"
      onClick={() =>
        toast.success("Invitation flow ready — connect SMTP/Supabase invites to send.")
      }
    >
      <UserPlus className="h-4 w-4" /> Invite staff
    </Button>
  );
}
