"use client";

import { Card, CardContent } from "@mui/material";

import ProductManagerPanel from "@/features/dashboard/components/ProductManagerPanel";

export default function EditorPanel() {
  return (
    <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
      <CardContent>
        <ProductManagerPanel mode="editor" />
      </CardContent>
    </Card>
  );
}
