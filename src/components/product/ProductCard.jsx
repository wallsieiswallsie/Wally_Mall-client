import { Link } from "react-router";
import { useOutletContext } from "react-router";
import { sellers } from "../../data/sellers";
import { categories } from "../../data/categories";
import { rupiah } from "../../utils/format";
import Icon from "../common/Icon";
export function ProductImage({ product, ...props }) {
  return product.image ? (
    <img
      src={product.image}
      alt={product.name}
      loading="lazy"
      {...props}
      onError={(e) => {
        e.currentTarget.style.display = "none";
        e.currentTarget.nextElementSibling?.removeAttribute("hidden");
      }}
    />
  ) : (
    <div className="image-placeholder">
      <Icon
        name={categories.find((c) => c.slug === product.category)?.icon}
        size={44}
      />
      <span>{product.name}</span>
    </div>
  );
}
export default function ProductCard({ product }) {
  const { favorites, toggleFavorite } = useOutletContext();
  const seller = sellers.find((s) => s.slug === product.seller);
  return (
    <article className="product-card">
      <div className="product-visual">
        <Link to={`/product/${product.slug}`}>
          <ProductImage product={product} />
          <div hidden className="image-fallback">
            {product.name}
          </div>
        </Link>
        <button
          className={`favorite-btn ${favorites.includes(product.slug) ? "saved" : ""}`}
          onClick={() => toggleFavorite(product.slug)}
          aria-label={`${favorites.includes(product.slug) ? "Hapus" : "Simpan"} ${product.name}`}
          aria-pressed={favorites.includes(product.slug)}
        >
          <Icon name="heart" size={18} />
        </button>
        {product.condition === "Bekas" && (
          <span className="condition-badge">Preloved</span>
        )}
      </div>
      <div className="product-copy">
        <Link className="product-name" to={`/product/${product.slug}`}>
          {product.name}
        </Link>
        <strong>{rupiah(product.price)}</strong>
        <Link className="product-seller" to={`/store/${seller.slug}`}>
          {seller.name}
          {seller.badge && <span className="seller-verified">✦</span>}
        </Link>
        <div className="product-meta">
          <span>
            <Icon name="pin" size={12} />
            {seller.location}
          </span>
          {product.rating && (
            <span>
              <Icon name="star" size={12} />
              {product.rating}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
export function ProductGrid({ products: items }) {
  return (
    <div className="product-grid">
      {items.map((p) => (
        <ProductCard key={p.slug} product={p} />
      ))}
    </div>
  );
}
