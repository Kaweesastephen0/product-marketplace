// Renders the loading component UI.
export default function Loading() {
  return (
    <div className="grid min-h-screen place-items-center">
      <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#d9d2bf] border-t-[#176c55]" />
    </div>
  );
}
