import { Link as RouterLink, NavLink as RouterNavLink, useNavigate as useRouterNavigate } from 'react-router';
import { config, portalHref } from '../api-client/config.js';
import { useCallback } from 'react';

export function Link({ to, ...props }) {
  return <RouterLink {...props} to={portalHref(to)} />;
}
export function NavLink({ to, ...props }) {
  return <RouterNavLink {...props} to={portalHref(to)} />;
}
export function useNavigate() {
  const navigate = useRouterNavigate();
  return useCallback((to, options) => {
    const href = portalHref(to, config);
    if (href !== to) {
      if (options?.replace) globalThis.location.replace(href);
      else globalThis.location.assign(href);
      return;
    }
    return navigate(to, options);
  }, [navigate]);
}
