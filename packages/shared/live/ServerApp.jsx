import { useEffect } from 'react';
import { useState } from 'react';
import { createApi } from '../../api-client/client.js';
import { browserStorage } from '../../api-client/session.js';
import { Context } from './context.jsx';
import { ErrorMessage } from './Forms.jsx';
import { config } from '../../api-client/config.js';

function ServerApp({ children }) {
  const [user, setUser] = useState(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(null),
    [attempt, setAttempt] = useState(0);
  const [api] = useState(() =>
    createApi({
      baseUrl: config.apiBaseUrl,
      storage: browserStorage(),
      onUnauthorized: () => setUser(null),
    }),
  );
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    api
      .restore()
      .then((value) => {
        if (active) setUser(value);
      })
      .catch((e) => {
        if (active && e.status !== 401 && e.code !== "VALIDATION_ERROR")
          setError(e);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [api, attempt]);
  if (loading)
    return (
      <p className="page" role="status">
        Memuat sesi…
      </p>
    );
  if (error)
    return (
      <div className="page">
        <ErrorMessage error={error} />
        <button
          className="btn btn-primary"
          onClick={() => setAttempt((n) => n + 1)}
        >
          Coba lagi
        </button>
      </div>
    );
  return (
    <Context.Provider value={{ api, user, setUser }}>
      <SessionRoutes key={user?.id || "guest"}>{children}</SessionRoutes>
    </Context.Provider>
  );
}
function SessionRoutes({ children }) { return children; }

export { ServerApp };
