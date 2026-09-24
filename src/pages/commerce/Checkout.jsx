import { useState } from 'react';
import { useNavigate } from 'react-router';
import { usePrototype } from '../../state/PrototypeContext';
import { fulfillmentOptions, fulfillmentLabels } from '../../domain/commerce';
import { Field, Modal, EmptyState } from '../../components/common/UI';
import { CartLines, Totals } from './Cart';
import { rupiah } from '../../utils/format';
export default function Checkout() {
  const {
    view,
    estimate,
    checkout,
    saveAddress
  } = usePrototype();
  const navigate = useNavigate();
  const [selected, setSelected] = useState(view.addresses[0]?.id);
  const [adding, setAdding] = useState(false);
  const [delivery, setDelivery] = useState({});
  const [method, setMethod] = useState('QRIS');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const q = estimate(delivery);
  const address = view.addresses.find(a => a.id === selected);
  if (!q.groups.length) return <EmptyState title="Belum ada produk untuk checkout" text="Tambahkan produk ke keranjang terlebih dahulu." />;
  async function submit() {
    setBusy(true);
    setError('');
    try {
      if (!address) throw new Error('Pilih alamat terlebih dahulu.');
      const id = await checkout(address, delivery, method);
      navigate(`/payment/${id}`);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return <div className="page w-commerce"><div className="w-page-title"><p className="eyebrow">KERANJANG → CHECKOUT → PEMBAYARAN</p><h1>Sedikit lagi, sampai di kamu.</h1><p>Periksa alamat, pengiriman, dan pilihan pembayaran.</p></div><div className="w-checkout-grid"><div className="w-stack"><section className="w-panel"><div className="w-heading"><h2>01 · Alamat penerima</h2><button className="text-link" onClick={() => setAdding(true)}>+ Alamat baru</button></div>{view.addresses.map(a => <label className={`w-choice ${selected === a.id ? 'selected' : ''}`} key={a.id}><input type="radio" name="address" checked={selected === a.id} onChange={() => setSelected(a.id)} /><div><strong>{a.recipient} · {a.phone}</strong><p>{a.address}, {a.district}, {a.city} {a.postalCode}</p><small>{a.notes}</small></div></label>)}<div className="w-map">⌖ Papua Barat Daya → Kota Sorong → {address?.district}<small>Lokasi ilustrasi · Pin peta belum terhubung</small></div></section><section className="w-panel"><h2>02 · Pesanan per lapak</h2>{q.groups.map(g => <div key={g.seller} className="w-seller-group"><h3>{view.sellers.find(s => s.slug === g.seller)?.name}</h3><CartLines group={g} /><label className="field"><span>Pengiriman / pengambilan</span><select className="select" value={g.fulfillment} onChange={e => setDelivery({
                ...delivery,
                [g.seller]: e.target.value
              })}>{fulfillmentOptions(g.seller).map(f => <option key={f} value={f}>{fulfillmentLabels[f]}</option>)}</select></label><p className="muted">{g.fulfillment === 'pickup' ? 'Ambil di toko setelah seller menyatakan siap.' : 'Estimasi 1–2 hari setelah seller memproses.'}</p><div className="w-heading"><span>Barang + pengiriman {rupiah(g.delivery)}</span><strong>{rupiah(g.subtotal + g.delivery)}</strong></div></div>)}</section><section className="w-panel"><h2>03 · Metode pembayaran</h2>{['QRIS', 'Virtual Account', 'E-Wallet'].map(m => <label className="w-choice" key={m}><input type="radio" name="method" checked={method === m} onChange={() => setMethod(m)} /><strong>{m}</strong><span className="muted">Gateway demo</span></label>)}<p className="muted">Simulasi pembayaran melalui PaymentGateway. Tidak ada uang yang dipindahkan.</p></section></div><aside className="w-panel w-summary"><h2>Ringkasan pesanan</h2><Totals quote={q} />{error && <p role="alert" className="w-error">{error}</p>}<button disabled={busy} onClick={submit} className="btn btn-primary full">{busy ? 'Membuat sesi pembayaran…' : 'Buat pesanan & bayar →'}</button><small>Pesanan dibuat dengan status menunggu pembayaran. Seller menerima pesanan setelah pembayaran berhasil.</small></aside></div>{adding && <Modal title="Tambahkan alamat Sorong" onClose={() => setAdding(false)}><form className="form-stack" onSubmit={e => {
        e.preventDefault();
        const a = Object.fromEntries(new FormData(e.currentTarget));
        saveAddress(a);
        setAdding(false);
      }}>{[['recipient', 'Nama penerima'], ['phone', 'Nomor telepon'], ['address', 'Alamat lengkap'], ['district', 'Distrik'], ['city', 'Kota'], ['region', 'Provinsi'], ['postalCode', 'Kode pos (opsional)'], ['notes', 'Catatan (opsional)']].map(([key, label]) => <Field key={key} label={label}><input className="input" name={key} required={!['notes', 'postalCode'].includes(key)} defaultValue={key === 'city' ? 'Kota Sorong' : key === 'region' ? 'Papua Barat Daya' : ''} type={key === 'phone' ? 'tel' : 'text'} /></Field>)}<button className="btn btn-primary">Simpan alamat</button></form></Modal>}</div>;
}
