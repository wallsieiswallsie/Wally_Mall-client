import { Link } from "react-router";
import { products } from "../../data/products";
import Icon from "../common/Icon";
export default function SellerCard({ seller }) {
  return (
    <Link to={`/store/${seller.slug}`} className="seller-card">
      <div className={`seller-avatar avatar-${seller.slug}`}>
        {seller.initials}
      </div>
      <div>
        <h3>
          {seller.name}{" "}
          {seller.badge && <span className="seller-verified">✦</span>}
        </h3>
        <p>{seller.category}</p>
        <small>
          <Icon name="pin" size={12} />
          {seller.location} ·{" "}
          {products.filter((p) => p.seller === seller.slug).length} produk
        </small>
      </div>
      <Icon name="chevron" size={16} />
    </Link>
  );
}
