import AppRoutes from "./routes/AppRoutes";
import { PrototypeProvider } from './state/PrototypeContext';
import './transaction.css';
export default function App() {
  return <PrototypeProvider><AppRoutes /></PrototypeProvider>;
}
