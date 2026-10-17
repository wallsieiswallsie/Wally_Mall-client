import { useState } from 'react';
import { Link } from '../../../../packages/ui/navigation.jsx';

import { Outlet } from 'react-router';

import { Modal } from '../../../../packages/ui/components/common/UI.jsx';
import { Field } from '../../../../packages/ui/components/common/UI.jsx';
import { useServer } from '../../../../packages/shared/live/context.jsx';
import { ErrorMessage } from '../../../../packages/shared/live/Forms.jsx';
import { useResource } from '../../../../packages/shared/live/resource.js';
import { Resource } from '../../../../packages/shared/live/Forms.jsx';
import { Action } from '../../../../packages/shared/live/Forms.jsx';
import { Form } from '../../../../packages/shared/live/Forms.jsx';
import { Facts } from '../../../../packages/shared/live/Forms.jsx';

const managementSections = {
  stores: "Seller",
  applications: "Pengajuan seller",
  products: "Produk",
  categories: "Kategori",
  reports: "Laporan",
  buyers: "Buyer",
  admins: "Admin",
  "fee-rules": "Platform fee",
  audit: "Audit log",
};
function AdminShell({ superAdmin = false }) {
  const prefix = superAdmin ? "/super-admin" : "/admin";
  return (
    <>
      <h1>{superAdmin ? "Super admin" : "Admin"}</h1>
      <nav className="live-nav">
        <Link to={prefix}>Overview</Link>
        <Link to={`${prefix}/orders`}>Pesanan</Link>
        {superAdmin && <Link to={`${prefix}/transactions`}>Transaksi</Link>}
        {Object.entries(managementSections)
          .filter(
            ([key]) =>
              superAdmin ||
              !["buyers", "admins", "fee-rules", "audit"].includes(key),
          )
          .map(([key, label]) => (
            <Link key={key} to={`${prefix}/${key}`}>
              {label}
            </Link>
          ))}
      </nav>
      <Outlet />
    </>
  );
}
function Overview({ superAdmin = false }) {
  const resource = useResource(
    superAdmin ? "/super-admin/overview" : "/admin/overview",
  );
  return (
    <Resource resource={resource}>
      {(data) => (
        <>
          <Facts row={data} />
          <h2>Status pesanan</h2>
          <Facts row={data.statuses} />
        </>
      )}
    </Resource>
  );
}
function Management({ kind }) {
  const { api } = useServer();
  const prefix = ["buyers", "admins", "fee-rules", "audit"].includes(kind)
    ? "/super-admin"
    : "/admin";
  const path = `${prefix}/${kind}`,
    resource = useResource(path);
  const statuses = {
    stores: ["active", "suspended", "closed"],
    products: ["approved", "rejected", "pending"],
    reports: ["reviewing", "resolved", "rejected"],
    buyers: ["active", "suspended", "blocked"],
  };
  return (
    <>
      <h2>{managementSections[kind]}</h2>
      {kind === "admins" && (
        <details>
          <summary>Tambah admin</summary>
          <Form
            fields={["name", "email", "password", "reason"]}
            submit={(body) => api.request(path, { method: "POST", body })}
            onDone={resource.reload}
          />
        </details>
      )}
      {kind === "fee-rules" && (
        <details>
          <summary>Tambah aturan fee</summary>
          <FeeForm onDone={resource.reload} />
        </details>
      )}
      <Resource resource={resource}>
        {(rows) => (
          <div className="w-stack">
            {!rows.length && <p>Belum ada data.</p>}
            {rows.map((row) => (
              <section className="w-panel" key={row.id}>
                <Facts row={row} />
                {kind === "audit" && (
                  <details>
                    <summary>Rincian perubahan</summary>
                    <h3>Sebelum</h3>
                    <Facts row={row.before_data} />
                    <h3>Sesudah</h3>
                    <Facts row={row.after_data} />
                  </details>
                )}
                {statuses[kind] && (
                  <Form
                    fields={[
                      { key: "status", options: statuses[kind] },
                      "reason",
                    ]}
                    submit={(body) =>
                      api.request(`${path}/${row.id}`, {
                        method: "PATCH",
                        body,
                      })
                    }
                    onDone={resource.reload}
                  />
                )}
                {kind === "applications" &&
                  ["submitted", "under_review"].includes(row.status) && (
                    <Form
                      fields={[
                        {
                          key: "approve",
                          label: "Keputusan",
                          options: [
                            { value: "true", label: "Setujui" },
                            { value: "false", label: "Tolak" },
                          ],
                        },
                        "reason",
                      ]}
                      submit={(data) =>
                        api.request(`${path}/${row.id}/review`, {
                          method: "POST",
                          body: {
                            reason: data.reason,
                            approve: data.approve === "true",
                          },
                        })
                      }
                      onDone={resource.reload}
                    />
                  )}
                {kind === "admins" && (
                  <Form
                    fields={[
                      {
                        key: "action",
                        options: ["enable", "disable", "reset"],
                      },
                      "reason",
                    ]}
                    submit={(body) =>
                      api.request(`${path}/${row.id}`, {
                        method: "PATCH",
                        body,
                      })
                    }
                    onDone={resource.reload}
                  />
                )}
                {kind === "fee-rules" && (
                  <Form
                    fields={["reason"]}
                    button="Nonaktifkan"
                    submit={(body) =>
                      api.request(`${path}/${row.id}/disable`, {
                        method: "POST",
                        body,
                      })
                    }
                    onDone={resource.reload}
                  />
                )}
              </section>
            ))}
          </div>
        )}
      </Resource>
    </>
  );
}
function CategoryManagement() {
  const { api } = useServer();
  const resource = useResource("/admin/categories");
  const [dialog, setDialog] = useState(null),
    [notice, setNotice] = useState(null);
  const open = (next) => {
    setNotice(null);
    setDialog(next);
  };
  const done = (message) => {
    setDialog(null);
    setNotice(message);
    resource.reload();
  };
  return (
    <section className="live-categories">
      <div className="w-heading">
        <div>
          <h2>Kategori</h2>
          <p>Kelola kategori yang tersedia untuk lapak di Wally Mall.</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => open({ mode: "create" })}
        >
          + Tambah kategori
        </button>
      </div>
      {notice && <p role="status">{notice}</p>}
      <Resource resource={resource} loadingText="Memuat kategori…">
        {(rows) =>
          rows.length ? (
            <div className="w-table-scroll">
              <table className="w-table live-category-table">
                <thead>
                  <tr>
                    <th scope="col">Nama Kategori</th>
                    <th scope="col">Status</th>
                    <th scope="col">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((c) => (
                    <tr key={c.id}>
                      <td data-label="Nama Kategori">
                        {c.name}
                        {c.usage_count > 0 && (
                          <small>Dipakai oleh {c.usage_count} data</small>
                        )}
                      </td>
                      <td data-label="Status">
                        <span
                          className={`w-badge ${c.status === "active" ? "good" : "bad"}`}
                        >
                          {c.status === "active" ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td data-label="Aksi">
                        <div className="w-actions">
                          <button
                            className="btn btn-outline"
                            onClick={() => open({ mode: "edit", category: c })}
                          >
                            Edit
                          </button>
                          {c.status === "active" ? (
                            <button
                              className="btn btn-outline"
                              onClick={() =>
                                open({ mode: "deactivate", category: c })
                              }
                            >
                              Nonaktifkan
                            </button>
                          ) : (
                            <Action
                              run={() =>
                                api.request(`/admin/categories/${c.id}`, {
                                  method: "PATCH",
                                  body: { status: "active" },
                                })
                              }
                              onDone={() =>
                                done(`Kategori "${c.name}" diaktifkan.`)
                              }
                            >
                              Aktifkan
                            </Action>
                          )}
                          {c.usage_count === 0 && (
                            <button
                              className="btn btn-outline"
                              onClick={() =>
                                open({ mode: "delete", category: c })
                              }
                            >
                              Hapus
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="w-panel">
              Belum ada kategori. Tambahkan kategori agar seller dapat memilih
              kategori usaha.
            </p>
          )
        }
      </Resource>
      {dialog && (
        <CategoryDialog
          {...dialog}
          onClose={() => setDialog(null)}
          onDone={done}
        />
      )}
    </section>
  );
}
function CategoryDialog({ mode, category, onClose, onDone }) {
  const { api } = useServer();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(null);
  const copy = {
    create: { title: "Tambah kategori", button: "Tambah kategori" },
    edit: { title: "Edit kategori", button: "Simpan" },
    deactivate: { title: "Nonaktifkan kategori", button: "Nonaktifkan" },
    delete: { title: "Hapus kategori", button: "Hapus" },
  }[mode];
  const path = category
    ? `/admin/categories/${category.id}`
    : "/admin/categories";
  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    const name = new FormData(e.currentTarget).get("name");
    setBusy(true);
    setError(null);
    try {
      const result = await api.request(
        path,
        mode === "create"
          ? { method: "POST", body: { name } }
          : mode === "edit"
            ? { method: "PATCH", body: { name } }
            : mode === "deactivate"
              ? { method: "PATCH", body: { status: "inactive" } }
              : { method: "DELETE" },
      );
      onDone(
        {
          create: `Kategori "${result.name}" ditambahkan.`,
          edit: `Kategori disimpan sebagai "${result.name}".`,
          deactivate: `Kategori "${category?.name}" dinonaktifkan.`,
          delete: `Kategori "${category?.name}" dihapus.`,
        }[mode],
      );
    } catch (e) {
      setError(e);
      setBusy(false);
    }
  }
  return (
    <Modal title={copy.title} onClose={busy ? () => {} : onClose}>
      <form className="form-stack" onSubmit={submit}>
        {["create", "edit"].includes(mode) ? (
          <Field label="Nama kategori">
            <input
              className="input"
              name="name"
              required
              maxLength={150}
              pattern=".*\S.*"
              title="Nama kategori tidak boleh kosong."
              defaultValue={category?.name}
              disabled={busy}
              autoFocus
            />
          </Field>
        ) : mode === "deactivate" ? (
          <p>
            Kategori <strong>{category.name}</strong> tidak akan muncul di
            pendaftaran lapak, dan produk dalam kategori ini disembunyikan dari
            katalog publik sampai kategori diaktifkan kembali.
          </p>
        ) : (
          <p>
            Hapus kategori <strong>{category.name}</strong>? Kategori ini belum
            dipakai oleh data apa pun.
          </p>
        )}
        <ErrorMessage error={error} />
        <div className="w-actions">
          <button
            type="button"
            className="btn btn-outline"
            disabled={busy}
            onClick={onClose}
          >
            Batal
          </button>
          <button className="btn btn-primary" disabled={busy}>
            {busy ? "Memproses…" : copy.button}
          </button>
        </div>
      </form>
    </Modal>
  );
}
function FeeForm({ onDone }) {
  const { api } = useServer();
  const stores = useResource("/admin/stores"),
    categories = useResource("/admin/categories");
  return (
    <Resource resource={stores}>
      {(s) => (
        <Resource resource={categories}>
          {(c) => (
            <Form
              fields={[
                "name",
                {
                  key: "percentage",
                  type: "number",
                  min: 0,
                  max: 100,
                  step: "0.0001",
                },
                { key: "fixed_amount", type: "number", min: 0 },
                {
                  key: "scope",
                  label: "Berlaku untuk",
                  options: [
                    { value: "global", label: "Semua toko" },
                    ...s.map((x) => ({
                      value: `store:${x.id}`,
                      label: `Toko: ${x.name}`,
                    })),
                    ...c.map((x) => ({
                      value: `category:${x.id}`,
                      label: `Kategori: ${x.name}`,
                    })),
                  ],
                },
                { key: "effective_from", type: "datetime-local" },
                {
                  key: "effective_until",
                  type: "datetime-local",
                  optional: true,
                },
                { key: "status", options: ["active", "scheduled"] },
                "reason",
              ]}
              submit={({ scope, ...data }) => {
                const [scope_type, scope_id] = scope.split(":");
                return api.request("/super-admin/fee-rules", {
                  method: "POST",
                  body: {
                    ...data,
                    scope_type,
                    scope_id: scope_id || null,
                    effective_from: new Date(data.effective_from).toISOString(),
                    effective_until: data.effective_until
                      ? new Date(data.effective_until).toISOString()
                      : null,
                  },
                });
              }}
              onDone={onDone}
            />
          )}
        </Resource>
      )}
    </Resource>
  );
}
export { managementSections, AdminShell, Overview, Management, CategoryManagement, CategoryDialog, FeeForm };
