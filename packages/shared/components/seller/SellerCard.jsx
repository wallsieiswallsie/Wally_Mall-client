import { Link } from '../../../ui/navigation.jsx';

import { products } from "../../data/products.js";
import Icon from "../../../ui/components/common/Icon.jsx";
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
