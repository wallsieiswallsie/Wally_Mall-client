import { config } from '../packages/api-client/config.js';
import { PrototypeProvider } from '../packages/shared/state/PrototypeContext.jsx';
import { ServerApp } from '../packages/shared/live/ServerApp.jsx';
import LiveRoutes from './LiveRoutes.jsx';
import PrototypeRoutes from './PrototypeRoutes.jsx';
import '../packages/ui/styles/transaction.css';
import '../packages/ui/styles/live.css';
export default function App() { return config.prototypeMode ? <PrototypeProvider><PrototypeRoutes /></PrototypeProvider> : <ServerApp><LiveRoutes /></ServerApp>; }
