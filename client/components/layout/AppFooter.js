"use client";

import { Box, Typography } from "@mui/material";

export default function AppFooter({ compact = false }) {
  return (
    <Box
      component="footer"
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        borderTop: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        py: compact ? 1 : 1.2,
        px: 2,
        zIndex: 1200,
      }}
    >
      <Typography variant="caption" color="text.secondary" align="center" display="block">
        Product Marketplace Platform · Secure role-based operations
      </Typography>
    </Box>
  );
}
