import { useSearchParams } from 'react-router';

import { Link } from '../../../../packages/ui/navigation.jsx';
import { useResource } from '../../../../packages/shared/live/resource.js';
import { Resource } from '../../../../packages/shared/live/Forms.jsx';
import { money } from '../../../../packages/shared/live/format.js';

const ranges = [
  [7, '7 hari'],
  [30, '30 hari'],
  [90, '3 bulan'],
  [180, '6 bulan'],
  [365, '1 tahun'],
];
const statusLabels = {
  awaiting_payment: 'Menunggu pembayaran',
  confirmed: 'Menunggu diproses',
  processing: 'Diproses',
  ready: 'Siap dikirim / diambil',
  in_delivery: 'Dalam pengiriman',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
};
const reportLabels = { open: 'Baru', reviewing: 'Ditinjau', submitted: 'Diajukan', under_review: 'Ditinjau' };
const UNAVAILABLE = 'Data belum tersedia';

const percent = (value) => (value == null ? UNAVAILABLE : `${value}%`);
const date = (value) =>
  value ? new Date(value).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
function change(now, before) {
  const a = BigInt(now ?? 0),
    b = BigInt(before ?? 0);
  if (b === 0n) return a === 0n ? 'Sama dengan periode sebelumnya' : 'Periode sebelumnya belum ada data';
  const diff = Number(((a - b) * 1000n) / b) / 10;
  return `${diff > 0 ? '+' : ''}${diff}% dibanding periode sebelumnya`;
}

function Kpis({ items }) {
  return (
    <div className="w-kpis">
      {items.map(([label, value, note]) => (
        <article className="w-kpi" key={label}>
          <span>{label}</span>
          <strong className={value === UNAVAILABLE ? 'muted' : undefined}>{value}</strong>
          {note && <small>{note}</small>}
        </article>
      ))}
    </div>
  );
}

function Distribution({ data }) {
  const total = data.orders_in_range;
  return (
    <section className="w-panel">
      <h2>Distribusi status pesanan</h2>
      <p className="muted">
        {total} pesanan dibuat dalam {data.days} hari terakhir
      </p>
      {total ? (
        <div className="w-stack">
          {Object.entries(statusLabels).map(([status, label]) => {
            const n = data.statuses[status] ?? 0;
            return (
              <div key={status}>
                <div className="w-heading">
                  <span>{label}</span>
                  <strong>{n}</strong>
                </div>
                <div className="w-meter" role="presentation">
                  <i style={{ width: `${(n / total) * 100}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="w-empty">Belum ada pesanan pada periode ini.</p>
      )}
    </section>
  );
}

function Queue({ title, to, items, empty, render }) {
  return (
    <>
      <h2>{title}</h2>
      {items.length ? (
        items.map((item) => (
          <Link className="w-list-row" key={item.id} to={to}>
            {render(item)}
          </Link>
        ))
      ) : (
        <p className="muted">{empty}</p>
      )}
    </>
  );
}

function Queues({ data, base }) {
  const { queues, operations } = data;
  return (
    <section className="w-panel">
      <Queue
        title={`Laporan terbuka (${operations.open_reports})`}
        to={`${base}/reports`}
        items={queues.reports}
        empty="Tidak ada laporan yang menunggu."
        render={(r) => (
          <>
            <div>
              <strong>{r.category}</strong>
              <small>
                Target: {r.target_type} · {date(r.created_at)}
              </small>
            </div>
            <span className="w-badge warm">{reportLabels[r.status] || r.status}</span>
          </>
        )}
      />
      <Queue
        title={`Verifikasi seller (${operations.pending_applications})`}
        to={`${base}/applications`}
        items={queues.applications}
        empty="Tidak ada pengajuan seller yang menunggu."
        render={(a) => (
          <>
            <div>
              <strong>{a.proposed_store_name}</strong>
              <small>
                {a.business_category_name || 'Tanpa kategori'} · diajukan {date(a.submitted_at)}
              </small>
            </div>
            <span className="w-badge warm">{reportLabels[a.status] || a.status}</span>
          </>
        )}
      />
      <Queue
        title={`Produk menunggu review (${operations.products_pending_review})`}
        to={`${base}/products`}
        items={queues.products}
        empty="Tidak ada produk yang menunggu review."
        render={(p) => (
          <>
            <div>
              <strong>{p.name}</strong>
              <small>{p.store_name}</small>
            </div>
            <span aria-hidden="true">→</span>
          </>
        )}
      />
    </section>
  );
}

function Operational({ data, base }) {
  const o = data.operations;
  return (
    <>
      <Kpis
        items={[
          ['Pesanan hari ini', o.orders_today, 'Semua status, WIB'],
          ['Menunggu diproses', o.awaiting_processing, 'Status confirmed di server'],
          ['Sedang diproses', o.processing],
          ['Menunggu kirim / ambil', o.awaiting_delivery],
          ['Selesai hari ini', o.completed_today],
          ['Verifikasi seller pending', o.pending_applications],
          ['Produk menunggu review', o.products_pending_review],
          ['Laporan terbuka', o.open_reports],
          ['Menunggu pembayaran', o.awaiting_payment, 'Belum dibayar buyer'],
          ['Kasus support', o.support_cases ?? UNAVAILABLE, o.support_cases == null && 'Modul support belum tersedia di server'],
        ]}
      />
      <div className="w-dashboard-grid">
        <Distribution data={data} />
        <Queues data={data} base={base} />
      </div>
    </>
  );
}

function TrendChart({ finance }) {
  const max = finance.trend.reduce((m, d) => (BigInt(d.gmv) > m ? BigInt(d.gmv) : m), 0n);
  const height = (value) => (max ? `${Number((BigInt(value) * 10000n) / max) / 100}%` : '0%');
  return (
    <section className="w-panel w-chart-panel">
      <div className="w-heading">
        <div>
          <h2>GMV & platform revenue</h2>
          <p className="muted">Hanya pesanan dengan pembayaran provider terverifikasi</p>
        </div>
        <span className="w-badge">IDR</span>
      </div>
      {max ? (
        <>
          <div className="w-chart-legend">
            <span>● GMV</span>
            <span>● Platform revenue</span>
          </div>
          <div
            className="w-bar-chart"
            role="img"
            aria-label={`GMV ${money(finance.gmv)}, platform revenue ${money(finance.revenue)}`}
          >
            {finance.trend.map((d) => (
              <div key={d.date} className="w-chart-column" title={`${date(d.date)}: GMV ${money(d.gmv)}, revenue ${money(d.revenue)}`}>
                <div>
                  <i style={{ height: height(d.gmv) }} />
                  <b style={{ height: height(d.revenue) }} />
                </div>
                <small>{new Date(d.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</small>
              </div>
            ))}
          </div>
          <details>
            <summary>Lihat data chart</summary>
            <div className="w-table-scroll">
              <table className="w-table">
                <thead>
                  <tr>
                    <th scope="col">Sampai tanggal</th>
                    <th scope="col">GMV</th>
                    <th scope="col">Revenue</th>
                    <th scope="col">Transaksi</th>
                  </tr>
                </thead>
                <tbody>
                  {finance.trend.map((d) => (
                    <tr key={d.date}>
                      <td>{date(d.date)}</td>
                      <td>{money(d.gmv)}</td>
                      <td>{money(d.revenue)}</td>
                      <td>{d.transactions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </>
      ) : (
        <p className="w-empty">
          Belum ada transaksi dengan pembayaran provider terverifikasi pada periode ini.
        </p>
      )}
      <small>
        GMV = subtotal barang pesanan berbayar, tanpa ongkir dan biaya layanan; pesanan dengan refund sukses dikeluarkan.
        Revenue = platform fee + biaya layanan pada pesanan yang sama.
        {finance.simulated_paid_orders > 0 &&
          ` ${finance.simulated_paid_orders} pesanan dengan pembayaran simulasi (mock) tidak dihitung karena payment gateway masih ON HOLD.`}
      </small>
    </section>
  );
}

function Finance({ data }) {
  const f = data.finance;
  const health = [
    ['Order completion rate', percent(f.rates.completion), 'Selesai ÷ pesanan berbayar terverifikasi'],
    ['Cancellation rate', percent(f.rates.cancellation), 'Dibatalkan ÷ seluruh pesanan periode'],
    ['Refund rate', percent(f.rates.refund), 'Refund sukses ÷ pesanan berbayar terverifikasi'],
    ['Repeat purchase rate', percent(f.rates.repeat_purchase), 'Buyer dengan >1 transaksi'],
    ['Payment success rate', percent(f.rates.payment_success), data.unavailable.payment_success ? 'Belum ada pembayaran provider asli (gateway ON HOLD)' : 'Sukses ÷ pembayaran yang sudah final'],
    ['Seller aktif bertransaksi', f.active_stores, `${f.active_store_accounts} akun toko berstatus aktif`],
    ['Verifikasi seller pending', data.operations.pending_applications, 'Antrean pengajuan seller'],
    ['Laporan terbuka', data.operations.open_reports, 'Perlu ditinjau'],
  ];
  return (
    <>
      <Kpis
        items={[
          ['Gross Merchandise Value', money(f.gmv), change(f.gmv, f.previous.gmv)],
          ['Platform revenue', money(f.revenue), change(f.revenue, f.previous.revenue)],
          ['Transaksi terverifikasi', f.transactions, change(f.transactions, f.previous.transactions)],
          ['Average order value', f.aov == null ? UNAVAILABLE : money(f.aov), f.aov == null && 'Belum ada transaksi terverifikasi'],
          ['Total buyer', f.total_buyers, 'Akun buyer terdaftar'],
          ['Buyer aktif', f.active_buyers, 'Bertransaksi pada periode'],
          ['Total seller', f.total_stores, 'Toko terdaftar (non-draft)'],
          ['Seller aktif', f.active_store_accounts, 'Toko berstatus aktif'],
          ['Produk tayang', f.total_products, 'Aktif dan disetujui'],
          ['Pesanan pada periode', f.orders, change(f.orders, f.previous.orders)],
          ['Pesanan selesai', data.statuses.completed ?? 0, 'Dibuat pada periode'],
          ['Pesanan dibatalkan', data.statuses.cancelled ?? 0, 'Dibuat pada periode'],
        ]}
      />
      <div className="w-dashboard-grid">
        <TrendChart finance={f} />
        <Distribution data={data} />
      </div>
      <section className="w-panel">
        <h2>Marketplace health</h2>
        <p className="muted">
          Dihitung server dari data periode terpilih. Nilai tanpa penyebut valid ditampilkan sebagai “{UNAVAILABLE}”.
        </p>
        <div className="w-health-grid">
          {health.map(([label, value, note]) => (
            <div key={label}>
              <span>{label}</span>
              <strong className={value === UNAVAILABLE ? 'muted' : undefined}>{value}</strong>
              <small className="muted">{note}</small>
            </div>
          ))}
        </div>
      </section>
      <section className="w-panel">
        <h2>Marketplace funnel</h2>
        <p className="muted">
          {UNAVAILABLE}: server belum merekam event product view, add to cart, dan checkout started. Funnel akan tampil
          setelah event tracking tersedia; angka simulasi prototype tidak digunakan.
        </p>
      </section>
    </>
  );
}

function Overview({ superAdmin = false, operational = false }) {
  const [params, setParams] = useSearchParams();
  const requested = Number(params.get('days'));
  const days = ranges.some(([value]) => value === requested) ? requested : 30;
  const base = superAdmin ? '/super-admin' : '/admin';
  const finance = superAdmin && !operational;
  const resource = useResource(`${base}/overview?days=${days}`);
  return (
    <>
      <div className="w-dashboard-title">
        <div>
          <p className="eyebrow">{finance ? 'MARKETPLACE PULSE' : 'OPERASIONAL'} · SORONG</p>
          <h1>{finance ? 'Overview marketplace' : 'Halo, tim Wally.'}</h1>
          <p>
            {finance
              ? 'Pertumbuhan dan kesehatan marketplace dari data server.'
              : 'Bantu setiap pesanan sampai. Jaga setiap lapak tetap terpercaya.'}
          </p>
        </div>
        <label className="field">
          <span>Rentang data</span>
          <select
            className="select"
            value={days}
            onChange={(e) => setParams({ days: e.target.value }, { replace: true })}
          >
            {ranges.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <Resource resource={resource} loadingText="Memuat overview…">
        {(data) => (
          <>
            <div className="w-insight">
              <span aria-hidden="true">✦</span>
              <p>
                <strong>Antrean hari ini.</strong> {data.operations.open_reports} laporan perlu ditinjau,{' '}
                {data.operations.pending_applications} pengajuan seller menunggu verifikasi, dan{' '}
                {data.operations.awaiting_processing} pesanan menunggu diproses seller.
              </p>
              <Link className="text-link" to={`${base}/reports`}>
                Tinjau laporan →
              </Link>
            </div>
            {finance ? <Finance data={data} /> : <Operational data={data} base={base} />}
            <small className="muted">Diperbarui {new Date(data.generated_at).toLocaleString('id-ID')}</small>
          </>
        )}
      </Resource>
    </>
  );
}

export { Overview };
