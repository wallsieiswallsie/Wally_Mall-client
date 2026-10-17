import { Link } from '../../../ui/navigation.jsx';

import { categories } from "../../data/categories.js";
import Icon from "../../../ui/components/common/Icon.jsx";
import { usePrototype } from '../../state/PrototypeContext.jsx';
export default function CategoryLinks({ all = false }) {
  const {view}=usePrototype();
  return (
    <div className={`category-grid ${all ? "all-categories" : ""}`}>
      {(all ? categories : categories.slice(0, 8)).filter(c=>view.categoryStatus[c.slug]!=='hidden').map((c) => (
        <Link className="category-item" key={c.slug} to={`/category/${c.slug}`}>
          <span className="category-icon">
            <Icon name={c.icon} size={25} />
          </span>
          <span>{all ? c.name : c.short || c.name}</span>
          {all && (
            <small>
              Jelajahi kategori
              <Icon name="arrow" size={14} />
            </small>
          )}
        </Link>
      ))}
    </div>
  );
}
