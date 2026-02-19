
import AuthModalButtons from "@/components/auth/AuthModalButtons";
import AppFooter from "@/components/layout/AppFooter";
import { getPublicProducts } from "@/lib/services/public-products.service";
import StorefrontIcon from '@mui/icons-material/Storefront';
import Inventory2Icon from '@mui/icons-material/Inventory2';


// Renders the public approved products page with pagination.
export default async function PublicProductsPage({ searchParams }) {
  const params = await searchParams;
  const page = Number(params?.page || 1);
  const payload = await getPublicProducts(page);
  const products = payload.results || [];

  return (
    <div className="min-h-screen pb-10">

      {/* Public header */}
      <header className="border-b border-[#ded9cb] bg-[#fffef9]">
        <div className="mx-auto flex w-full max-w-300 items-center justify-between gap-3 px-4 py-5">
          <div className="flex items-center gap-2">
            <StorefrontIcon className="h-6 w-6 text-[#176c55]" />
            <h1 className="m-0 text-xl font-semibold text-[#211f1a]">Marketplace</h1>
          </div>
          <AuthModalButtons />
        </div>
      </header>

    {/* Main content */}
      <main className="mx-auto w-full max-w-300 px-4 py-6">
        <h2 className="m-0 text-3xl font-bold text-[#211f1a]">Approved Products</h2>
        <p className="m-0 mt-1 text-sm text-[#6f6c63]">Public products approved by business approvers.</p>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {products.map((product) => (
            <article key={product.id} className="h-full rounded-2xl border border-[#ded9cb] bg-white p-4 shadow-sm">
              <div className="mb-3 overflow-hidden rounded-xl border border-[#ece6d8] bg-[#f7f4eb]">
                {product.image_url ? (
                 
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="h-44 w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-44 items-center justify-center text-[#8d897b]">
                    <Inventory2Icon className="h-10 w-10" />
                  </div>
                )}
              </div>
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3 className="m-0 text-lg font-semibold text-[#211f1a]">{product.name}</h3>
                <Inventory2Icon className="h-5 w-5 text-[#8d897b]" />
              </div>
              <p className="m-0 min-h-10.5 text-sm text-[#6f6c63]">{product.description || "No description"}</p>
              <p className="mt-2 inline-block rounded-full bg-[#f1eee2] px-2 py-1 text-xs text-[#4c493f]">
                {product.business_name}
              </p>
              <p className="m-0 mt-3 text-2xl font-bold text-[#211f1a]">${Number(product.price).toFixed(2)}</p>
            </article>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <a
            href={`/?page=${Math.max(1, page - 1)}`}
            aria-disabled={page <= 1}
            className={`rounded-lg border px-3 py-1.5 text-sm ${
              page <= 1
                ? "pointer-events-none border-[#dfdbce] text-[#b1ac9d]"
                : "border-[#d6d0be] text-[#211f1a] hover:bg-[#f1eee2]"
            }`}
          >
            Previous
          </a>
          <p className="m-0 text-sm text-[#6f6c63]">Page {page}</p>
          <a
            href={`/?page=${page + 1}`}
            aria-disabled={!payload.next}
            className={`rounded-lg border px-3 py-1.5 text-sm ${
              !payload.next
                ? "pointer-events-none border-[#dfdbce] text-[#b1ac9d]"
                : "border-[#d6d0be] text-[#211f1a] hover:bg-[#f1eee2]"
            }`}
          >
            Next
          </a>
        </div>
      </main>

     {/* Footer */}
     
      <AppFooter />
    </div>
  );
}
