import type { Product } from "../types";
import OurProductCard from "./OurProductCard";

// 3 columns visible on mobile/tablet, 4 from lg up — set via
// grid-auto-columns (not per-item widths, which would fight
// grid-auto-flow: column's own sizing) so the count is exact regardless of
// the container's actual pixel width. A fixed 2-row-tall grid that scrolls
// horizontally for anything past what's visible, rather than capping how
// many products can be reached.
export const GRID_CLASS =
  "grid-flow-col grid-rows-2 auto-cols-[calc(33.333%-6px)] gap-x-2 gap-y-6 sm:auto-cols-[calc(33.333%-16px)] sm:gap-x-6 sm:gap-y-8 lg:auto-cols-[calc(25%-18px)]";

export default function OurProductsGrid({ products }: { products: Product[] }) {
  return (
    <div className={`scrollbar-none grid snap-x snap-mandatory overflow-x-auto pb-2 ${GRID_CLASS}`}>
      {products.map((product) => (
        <div key={product.id} className="snap-start">
          <OurProductCard product={product} />
        </div>
      ))}
    </div>
  );
}
