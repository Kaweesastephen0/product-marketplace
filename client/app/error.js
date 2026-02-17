"use client";

import { Box, Button, Card, CardContent, Typography } from "@mui/material";

export default function GlobalError({ error, reset }) {
  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", p: 2 }}>
      <Card sx={{ maxWidth: 520 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Something went wrong
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            {error?.message || "Unexpected error"}
          </Typography>
          <Button variant="contained" onClick={reset}>
            Retry
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
