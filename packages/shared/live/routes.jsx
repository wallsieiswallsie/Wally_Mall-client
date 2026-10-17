import { Link } from '../../ui/navigation.jsx';

import { Route } from 'react-router';

import { Guard } from './session.jsx';
import { Auth } from './session.jsx';
import { Account } from './session.jsx';

function commonRoutes(location) { return <>
<Route
          path="account"
          element={
            <Guard>
              <Account />
            </Guard>
          }
        />
<Route path="login" element={<Auth key="login" />} />
<Route path="register" element={<Auth key="register" register />} />
<Route
          path="*"
          element={
            <>
              <h1>Halaman tidak ditemukan</h1>
              <Link to="/">Kembali ke beranda</Link>
            </>
          }
        />
</>; }
export { commonRoutes };
