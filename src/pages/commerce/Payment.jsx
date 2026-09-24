import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { usePrototype } from '../../state/PrototypeContext';
import { rupiah } from '../../utils/format';
import { Badge } from '../../components/commerce/Shared';
import { EmptyState } from '../../components/common/UI';
export default function Payment() {
  const {
    id
  } = useParams();
  const {
    view,
    paymentEvent
  } = usePrototype();
  const [busy, setBusy] = useState(false);
  const p = view.sessions.find(p => p.id === id);
  if (!p) return <EmptyState title="Sesi pembayaran tidak ditemukan" to="/orders" label="Lihat pesanan" />;
  const orders = view.orders.filter(o => o.checkoutId === p.checkoutId);
  async function simulate(outcome) {
    setBusy(true);
    await new Promise(r => setTimeout(r, 400));
    paymentEvent(id, outcome);
    setBusy(false);
  }
  return <div className="page w-payment"><section className="w-panel"><p className="eyebrow">PAYMENT GATEWAY · MOCK</p><h1>{p.status === 'success' ? 'Pembayaran berhasil!' : p.status === 'pending' ? 'Selesaikan pembayaran' : p.status === 'expired' ? 'Waktu pembayaran habis' : 'Pembayaran gagal'}</h1><p>Prototype Mode · Jangan melakukan pembayaran sungguhan.</p><Badge status={p.status} /><h2>{rupiah(p.amount)}</h2><p>{p.method} · {p.id}</p>{p.status === 'pending' ? <><div className="w-payment-token">{p.method === 'QRIS' ? '▦ QRIS DEMO ▦' : p.method === 'Virtual Account' ? 'DEMO · 8808 2609 2400' : 'Wally E-Wallet Sandbox'}<small>Ilustrasi, bukan kode pembayaran</small></div><p>Berlaku sampai {new Date(p.expiresAt).toLocaleTimeString('id-ID')}</p><div className="w-stack"><button disabled={busy} className="btn btn-primary" onClick={() => simulate('success')}>{busy ? 'Memproses webhook…' : 'Simulasikan pembayaran berhasil'}</button><div className="w-actions"><button disabled={busy} className="btn btn-outline" onClick={() => simulate('failed')}>Simulasi gagal</button><button disabled={busy} className="btn btn-outline" onClick={() => simulate('expired')}>Simulasi kedaluwarsa</button></div></div></> : <><p>{p.status === 'success' ? 'Webhook demo diterima. Pesanan berbayar siap diproses seller.' : 'Pesanan tidak diteruskan ke seller. Stok dilepas; buat checkout baru untuk mencoba kembali.'}</p>{p.reference && <small>Referensi: {p.reference}</small>}</>}<div className="w-stack">{orders.map(o => <Link key={o.id} to={`/orders/${o.id}`} className="text-link">Lacak {o.id} →</Link>)}<Link to="/orders" className="btn btn-outline">Semua pesanan</Link>{p.status !== 'pending' && p.status !== 'success' && <Link to="/explore" className="btn btn-primary">Belanja kembali</Link>}</div></section></div>;
}
