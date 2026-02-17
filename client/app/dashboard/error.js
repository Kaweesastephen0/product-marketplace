"use client";

import { Box, Button, Card, CardContent, Typography } from "@mui/material";

export default function DashboardError({ error, reset }) {
  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Dashboard error
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            {error?.message || "Unable to load dashboard"}
          </Typography>
          <Button onClick={reset} variant="contained">
            Retry
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
