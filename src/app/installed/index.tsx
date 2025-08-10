import { createRoot } from 'react-dom/client';
import { App } from './App';

import '@vkontakte/vkui/dist/vkui.css';

const container = document.getElementById('root')!;
const root = createRoot(container);

root.render(<App />);
