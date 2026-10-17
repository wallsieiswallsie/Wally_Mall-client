import { useEffect } from 'react';
import { useState } from 'react';
import { findSellerOrder } from '../../api-client/orders.js';
import { useServer } from './context.jsx';

function useResource(
  path,
  { auth = true, method = "GET", body, sellerOrderId } = {},
) {
  const { api } = useServer();
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState({
    loading: true,
    data: null,
    error: null,
  });
  const serialized = JSON.stringify(body);
  const resourceKey = JSON.stringify([
    path,
    auth,
    method,
    serialized,
    revision,
    sellerOrderId,
  ]);
  useEffect(() => {
    const controller = new AbortController();
    if (!path) {
      setState({ loading: false, data: null, error: null });
      return;
    }
    setState({ loading: true, data: null, error: null, resourceKey });
    const pending = sellerOrderId
      ? findSellerOrder(api, sellerOrderId, controller.signal)
      : api.request(path, {
          auth,
          method,
          ...(serialized === undefined ? {} : { body: JSON.parse(serialized) }),
          signal: controller.signal,
        });
    pending
      .then((data) => {
        if (!controller.signal.aborted)
          setState({ data, loading: false, error: null, resourceKey });
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          setState({ data: null, loading: false, error, resourceKey });
      });
    return () => controller.abort();
  }, [api, path, auth, method, serialized, revision, sellerOrderId]);
  return {
    ...(!path
      ? { loading: false, data: null, error: null }
      : state.resourceKey !== resourceKey
        ? { loading: true, data: null, error: null }
        : state),
    reload: () => setRevision((n) => n + 1),
  };
}
export { useResource };
