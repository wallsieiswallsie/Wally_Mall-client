import { useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router";
import { Field, Modal } from "../components/common/UI";
import Icon from "../components/common/Icon";
import { categories } from "../data/categories";
import { products } from "../data/products";
import { rupiah } from "../utils/format";
export default function AddProduct() {
  const navigate = useNavigate();
  const { setDemoProducts } = useOutletContext();
  const [form, setForm] = useState({
    name: "",
    category: "fashion",
    subcategory: "Wanita",
    price: "",
    condition: "Baru",
    stock: "1",
    description: "",
    location: "Sorong Kota",
  });
  const [tags, setTags] = useState([]);
  const [tag, setTag] = useState("");
  const [photo, setPhoto] = useState("");
  const [picker, setPicker] = useState(false);
  const [preview, setPreview] = useState(false);
  const category = categories.find((c) => c.slug === form.category);
  const change = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const addTag = () => {
    const value = tag.trim().toLowerCase();
    if (value && !tags.includes(value) && tags.length < 10)
      setTags((t) => [...t, value]);
    setTag("");
  };
  return (
    <div className="page add-product-page">
      <div className="breadcrumb">
        <Link to="/seller/dashboard">Dashboard</Link>
        <span>/</span>Tambah produk
      </div>
      <header className="page-heading">
        <p className="eyebrow">KENALKAN PRODUKMU</p>
        <h1>Tambah produk</h1>
        <p>Detail yang jelas membantu orang menemukan barang yang tepat.</p>
      </header>
      <form
        className="product-form"
        onSubmit={(e) => {
          e.preventDefault();
          setPreview(true);
        }}
      >
        <div className="form-panel form-stack">
          <Field
            label="Foto produk"
            hint="Pilih foto contoh untuk prototype. Tidak ada unggah file."
          >
            <button
              className="photo-picker"
              type="button"
              onClick={() => setPicker(true)}
            >
              {photo ? (
                <img src={photo} alt="Foto contoh produk yang dipilih" />
              ) : (
                <>
                  <Icon name="image" size={30} />
                  <strong>Pilih foto contoh</strong>
                  <span>Foto yang jelas bikin produk mudah dikenali.</span>
                </>
              )}
            </button>
          </Field>
          <Field label="Nama produk">
            <input
              name="name"
              className="input"
              placeholder="Contoh: Nike Air Force White"
              value={form.name}
              onChange={change}
              maxLength={100}
              required
            />
          </Field>
          <div className="form-columns">
            <Field label="Kategori">
              <select
                className="select"
                value={form.category}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    category: e.target.value,
                    subcategory: categories.find(
                      (c) => c.slug === e.target.value,
                    ).sub[0],
                  }))
                }
              >
                {categories.map((c) => (
                  <option value={c.slug} key={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Subkategori">
              <select
                name="subcategory"
                className="select"
                value={form.subcategory}
                onChange={change}
              >
                {category.sub.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
          </div>
          <div className="form-columns">
            <Field label="Harga (Rp)">
              <input
                className="input"
                type="number"
                name="price"
                placeholder="850000"
                min="1"
                max="9999999999"
                value={form.price}
                onChange={change}
                required
              />
            </Field>
            <Field label="Stok">
              <input
                className="input"
                type="number"
                name="stock"
                min="1"
                max="99999"
                value={form.stock}
                onChange={change}
                required
              />
            </Field>
          </div>
          <Field label="Kondisi">
            <select
              name="condition"
              className="select"
              value={form.condition}
              onChange={change}
            >
              <option>Baru</option>
              <option>Bekas</option>
            </select>
          </Field>
          <Field label="Deskripsi">
            <textarea
              className="textarea"
              name="description"
              placeholder="Ceritakan ukuran, material, kelengkapan, atau hal penting lainnya."
              rows={5}
              value={form.description}
              onChange={change}
              required
            />
          </Field>
          <Field label="Lokasi">
            <select
              name="location"
              className="select"
              value={form.location}
              onChange={change}
            >
              {[
                "Sorong Kota",
                "Sorong Manoi",
                "Sorong Utara",
                "Sorong Timur",
                "Sorong Barat",
                "Sorong Kepulauan",
              ].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
        </div>
        <aside>
          <div className="form-panel tags-panel">
            <Icon name="search" size={25} />
            <h2>Bantu produkmu ditemukan.</h2>
            <p>
              Tambahkan kata yang mungkin diketik pembeli saat mencari produkmu.
            </p>
            <Field
              label="Tags / kata terkait"
              hint="Maksimal 10 tags. Tekan Enter atau tombol +."
            >
              <div className="tag-input">
                <input
                  className="input"
                  value={tag}
                  maxLength={35}
                  placeholder="Contoh: sepatu putih"
                  onChange={(e) => setTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                />
                <button
                  className="btn btn-outline"
                  type="button"
                  aria-label="Tambahkan tag"
                  onClick={addTag}
                >
                  <Icon name="plus" />
                </button>
              </div>
            </Field>
            <div className="chip-row">
              {tags.map((t) => (
                <button
                  className="chip selected"
                  type="button"
                  key={t}
                  aria-label={`Hapus tag ${t}`}
                  onClick={() => setTags(tags.filter((s) => s !== t))}
                >
                  {t}
                  <Icon name="close" size={13} />
                </button>
              ))}
            </div>
            <small>Contoh: nike, sepatu putih, casual</small>
          </div>
          <div className="form-panel publish-panel">
            <h3>Sudah terlihat pas?</h3>
            <p>Cek tampilan produk sebelum melanjutkan.</p>
            <button className="btn btn-primary full" type="submit">
              Preview produk
              <Icon name="arrow" size={17} />
            </button>
            <Link className="btn btn-ghost full" to="/seller/dashboard">
              Batal
            </Link>
            <small>Data hanya digunakan untuk preview UI.</small>
          </div>
        </aside>
      </form>
      {picker && (
        <Modal title="Pilih foto contoh" onClose={() => setPicker(false)}>
          <p className="muted">Gunakan salah satu ilustrasi yang tersedia.</p>
          <div className="mock-photo-grid">
            {products
              .filter((p) => p.image)
              .slice(0, 6)
              .map((p) => (
                <button
                  key={p.slug}
                  aria-label={`Gunakan foto ${p.name}`}
                  onClick={() => {
                    setPhoto(p.image);
                    setPicker(false);
                  }}
                >
                  <img src={p.image} alt={p.name} />
                </button>
              ))}
          </div>
        </Modal>
      )}
      {preview && (
        <Modal title="Preview produkmu" onClose={() => setPreview(false)}>
          <div className="submitted-preview">
            {photo && <img src={photo} alt={form.name} />}
            <span className="badge">{form.condition}</span>
            <h3>{form.name}</h3>
            <strong>{rupiah(Number(form.price))}</strong>
            <p>{form.description}</p>
            <small>
              {form.location} · {form.stock} stok
            </small>
            <div className="chip-row">
              {tags.map((t) => (
                <span className="tag" key={t}>
                  #{t}
                </span>
              ))}
            </div>
          </div>
          <p className="prototype-note">
            Ini simulasi. Produk tidak dipublikasikan.
          </p>
          <button
            className="btn btn-primary full"
            onClick={() => {
              setDemoProducts((items) => [
                { ...form, price: Number(form.price), image: photo, tags },
                ...items,
              ]);
              navigate("/seller/dashboard");
            }}
          >
            Simpan ke dashboard preview
          </button>
        </Modal>
      )}
    </div>
  );
}
