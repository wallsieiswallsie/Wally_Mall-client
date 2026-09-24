import { useState } from 'react';
import { usePrototype } from '../../state/PrototypeContext';
import { Badge, Confirm, DataTable } from '../../components/commerce/Shared';
import { Field, Modal } from '../../components/common/UI';
import { categories } from '../../data/categories';
import { rupiah } from '../../utils/format';
export function AdminManagement() {
  const {
    view,
    action
  } = usePrototype();
  const [add, setAdd] = useState(false);
  const [detail, setDetail] = useState(null);
  const [change, setChange] = useState(null);
  return <><div className="w-dashboard-title"><div><p className="eyebrow">SUPER ADMIN EXCLUSIVE</p><h1>Admin Management</h1><p>Akses operasional yang terukur, dengan jejak setiap perubahan.</p></div><button className="btn btn-primary" onClick={() => setAdd(true)}>+ Add Admin</button></div><section className="w-panel"><DataTable rows={view.admins} columns={[{
        label: 'Admin name',
        key: 'name'
      }, {
        label: 'Email',
        key: 'email'
      }, {
        label: 'Role',
        key: 'role'
      }, {
        label: 'Status',
        render: a => <Badge status={a.status} />
      }, {
        label: 'Created at',
        render: a => a.created.slice(0, 10)
      }, {
        label: 'Last login',
        render: a => a.lastLogin === 'Belum masuk' ? a.lastLogin : new Date(a.lastLogin).toLocaleString('id-ID')
      }, {
        label: 'Actions',
        render: a => <div className="w-actions"><button className="text-link" onClick={() => setDetail(a)}>View</button><button className="text-link" onClick={() => setChange({
            id: a.id,
            value: a.status === 'active' ? 'inactive' : 'active',
            title: a.status === 'active' ? 'Deactivate admin' : 'Reactivate admin'
          })}>{a.status === 'active' ? 'Deactivate' : 'Reactivate'}</button><button className="text-link" onClick={() => setChange({
            id: a.id,
            value: 'reset',
            title: 'Reset access'
          })}>Reset Access</button></div>
      }]} /></section>{add && <Modal title="Add Admin" onClose={() => setAdd(false)}><form className="form-stack" onSubmit={e => {
        e.preventDefault();
        const details = Object.fromEntries(new FormData(e.currentTarget));
        setChange({
          id: 'new',
          value: '',
          type: 'admin-create',
          details,
          title: 'Konfirmasi admin baru'
        });
        setAdd(false);
      }}><Field label="Full name"><input name="name" className="input" required /></Field><Field label="Email"><input name="email" type="email" className="input" required /></Field><Field label="Invite method"><select name="invite" className="select"><option>Simulated email invitation</option><option>Temporary access link (demo)</option></select></Field><Field label="Role"><input className="input" readOnly value="admin" /></Field><p className="muted">Tidak ada undangan atau password sungguhan yang dikirim. Form ini tidak dapat membuat super_admin.</p><button className="btn btn-primary">Review admin baru</button></form></Modal>}{detail && <Modal title={detail.name} onClose={() => setDetail(null)}><div className="w-stack"><p>{detail.email} · {detail.role}</p><Badge status={detail.status} /><p>{detail.lastReset ? `Reset akses demo: ${new Date(detail.lastReset).toLocaleString('id-ID')}` : 'Belum pernah reset akses.'}</p></div></Modal>}{change && <Confirm title={change.title} onClose={() => setChange(null)} onConfirm={reason => action(change.type || 'admin', change.id, change.value, reason, change.details)}><p>{change.details ? `${change.details.name} · ${change.details.email} · admin` : change.id}</p><p>Perubahan akses demo ini akan dicatat pada Audit Log.</p></Confirm>}</>;
}
export function FeeSettings() {
  const {
    view,
    action
  } = usePrototype();
  const [editing, setEditing] = useState(null);
  const [change, setChange] = useState(null);
  const fee = r => r.type === 'percentage' ? `${r.percentage}%` : r.type === 'fixed' ? rupiah(r.fixed) : `${r.percentage}% + ${rupiah(r.fixed)}`;
  return <><div className="w-dashboard-title"><div><p className="eyebrow">SUPER ADMIN EXCLUSIVE · DEMO</p><h1>Platform Fee Settings</h1><p>Atur biaya masa depan, pertahankan keutuhan transaksi yang sudah tercatat.</p></div><button className="btn btn-primary" onClick={() => setEditing({
        id: crypto.randomUUID(),
        name: '',
        scope: 'all',
        target: '',
        type: 'percentage',
        percentage: 0,
        fixed: 0,
        effective: new Date().toISOString().slice(0, 10),
        until: '',
        active: true
      })}>+ Add fee rule</button></div><section className="w-panel"><h2>Default transaction fee</h2><p className="muted">Urutan prioritas: seller → category → default. Aturan dengan effective date terbaru digunakan. Biaya tetap dikenakan sekali per kelompok aturan pada pesanan seller.</p><DataTable rows={view.config.rules} columns={[{
        label: 'Rule',
        key: 'name'
      }, {
        label: 'Scope',
        render: r => `${r.scope} ${r.target}`
      }, {
        label: 'Fee',
        render: fee
      }, {
        label: 'Effective date',
        key: 'effective'
      }, {
        label: 'Until',
        render: r => r.until || 'Tanpa batas'
      }, {
        label: 'Status',
        render: r => <Badge status={!r.active ? 'inactive' : r.effective > new Date().toISOString().slice(0, 10) ? 'scheduled' : r.until && r.until < new Date().toISOString().slice(0, 10) ? 'expired' : 'active'} />
      }, {
        label: 'Action',
        render: r => <button className="text-link" onClick={() => setEditing({
          ...r
        })}>Edit rule</button>
      }]} /><p>Buyer service fee: {rupiah(view.config.buyerServiceFee)} · Gateway fee demo: {view.config.gateway.percentage}% + {rupiah(view.config.gateway.fixed)}. Keduanya berasal dari konfigurasi mock backend.</p></section>{editing && <Modal title="Edit platform fee" onClose={() => setEditing(null)}><form className="form-stack" onSubmit={e => {
        e.preventDefault();
        setChange(editing);
        setEditing(null);
      }}><Field label="Rule name"><input className="input" required value={editing.name} onChange={e => setEditing({
            ...editing,
            name: e.target.value
          })} /></Field><Field label="Scope"><select className="select" value={editing.scope} onChange={e => setEditing({
            ...editing,
            scope: e.target.value,
            target: ''
          })}><option value="all">All sellers</option><option value="category">Category</option><option value="seller">Selected seller</option></select></Field>{editing.scope !== 'all' && <Field label="Target"><select className="select" required value={editing.target} onChange={e => setEditing({
            ...editing,
            target: e.target.value
          })}><option value="">Pilih target</option>{(editing.scope === 'seller' ? view.sellers : categories).map(x => <option key={x.slug} value={x.slug}>{x.name}</option>)}</select></Field>}<Field label="Type"><select className="select" value={editing.type} onChange={e => setEditing({
            ...editing,
            type: e.target.value
          })}><option value="percentage">Percentage</option><option value="fixed">Fixed</option><option value="combined">Percentage + Fixed</option></select></Field>{editing.type !== 'fixed' && <Field label="Percentage (%)"><input className="input" type="number" step="0.1" required min="0" max="100" value={editing.percentage} onChange={e => setEditing({
            ...editing,
            percentage: Number(e.target.value)
          })} /></Field>}{editing.type !== 'percentage' && <Field label="Fixed (Rp)"><input className="input" type="number" required min="0" value={editing.fixed} onChange={e => setEditing({
            ...editing,
            fixed: Number(e.target.value)
          })} /></Field>}<Field label="Effective date"><input className="input" type="date" required value={editing.effective} onChange={e => setEditing({
            ...editing,
            effective: e.target.value
          })} /></Field><Field label="Until (optional)"><input className="input" type="date" min={editing.effective} value={editing.until} onChange={e => setEditing({
            ...editing,
            until: e.target.value
          })} /></Field><label className="w-actions"><input type="checkbox" checked={editing.active} onChange={e => setEditing({
            ...editing,
            active: e.target.checked
          })} />Rule active</label><button className="btn btn-primary">Review perubahan</button></form></Modal>}{change && <Confirm title="Konfirmasi perubahan fee" onClose={() => setChange(null)} onConfirm={reason => action('fee', change.id, '', reason, change)}><p><strong>{change.name}: {fee(change)}</strong></p><p>Changing this fee affects future transactions. Existing paid transactions will not be recalculated.</p><small>Snapshot seluruh pesanan yang sudah dibuat tetap dipertahankan, termasuk sesi menunggu pembayaran.</small></Confirm>}</>;
}
export function AuditLog() {
  const {
    view
  } = usePrototype();
  return <><div className="w-dashboard-title"><div><p className="eyebrow">READ-ONLY · SUPER ADMIN</p><h1>Audit Log</h1><p>Jejak keputusan dan perubahan akses. Log tidak dapat diedit atau dihapus di dashboard.</p></div></div><section className="w-panel"><DataTable rows={view.audit} columns={[{
        label: 'Timestamp',
        render: l => new Date(l.at).toLocaleString('id-ID')
      }, {
        label: 'Actor',
        key: 'actor'
      }, {
        label: 'Role',
        key: 'role'
      }, {
        label: 'Action',
        key: 'action'
      }, {
        label: 'Target',
        key: 'target'
      }, {
        label: 'Reason',
        key: 'reason'
      }, {
        label: 'IP / Device',
        key: 'device'
      }, {
        label: 'Details',
        render: l => <details><summary>Lihat</summary><p className="w-wrap">{l.details || 'Perubahan status simulasi'}</p></details>
      }]} /></section></>;
}
export function Settings() {
  const {
    view,
    action
  } = usePrototype();
  const [change, setChange] = useState(null);
  return <><div className="w-dashboard-title"><div><p className="eyebrow">PLATFORM SETTINGS</p><h1>Mulai lokal. Siap berkembang.</h1></div></div><section className="w-panel"><form className="form-stack" onSubmit={e => {
        e.preventDefault();
        setChange(Object.fromEntries(new FormData(e.currentTarget)));
      }}>{[['region', 'Region'], ['city', 'City'], ['supportHours', 'Jam layanan support']].map(([key, label]) => <Field label={label} key={key}><input className="input" required name={key} defaultValue={view.settings[key]} /></Field>)}<p className="muted">Konfigurasi wilayah ekspansi demo. Alamat dan transaksi historis tetap menggunakan lokasi saat pesanan dibuat.</p><button className="btn btn-primary">Review perubahan</button></form></section>{change && <Confirm title="Ubah pengaturan platform" onClose={() => setChange(null)} onConfirm={reason => action('settings', 'platform', '', reason, change)}>Simpan konfigurasi wilayah dan jam layanan demo?</Confirm>}</>;
}
