import { useState } from "react";
import { Link, useOutletContext, useNavigate } from "react-router";
import { Field } from "../components/common/UI";
import Icon from "../components/common/Icon";
export default function Auth({ register = false }) {
  const [role, setRole] = useState("buyer");
  const { notify } = useOutletContext();
  const navigate = useNavigate();
  return (
    <div className="auth-layout">
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
          {register
            ? "Mulai perjalanan lokalmu di sini."
            : "Temukan lagi barang dan toko favoritmu."}
        </p>
        <form
          className="form-stack"
          onSubmit={(e) => {
            e.preventDefault();
            if (register && role === "seller") navigate("/seller/register");
            else
              notify({
                title: register ? "Preview pendaftaran" : "Preview masuk",
                message:
                  "Form ini hanya mendemonstrasikan tampilan. Data tidak dikirim, akun tidak dibuat, dan tidak ada sesi login.",
              });
          }}
        >
          {register && (
            <>
              <div className="role-options">
                {[
                  ["buyer", "heart", "Saya ingin belanja"],
                  ["seller", "store", "Saya ingin buka lapak"],
                ].map(([value, icon, label]) => (
                  <label
                    key={value}
                    className={`role-option ${role === value ? "selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={value}
                      checked={role === value}
                      onChange={() => setRole(value)}
                    />
                    <Icon name={icon} />
                    {label}
                  </label>
                ))}
              </div>
              <Field label="Nama lengkap">
                <input
                  className="input"
                  placeholder="Nama panggilan juga boleh"
                  autoComplete="name"
                  required
                />
              </Field>
            </>
          )}
          <Field label="Email / Nomor WhatsApp">
            <input
              className="input"
              placeholder="Email atau 08xxxxxxxxxx"
              autoComplete="username"
              required
            />
          </Field>
          <Field
            label="Password"
            hint="Gunakan data contoh untuk mencoba prototype."
          >
            <input
              type="password"
              className="input"
              placeholder="Masukkan password contoh"
              autoComplete={register ? "new-password" : "current-password"}
              required
              minLength={6}
            />
          </Field>
          <button className="btn btn-primary full" type="submit">
            {register
              ? role === "seller"
                ? "Lanjut ke informasi toko"
                : "Daftar"
              : "Masuk"}
            <Icon name="arrow" size={18} />
          </button>
        </form>
        <p className="auth-switch">
          {register ? "Sudah punya akun? " : "Belum punya akun? "}
          <Link to={register ? "/login" : "/register"}>
            {register ? "Masuk" : "Daftar"}
          </Link>
        </p>
        <div className="prototype-note">Prototype UI · Tanpa autentikasi</div>
      </section>
    </div>
  );
}
