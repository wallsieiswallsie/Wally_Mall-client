import AppRoutes from "./routes/AppRoutes";
import { PrototypeProvider } from './state/PrototypeContext';
import './transaction.css';
import ServerApp from './live/ServerApp';
export default function App() {
  return import.meta.env.VITE_PROTOTYPE_MODE === 'true'
    ? <PrototypeProvider><AppRoutes /></PrototypeProvider>
    : <ServerApp />;
}
