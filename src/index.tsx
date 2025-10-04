import { createRoot } from 'react-dom/client';

import App from '@common/App';

import './stylesheets/index.scss';

const container = document.getElementById('root');

const root = createRoot(container as Element);

root.render(<App />);
