import AuthModalButtons from "@/components/auth/AuthModalButtons";
import AppFooter from "@/components/layout/AppFooter";
import { getPublicProducts } from "@/lib/services/public-products.service";

function StorefrontIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M4 4h16l-1 6a3 3 0 0 1-3 2 3 3 0 0 1-2.45-1.26A3 3 0 0 1 11 12a3 3 0 0 1-2.55-1.26A3 3 0 0 1 6 12a3 3 0 0 1-3-2L4 4zm1.22 8.2L5 20h14l-.22-7.8A4.96 4.96 0 0 1 16 13a4.97 4.97 0 0 1-3-1 4.97 4.97 0 0 1-6 0 4.96 4.96 0 0 1-1.78.2z" />
    </svg>
  );
}

function ProductIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M21 7.5 12 3 3 7.5v9L12 21l9-4.5v-9zM12 5.2l6.4 3.2L12 11.6 5.6 8.4 12 5.2zm-7 4.6 6 3v5.8l-6-3V9.8zm8 8.8v-5.8l6-3v5.8l-6 3z" />
    </svg>
  );
}

export default async function PublicProductsPage({ searchParams }) {
  const params = await searchParams;
  const page = Number(params?.page || 1);
  const payload = await getPublicProducts(page);
  const products = payload.results || [];

  return (
    <div className="min-h-screen pb-10">
      <header className="border-b border-[#ded9cb] bg-[#fffef9]">
        <div className="mx-auto flex w-full max-w-300 items-center justify-between gap-3 px-4 py-5">
          <div className="flex items-center gap-2">
            <StorefrontIcon className="h-6 w-6 text-[#176c55]" />
            <h1 className="m-0 text-xl font-semibold text-[#211f1a]">Marketplace</h1>
          </div>
          <AuthModalButtons />
        </div>
      </header>

      <main className="mx-auto w-full max-w-300 px-4 py-6">
        <h2 className="m-0 text-3xl font-bold text-[#211f1a]">Approved Products</h2>
        <p className="m-0 mt-1 text-sm text-[#6f6c63]">Public catalog of products approved by business approvers.</p>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {products.map((product) => (
            <article key={product.id} className="h-full rounded-2xl border border-[#ded9cb] bg-white p-4 shadow-sm">
              <div className="mb-3 overflow-hidden rounded-xl border border-[#ece6d8] bg-[#f7f4eb]">
                {product.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="h-44 w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-44 items-center justify-center text-[#8d897b]">
                    <ProductIcon className="h-10 w-10" />
                  </div>
                )}
              </div>
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3 className="m-0 text-lg font-semibold text-[#211f1a]">{product.name}</h3>
                <ProductIcon className="h-5 w-5 text-[#8d897b]" />
              </div>
              <p className="m-0 min-h-[42px] text-sm text-[#6f6c63]">{product.description || "No description"}</p>
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

      <AppFooter />
    </div>
  );
}
