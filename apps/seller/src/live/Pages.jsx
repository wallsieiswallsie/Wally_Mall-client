import { useState } from 'react';
import { Link } from '../../../../packages/ui/navigation.jsx';

import { useNavigate } from '../../../../packages/ui/navigation.jsx';

import MediaUploader from '../../../../packages/ui/components/common/MediaUploader.jsx';
import { useServer } from '../../../../packages/shared/live/context.jsx';
import { useResource } from '../../../../packages/shared/live/resource.js';
import { Resource } from '../../../../packages/shared/live/Forms.jsx';
import { Form } from '../../../../packages/shared/live/Forms.jsx';
import { addressFields } from '../../../../packages/shared/live/format.js';
import { Facts } from '../../../../packages/shared/live/Forms.jsx';

function Onboarding() {
  const { api } = useServer();
  const categories = useResource("/categories", { auth: false }),
    applications = useResource("/seller/applications");
  return (
    <>
      <h1>Buka lapak</h1>
      <Resource resource={categories} loadingText="Memuat kategori…">
        {(rows) =>
          rows.length ? (
            <Form
              fields={[
                "proposed_store_name",
                "business_description",
                {
                  key: "business_category_id",
                  placeholder: "Pilih kategori usaha",
                  options: rows.map((c) => ({ value: c.id, label: c.name })),
                },
              ]}
              button="Kirim pengajuan"
              submit={(body) =>
                api.request("/seller/applications", { method: "POST", body })
              }
              onDone={applications.reload}
            />
          ) : (
            <section className="w-panel" role="status">
              <p>Belum ada kategori usaha yang tersedia.</p>
              <small>
                Pengajuan lapak dapat dikirim setelah admin menambahkan
                kategori.
              </small>
              <button className="btn btn-outline" onClick={categories.reload}>
                Muat ulang
              </button>
            </section>
          )
        }
      </Resource>
      <h2>Pengajuan saya</h2>
      <Resource resource={applications}>
        {(rows) =>
          rows.map((row) => (
            <section className="w-panel" key={row.id}>
              <Facts row={row} />
            </section>
          ))
        }
      </Resource>
    </>
  );
}
function Seller() {
  const stores = useResource("/seller/stores"),
    overview = useResource("/seller/overview");
  return (
    <>
      <h1>Dashboard seller</h1>
      <div className="w-actions">
        <Link to="/seller/orders">Pesanan toko</Link>
        <Link to="/seller/products/new">Tambah produk</Link>
      </div>
      <Resource resource={overview}>{(data) => <Facts row={data} />}</Resource>
      <Resource resource={stores}>
        {(rows) =>
          rows.map((store) => <SellerStore key={store.id} store={store} />)
        }
      </Resource>
    </>
  );
}
function SellerStore({ store: initialStore }) {
  const [store, setStore] = useState(initialStore);
  const { api } = useServer();
  const products = useResource(`/seller/stores/${store.id}/products`);
  return (
    <section className="w-panel">
      <h2>{store.name}</h2>
      <details>
        <summary>Ubah toko</summary>
        <Form
          fields={[
            { key: "name", value: store.name },
            { key: "description", value: store.description },
            {
              key: "status",
              value: store.status,
              options: ["draft", "active"],
            },
          ]}
          submit={(body) =>
            api.request(`/seller/stores/${store.id}`, { method: "PATCH", body })
          }
          onDone={(result) =>
            setStore((previous) => ({ ...previous, ...result }))
          }
        />
      </details>
      <details>
        <summary>Alamat utama toko (wajib sebelum aktivasi)</summary>
        <Form
          fields={[
            {
              key: "type",
              label: "Jenis alamat",
              options: ["storefront", "warehouse", "pickup"],
            },
            ...addressFields.filter(
              (f) =>
                !["recipient_name", "phone", "notes"].includes(
                  typeof f === "string" ? f : f.key,
                ),
            ),
          ]}
          submit={(address) =>
            api.request(`/seller/stores/${store.id}`, {
              method: "PATCH",
              body: { address },
            })
          }
        />
      </details>
      <Resource resource={products}>
        {(rows) =>
          rows.map((p) => (
            <div className="w-panel" key={p.id}>
              <h3>{p.name}</h3>
              <p>
                {p.status} · {p.moderation_status}
              </p>
              <Form
                fields={[
                  { key: "name", value: p.name },
                  {
                    key: "status",
                    value: p.status,
                    options: ["draft", "active", "hidden"],
                  },
                ]}
                submit={(body) =>
                  api.request(`/seller/products/${p.id}`, {
                    method: "PATCH",
                    body,
                  })
                }
                onDone={products.reload}
              />
              <SellerVariants product={p} />
            </div>
          ))
        }
      </Resource>
    </section>
  );
}
function AddProduct() {
  const { api } = useServer(),
    navigate = useNavigate();
  const [images, setImages] = useState([]);
  const stores = useResource("/seller/stores"),
    categories = useResource("/categories", { auth: false });
  return (
    <>
      <h1>Tambah produk</h1>
      <Resource resource={stores}>
        {(s) => (
          <Resource resource={categories}>
            {(c) => (
              <Form
                fields={[
                  {
                    key: "store_id",
                    label: "Toko",
                    options: s.map((row) => ({
                      value: row.id,
                      label: row.name,
                    })),
                  },
                  "name",
                  "description",
                  {
                    key: "category_id",
                    options: c.map((row) => ({
                      value: row.id,
                      label: row.name,
                    })),
                  },
                  { key: "condition", options: ["new", "used"] },
                  "variant_name",
                  { key: "price", type: "number", min: 0 },
                  { key: "on_hand", type: "number", min: 0, max: 99999 },
                ]}
                submit={({ store_id, variant_name, price, on_hand, ...body }) =>
                  api.request(`/seller/stores/${store_id}/products`, {
                    method: "POST",
                    body: {
                      ...body,
                      variants: [
                        { name: variant_name, price, on_hand: Number(on_hand) },
                      ],
                      media: images.map((image) => ({
                        media_asset_id: image.asset.id,
                      })),
                    },
                  })
                }
                onDone={() => navigate("/seller/dashboard")}
                disabled={images.some((image) => image.status !== "uploaded")}
              >
                {(busy) => (
                  <MediaUploader
                    api={api}
                    value={images}
                    onChange={setImages}
                    disabled={busy}
                  />
                )}
              </Form>
            )}
          </Resource>
        )}
      </Resource>
    </>
  );
}
function SellerVariants({ product }) {
  const { api } = useServer();
  const [open, setOpen] = useState(false);
  const resource = useResource(
    open ? `/seller/products/${product.id}` : null,
  );
  return (
    <details onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary>Harga dan stok varian</summary>
      <p>
        Stok fisik tidak boleh lebih kecil daripada stok yang sedang dipesan.
      </p>
      <Resource resource={resource}>
        {(p) =>
          p.variants.map((v) => (
            <Form
              key={v.id}
              fields={[
                { key: "name", value: v.name },
                { key: "price", value: v.price, type: "number", min: 0 },
                {
                  key: "on_hand",
                  label: `Stok fisik (saat ini ${v.on_hand}, dipesan ${v.reserved}, tersedia ${v.available})`,
                  optional: true,
                  type: "number",
                  min: 0,
                  max: 99999,
                },
              ]}
              submit={(data) =>
                api.request(`/seller/variants/${v.id}`, {
                  method: "PATCH",
                  body: {
                    ...data,
                    ...(data.on_hand === undefined
                      ? {}
                      : { on_hand: Number(data.on_hand) }),
                  },
                })
              }
              onDone={resource.reload}
            />
          ))
        }
      </Resource>
    </details>
  );
}
export { Onboarding, Seller, SellerStore, AddProduct, SellerVariants };
