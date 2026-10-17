import { Link } from '../../ui/navigation.jsx';

import { Navigate } from 'react-router';

import { useLocation } from 'react-router';

import { useNavigate } from '../../ui/navigation.jsx';

import { useServer } from './context.jsx';
import { destination } from './context.jsx';
import { useResource } from './resource.js';
import { Resource } from './Forms.jsx';
import { Action } from './Forms.jsx';
import { Form } from './Forms.jsx';
import { addressFields } from './format.js';
import { Facts } from './Forms.jsx';

function Guard({ roles, children }) {
  const { user } = useServer();
  const location = useLocation();
  if (!user)
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname + location.search }}
        replace
      />
    );
  if (roles && !roles.some((role) => user.roles.includes(role)))
    return (
      <p role="alert">Akun ini tidak memiliki akses ke halaman tersebut.</p>
    );
  return children;
}
function Auth({ register = false }) {
  const { api, setUser } = useServer();
  const navigate = useNavigate();
  const location = useLocation();
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
        <h1>{register ? "Daftar di Wally" : "Masuk ke Wally"}</h1>
        <Form
          fields={[...(register ? ["name"] : []), "email", "password"]}
          button={register ? "Daftar" : "Masuk"}
          submit={(body) => api.authenticate(register, body)}
          onDone={(user) => {
            setUser(user);
            const from = location.state?.from;
            navigate(
              typeof from === "string" &&
                from.startsWith("/") &&
                !from.startsWith("//")
                ? from
                : destination(user),
              { replace: true },
            );
          }}
        />
        <p>Password minimal 12 karakter.</p>
        <Link to={register ? "/login" : "/register"}>
          {register ? "Sudah punya akun? Masuk" : "Buat akun baru"}
        </Link>
      </section>
    </div>
  );
}
function Account() {
  const { api, user, setUser } = useServer();
  const notifications = useResource("/notifications");
  const addresses = useResource(
    user.roles.includes("buyer") ? "/addresses" : null,
  );
  return (
    <>
      <h1>Akun saya</h1>
      <section className="w-panel">
        <Facts row={user} />
        <p>Peran: {user.roles.join(", ")}</p>
        <Action run={() => api.request("/users/me")} onDone={setUser}>
          Perbarui akun & akses
        </Action>
      </section>
      <h2>Notifikasi</h2>
      <Resource resource={notifications}>
        {(rows) =>
          rows.length ? (
            rows.map((n) => (
              <section className="w-panel" key={n.id}>
                <h3>{n.title}</h3>
                <p>{n.body}</p>
                <small>{new Date(n.created_at).toLocaleString("id-ID")}</small>
                {!n.read_at && (
                  <Action
                    run={() =>
                      api.request(`/notifications/${n.id}/read`, {
                        method: "PUT",
                      })
                    }
                    onDone={notifications.reload}
                  >
                    Tandai dibaca
                  </Action>
                )}
              </section>
            ))
          ) : (
            <p>Belum ada notifikasi.</p>
          )
        }
      </Resource>
      {user.roles.includes("buyer") && (
        <>
          <h2>Alamat saya</h2>
          <Resource resource={addresses}>
            {(rows) =>
              rows.map((a) => (
                <section className="w-panel" key={a.id}>
                  <Facts row={a} />
                  <details>
                    <summary>Ubah alamat</summary>
                    <Form
                      fields={addressFields.map((f) => ({
                        ...(typeof f === "string" ? { key: f } : f),
                        value: a[typeof f === "string" ? f : f.key] || "",
                      }))}
                      submit={(body) =>
                        api.request(`/addresses/${a.id}`, {
                          method: "PATCH",
                          body,
                        })
                      }
                      onDone={addresses.reload}
                    />
                  </details>
                  <Action
                    run={() =>
                      api.request(`/addresses/${a.id}`, { method: "DELETE" })
                    }
                    onDone={addresses.reload}
                  >
                    Hapus alamat
                  </Action>
                </section>
              ))
            }
          </Resource>
          <details>
            <summary>Tambah alamat</summary>
            <Form
              fields={addressFields}
              submit={(body) =>
                api.request("/addresses", { method: "POST", body })
              }
              onDone={addresses.reload}
            />
          </details>
        </>
      )}
    </>
  );
}
export { Guard, Auth, Account };
