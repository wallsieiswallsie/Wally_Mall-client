import { useState } from 'react';
import { Link } from '../../ui/navigation.jsx';

import { useParams } from 'react-router';

import { paymentAction } from '../../api-client/payment.js';
import { useServer } from './context.jsx';
import { money } from './format.js';
import { useResource } from './resource.js';
import { Resource } from './Forms.jsx';
import { Form } from './Forms.jsx';
import { Facts } from './Forms.jsx';
import { Report } from './Report.jsx';

function Orders({ seller = false, admin = false, financial = false }) {
  const { id } = useParams(),
    { api } = useServer();
  const path = financial
    ? "/super-admin/transactions"
    : admin
      ? "/admin/orders"
      : seller
        ? "/seller/orders"
        : "/orders";
  const [offset, setOffset] = useState(0);
  const resource = useResource(
    !seller && !admin && !financial && id
      ? `/orders/${id}`
      : `${path}?limit=30&offset=${offset}`,
    { sellerOrderId: seller ? id : undefined },
  );
  return (
    <>
      <h1>{seller ? "Pesanan toko" : "Pesanan"}</h1>
      <Resource resource={resource}>
        {(result) => {
          const rows = Array.isArray(result)
            ? result.filter((row) => !id || row.id === id)
            : [result];
          return (
            <div className="w-stack">
              {!rows.length && <p>Belum ada pesanan pada halaman ini.</p>}
              {rows.map((o) => (
                <section className="w-panel" key={o.id}>
                  <h2>{o.order_number}</h2>
                  <Facts row={o} />
                  {o.payment && (
                    <>
                      <h3>Pembayaran</h3>
                      <Facts row={o.payment} />
                    </>
                  )}
                  {o.fulfillment && (
                    <>
                      <h3>Pengiriman / pengambilan</h3>
                      <Facts row={o.fulfillment} />
                    </>
                  )}
                  {o.timeline?.length > 0 && (
                    <ol className="w-timeline">
                      {o.timeline.map((event, i) => (
                        <li key={i}>
                          {event.to_status} ·{" "}
                          {new Date(event.created_at).toLocaleString("id-ID")}
                        </li>
                      ))}
                    </ol>
                  )}
                  {!seller &&
                    !admin &&
                    !financial &&
                    o.payment?.id && (
                      <Link
                        className="btn btn-primary"
                        to={`/payment/${o.payment.id}`}
                      >
                        {paymentAction(o.payment).label}
                      </Link>
                    )}
                  {!admin && !financial && (
                    <Report targetType="order" targetId={o.id} />
                  )}
                  {o.items?.map((item) => (
                    <p key={item.id}>
                      {item.product_name} · {item.variant_name} ×{" "}
                      {item.quantity}
                      {item.subtotal ? ` — ${money(item.subtotal)}` : ""}
                    </p>
                  ))}
                  {o.address && <Facts row={o.address} />}
                  {seller &&
                    [
                      "confirmed",
                      "processing",
                      "ready",
                      "in_delivery",
                    ].includes(o.status) && (
                      <Form
                        fields={[
                          {
                            key: "status",
                            options:
                              o.status === "confirmed"
                                ? ["processing"]
                                : o.status === "processing"
                                  ? ["ready"]
                                  : o.status === "ready"
                                    ? o.fulfillment_type === "pickup"
                                      ? ["completed"]
                                      : ["in_delivery"]
                                    : ["completed"],
                          },
                        ]}
                        button="Perbarui status"
                        submit={(body) =>
                          api.request(`/seller/orders/${o.id}/status`, {
                            method: "PATCH",
                            body,
                          })
                        }
                        onDone={resource.reload}
                      />
                    )}
                  {admin && o.status === "awaiting_payment" && (
                    <details>
                      <summary>Batalkan pesanan</summary>
                      <Form
                        fields={["reason"]}
                        submit={(body) =>
                          api.request(`/admin/orders/${o.id}/cancel`, {
                            method: "POST",
                            body,
                          })
                        }
                        onDone={resource.reload}
                      />
                    </details>
                  )}
                  {financial &&
                    [
                      "confirmed",
                      "processing",
                      "ready",
                      "in_delivery",
                      "completed",
                    ].includes(o.status) && (
                      <details>
                        <summary>Refund pesanan</summary>
                        <Form
                          fields={["reason"]}
                          submit={(body) =>
                            api.request(`/super-admin/orders/${o.id}/refund`, {
                              method: "POST",
                              body,
                            })
                          }
                          onDone={resource.reload}
                        />
                      </details>
                    )}
                </section>
              ))}
              {!id && (
                <div className="w-actions">
                  <button
                    className="btn btn-outline"
                    disabled={offset === 0}
                    onClick={() => setOffset(Math.max(0, offset - 30))}
                  >
                    Sebelumnya
                  </button>
                  <button
                    className="btn btn-outline"
                    disabled={rows.length < 30}
                    onClick={() => setOffset(offset + 30)}
                  >
                    Selanjutnya
                  </button>
                </div>
              )}
            </div>
          );
        }}
      </Resource>
    </>
  );
}
export { Orders };
