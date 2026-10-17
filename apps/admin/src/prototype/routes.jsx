import { Route } from 'react-router';

import { EmptyState } from '../../../../packages/ui/components/common/UI.jsx';
import { RequireRole } from '../../../../packages/shared/state/PrototypeContext.jsx';
import InternalLayout from '../../../../packages/shared/layouts/InternalLayout.jsx';
import Overview from './Overview.jsx';
import Transactions from './Transactions.jsx';
import People from './People.jsx';
import Operations from './Operations.jsx';
import { AdminManagement } from './Administration.jsx';
import { FeeSettings } from './Administration.jsx';
import { AuditLog } from './Administration.jsx';
import { Settings } from './Administration.jsx';

const guard = (roles, element) => <RequireRole roles={roles}>{element}</RequireRole>;
function adminRoutes(location) { return <>
{['admin', 'super_admin'].map(role => <Route key={role} path={role === 'admin' ? '/admin' : '/super-admin'} element={guard([role], <InternalLayout />)}>
        <Route index element={<Overview />} />
        <Route path="orders" element={<Transactions operational />} />
        <Route path="sellers" element={<People />} />
        {['products', 'categories', 'reports', 'moderation', 'support'].map(section => <Route key={section} path={section} element={<Operations key={section} section={section} />} />)}
        {role === 'super_admin' && <>
          <Route path="transactions" element={<Transactions />} />
          <Route path="buyers" element={<People kind="buyers" />} />
          <Route path="operations" element={<Overview operational />} />
          <Route path="admins" element={<AdminManagement />} />
          <Route path="platform-fee" element={<FeeSettings />} />
          <Route path="audit-log" element={<AuditLog />} />
          <Route path="settings" element={<Settings />} />
        </>}
        <Route path="*" element={<EmptyState title="Halaman tidak tersedia untuk role ini" to={role === 'admin' ? '/admin' : '/super-admin'} label="Kembali ke overview" />} />
      </Route>)}
</>; }
export { adminRoutes };
