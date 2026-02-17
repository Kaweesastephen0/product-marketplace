import { Box, CircularProgress } from "@mui/material";

export default function DashboardLoading() {
  return (
    <Box sx={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>
      <CircularProgress />
    </Box>
  );
}
