import { createContext } from 'react';
import { useContext } from 'react';

const Context = createContext(null);
const useServer = () => useContext(Context);
const destination = (user) =>
  user.roles.includes("super_admin")
    ? "/super-admin"
    : user.roles.includes("admin")
      ? "/admin"
      : user.roles.includes("seller")
        ? "/seller/dashboard"
        : "/";
export { Context, useServer, destination };
