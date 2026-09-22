import { Link } from "react-router";
import { categories } from "../../data/categories";
import Icon from "../common/Icon";
export default function CategoryLinks({ all = false }) {
  return (
    <div className={`category-grid ${all ? "all-categories" : ""}`}>
      {(all ? categories : categories.slice(0, 8)).map((c) => (
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
