"use client";

import { Card, CardContent } from "@mui/material";

import ApprovalPanel from "@/components/features/dashboard/components/ApprovalPanel";

export default function ApproverPanel() {
  return (
    <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
      <CardContent>
        <ApprovalPanel />
      </CardContent>
    </Card>
  );
}
