import { useState } from "react";
import { Link, useOutletContext, useNavigate } from "react-router";
import { Field } from "../components/common/UI";
import Icon from "../components/common/Icon";
import { DemoAccess } from '../components/commerce/Shared';
import { usePrototype, DEMO_ENABLED } from '../state/PrototypeContext';
import { authenticateDemo } from '../domain/authentication';
export default function Auth({
  register = false
}) {
  const {
    login
  } = usePrototype();
  const [role, setRole] = useState("buyer");
  const {
    notify
  } = useOutletContext();
  const navigate = useNavigate();
  return <div className="auth-layout">
      <aside className="auth-story">
        <span className="eyebrow">SELAMAT DATANG DI WALLY</span>
        <h2>
          Yang kamu cari.
          <br />
          Yang dekat
          <br />
          di hati.
        </h2>
        <p>
          Barang pilihan, usaha lokal, dan cerita baru.
          <br />
          Semuanya dimulai dari Sorong.
        </p>
        <span className="auth-signature">Sorong, Ketemu di Wally.</span>
      </aside>
      <section className="auth-card">
        <span className="eyebrow">
          {register ? "JADI BAGIAN DARI WALLY" : "SENANG KAMU KEMBALI"}
        </span>
        <h1>{register ? "Halo, teman baru." : "Masuk ke Wally"}</h1>
        <p>
          {register ? "Mulai perjalanan lokalmu di sini." : "Temukan lagi barang dan toko favoritmu."}
        </p>
        <form className="form-stack" onSubmit={e => {
        e.preventDefault();
        if (register && role === "seller") navigate("/seller/register");else if (!register && DEMO_ENABLED) {
          const data = new FormData(e.currentTarget);
          try {
            navigate(login(authenticateDemo(data.get('identity'), data.get('password'), DEMO_ENABLED)));
          } catch (error) {
            notify({
              title: 'Akun demo tidak cocok',
              message: error.message
            });
          }
        } else notify({
          title: register ? "Preview pendaftaran" : "Preview masuk",
          message: "Form ini hanya mendemonstrasikan tampilan. Data tidak dikirim, akun tidak dibuat, dan tidak ada sesi login."
        });
      }}>
          {register && <>
              <div className="role-options">
                {[["buyer", "heart", "Saya ingin belanja"], ["seller", "store", "Saya ingin buka lapak"]].map(([value, icon, label]) => <label key={value} className={`role-option ${role === value ? "selected" : ""}`}>
                    <input type="radio" name="role" value={value} checked={role === value} onChange={() => setRole(value)} />
                    <Icon name={icon} />
                    {label}
                  </label>)}
              </div>
              <Field label="Nama lengkap">
                <input className="input" placeholder="Nama panggilan juga boleh" autoComplete="name" required />
              </Field>
            </>}
          <Field label="Email / Nomor WhatsApp">
            <input className="input" placeholder="Email atau 08xxxxxxxxxx" name="identity" autoComplete="username" required />
          </Field>
          <Field label="Password" hint="Gunakan data contoh untuk mencoba prototype.">
            <input type="password" name="password" className="input" placeholder="Masukkan password contoh" autoComplete={register ? "new-password" : "current-password"} required minLength={6} />
          </Field>
          <button className="btn btn-primary full" type="submit">
            {register ? role === "seller" ? "Lanjut ke informasi toko" : "Daftar" : "Masuk"}
            <Icon name="arrow" size={18} />
          </button>
        </form>
        <p className="auth-switch">
          {register ? "Sudah punya akun? " : "Belum punya akun? "}
          <Link to={register ? "/login" : "/register"}>
            {register ? "Masuk" : "Daftar"}
          </Link>
        </p>
        {!register && <p className="prototype-note">Akun demo: buyer@demo.wally / seller@demo.wally / admin@demo.wally / super@demo.wally · Password: wally-demo</p>}
        <DemoAccess />
      </section>
    </div>;
}
