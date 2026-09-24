import { usePrototype } from "../state/PrototypeContext";
import { useState } from "react";
import { Link, useOutletContext } from "react-router";
import { Field } from "../components/common/UI";
import Icon from "../components/common/Icon";
import { categories } from "../data/categories";
const steps = [
  "Informasi Toko",
  "Lokasi",
  "Kategori Usaha",
  "Preview Lapak",
  "Selesai",
];
export default function SellerOnboarding() {
  const { setDemoStore } = useOutletContext();
  const {login}=usePrototype();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "",
    description: "",
    location: "Sorong Kota",
    address: "",
    category: "fashion",
  });
  const change = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  return (
    <div className="page onboarding-page">
      <header className="page-heading centered">
        <p className="eyebrow">USAHA KECIL, KESEMPATAN BESAR</p>
        <h1>Lapak lokalmu dimulai di sini.</h1>
        <p>Kenalkan usahamu kepada lebih banyak orang Sorong.</p>
      </header>
      <ol className="onboarding-steps">
        {steps.map((label, i) => (
          <li
            key={label}
            className={`${i === step ? "current" : ""} ${i < step ? "complete" : ""}`}
            aria-current={i === step ? "step" : undefined}
          >
            <span>{i < step ? <Icon name="check" size={16} /> : i + 1}</span>
            <small>{label}</small>
          </li>
        ))}
      </ol>
      <section className="form-panel">
        <p className="eyebrow">LANGKAH {step + 1} DARI 5</p>
        <h2>{steps[step]}</h2>
        <form
          className="form-stack"
          onSubmit={(e) => {
            e.preventDefault();
            setStep((s) => Math.min(s + 1, 4));
          }}
        >
          {step === 0 && (
            <>
              <p className="muted">Bantu calon pembeli mengenal usahamu.</p>
              <Field label="Nama toko">
                <input
                  className="input"
                  name="name"
                  value={form.name}
                  onChange={change}
                  placeholder="Contoh: Dapur Nona"
                  required
                  maxLength={60}
                />
              </Field>
              <Field label="Cerita singkat toko">
                <textarea
                  className="textarea"
                  name="description"
                  value={form.description}
                  onChange={change}
                  placeholder="Apa yang membuat lapakmu berbeda?"
                  required
                  maxLength={500}
                />
              </Field>
            </>
          )}
          {step === 1 && (
            <>
              <p className="muted">
                Supaya orang terdekat lebih mudah menemukanmu.
              </p>
              <Field label="Wilayah">
                <select
                  className="select"
                  name="location"
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
              <Field
                label="Area / patokan lokasi"
                hint="Cukup area umum untuk preview ini."
              >
                <input
                  className="input"
                  name="address"
                  value={form.address}
                  onChange={change}
                  placeholder="Contoh: sekitar Jalan Basuki Rahmat"
                  required
                />
              </Field>
            </>
          )}
          {step === 2 && (
            <>
              <p className="muted">Pilih kategori utama usahamu.</p>
              <div className="business-category-grid">
                {categories.map((c) => (
                  <label
                    key={c.slug}
                    className={`business-category ${form.category === c.slug ? "selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name="category"
                      value={c.slug}
                      checked={form.category === c.slug}
                      onChange={change}
                    />
                    <Icon name={c.icon} />
                    <span>{c.name}</span>
                  </label>
                ))}
              </div>
            </>
          )}
          {step === 3 && (
            <>
              <p className="muted">Seperti ini orang akan mengenal lapakmu.</p>
              <div className="store-preview">
                <div className="seller-avatar large">
                  {form.name.slice(0, 2).toLowerCase()}
                </div>
                <span className="gold-badge">✦ Calon founding seller</span>
                <h3>{form.name}</h3>
                <p>{form.description}</p>
                <span className="inline-icon">
                  <Icon name="pin" size={16} />
                  {form.location} · {form.address}
                </span>
                <span className="badge">
                  {categories.find((c) => c.slug === form.category)?.name}
                </span>
              </div>
              <p className="prototype-note">
                Preview saja. Lapak belum dipublikasikan.
              </p>
            </>
          )}
          {step === 4 ? (
            <div className="onboarding-success">
              <span className="success-circle">
                <Icon name="check" size={34} />
              </span>
              <h2>Selamat datang, {form.name}!</h2>
              <p>
                Preview lapakmu sudah siap. Sekarang, coba tambahkan produk
                pertamamu.
              </p>
              <p className="prototype-note">
                Simulasi selesai. Tidak ada toko atau akun yang dibuat.
              </p>
              <Link
                className="btn btn-primary full"
                to="/seller/dashboard"
                onClick={() => {setDemoStore(form);login("seller");}}
              >
                Lihat dashboard preview
                <Icon name="arrow" size={18} />
              </Link>
              <Link className="text-link" to="/">
                Kembali jelajahi Wally
              </Link>
            </div>
          ) : (
            <div className="button-row">
              <button
                type="button"
                className="btn btn-outline"
                disabled={step === 0}
                onClick={() => setStep((s) => s - 1)}
              >
                Kembali
              </button>
              <button className="btn btn-primary" type="submit">
                {step === 3 ? "Selesaikan preview" : "Lanjut"}
                <Icon name="arrow" size={17} />
              </button>
            </div>
          )}
        </form>
      </section>
    </div>
  );
}
