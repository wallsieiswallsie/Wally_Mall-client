import { useOutletContext } from 'react-router';

import { ProductGrid } from "../../../../packages/shared/components/product/ProductCard.jsx";
import { EmptyState } from "../../../../packages/ui/components/common/UI.jsx";
import { products } from "../../../../packages/shared/data/products.js";
export default function Favorites() {
  const { favorites } = useOutletContext();
  const items = products.filter((p) => favorites.includes(p.slug));
  return (
    <div className="page">
      <header className="page-heading">
        <p className="eyebrow">PILIHAN YANG INGIN KAMU INGAT</p>
        <h1>Favoritmu</h1>
        <p>
          {items.length
            ? `${items.length} produk disimpan. Balik lagi saat kamu siap.`
            : "Tempat kecil untuk barang incaranmu."}
        </p>
      </header>
      {items.length ? (
        <ProductGrid products={items} />
      ) : (
        <EmptyState
          icon="heart"
          title="Belum ada yang kamu simpan."
          text="Ketuk ikon hati di produk yang kamu suka. Barang incaranmu akan ada di sini."
        />
      )}
    </div>
  );
}
