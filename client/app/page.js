import Inventory2Outlined from "@mui/icons-material/Inventory2Outlined";
import StorefrontOutlined from "@mui/icons-material/StorefrontOutlined";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  Typography,
} from "@mui/material";

import AppFooter from "@/components/layout/AppFooter";
import { getPublicProducts } from "@/lib/services/public-products.service";

export default async function PublicProductsPage({ searchParams }) {
  const params = await searchParams;
  const page = Number(params?.page || 1);
  const payload = await getPublicProducts(page);
  const products = payload.results || [];

  return (
    <Box sx={{ minHeight: "100vh", pb: 10 }}>
      <Box sx={{ borderBottom: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
        <Box sx={{ maxWidth: 1200, mx: "auto", px: 2, py: 2.5 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
            <Stack direction="row" spacing={1} alignItems="center">
              <StorefrontOutlined color="primary" />
              <Typography variant="h6">Product Marketplace</Typography>
            </Stack>
            <Stack direction="row" spacing={1}>
              <Button href="/register">Register</Button>
              <Button href="/login" variant="contained">Login</Button>
            </Stack>
          </Stack>
        </Box>
      </Box>

      <Box sx={{ maxWidth: 1200, mx: "auto", px: 2, py: 3 }}>
        <Typography variant="h4" gutterBottom>
          Approved Products
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Public catalog of products approved by business approvers.
        </Typography>

        <Grid container spacing={2}>
          {products.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product.id}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="h6">{product.name}</Typography>
                    <Inventory2Outlined color="action" fontSize="small" />
                  </Stack>
                  <Typography variant="body2" color="text.secondary" minHeight={42}>
                    {product.description || "No description"}
                  </Typography>
                  <Chip label={product.business_name} size="small" sx={{ mt: 1 }} />
                  <Typography variant="h5" mt={2}>${Number(product.price).toFixed(2)}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Stack direction="row" justifyContent="space-between" mt={3}>
          <Button href={`/?page=${Math.max(1, page - 1)}`} disabled={page <= 1} variant="outlined">
            Previous
          </Button>
          <Typography variant="body2" color="text.secondary" sx={{ alignSelf: "center" }}>
            Page {page}
          </Typography>
          <Button href={`/?page=${page + 1}`} disabled={!payload.next} variant="outlined">
            Next
          </Button>
        </Stack>
      </Box>

      <AppFooter />
    </Box>
  );
}
