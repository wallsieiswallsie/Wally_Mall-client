import { Route } from 'react-router';

import Auth from './Auth.jsx';
import { EmptyState } from '../../ui/components/common/UI.jsx';
import { RequireRole } from '../state/PrototypeContext.jsx';

const guard = (roles, element) => <RequireRole roles={roles}>{element}</RequireRole>;
function commonRoutes(location) { return <>
<Route path="login" element={<Auth key="login" />} />
<Route path="register" element={<Auth key="register" register />} />
<Route path="*" element={<EmptyState title="Sepertinya kamu salah belok." text="Halaman ini belum ada. Yuk, kembali menemukan sesuatu di Wally." to="/" label="Kembali ke Home" />} />
</>; }
export { commonRoutes };
