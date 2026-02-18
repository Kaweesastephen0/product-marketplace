const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

// Fetches the public approved products list for the requested page.
export async function getPublicProducts(page = 1) {
  const url = `${API_BASE_URL}/api/public/products/?page=${page}`;
  const response = await fetch(url, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch public products.");
  }

  return response.json();
}
