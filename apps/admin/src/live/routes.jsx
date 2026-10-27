import { Navigate } from 'react-router';

import { Route } from 'react-router';

import { Guard } from '../../../../packages/shared/live/session.jsx';
import { Orders } from '../../../../packages/shared/live/Orders.jsx';
import { managementSections } from './Pages.jsx';
import { Management } from './Pages.jsx';
import { CategoryManagement } from './Pages.jsx';
import { AdminLayout, Denied, NotFound } from './Layout.jsx';
import { Overview } from './Overview.jsx';

function adminRoutes(location) { return <>
{[false, true].map((superAdmin) => (
          <Route
            key={String(superAdmin)}
            path={superAdmin ? "super-admin" : "admin"}
            element={
              <Guard
                roles={superAdmin ? ["super_admin"] : ["admin", "super_admin"]}
                fallback={<Denied />}
              >
                <AdminLayout superAdmin={superAdmin} />
              </Guard>
            }
          >
            <Route index element={<Overview superAdmin={superAdmin} />} />
            {superAdmin && (
              <Route
                path="operations"
                element={<Overview superAdmin operational />}
              />
            )}
            <Route path="orders" element={<Orders admin />} />
            {superAdmin && (
              <Route path="transactions" element={<Orders financial />} />
            )}
            {Object.keys(managementSections)
              .filter(
                (key) =>
                  superAdmin ||
                  !["buyers", "admins", "fee-rules", "audit"].includes(key),
              )
              .map((kind) => (
                <Route
                  key={kind}
                  path={kind}
                  element={
                    kind === "categories" ? (
                      <CategoryManagement />
                    ) : (
                      <Management kind={kind} key={kind} />
                    )
                  }
                />
              ))}
            <Route
              path="sellers"
              element={<Navigate to="../stores" replace />}
            />
            {superAdmin && (
              <>
                <Route
                  path="platform-fee"
                  element={<Navigate to="../fee-rules" replace />}
                />
                <Route
                  path="audit-log"
                  element={<Navigate to="../audit" replace />}
                />
              </>
            )}
            <Route path="*" element={<NotFound superAdmin={superAdmin} />} />
          </Route>
        ))}
</>; }
export { adminRoutes };
