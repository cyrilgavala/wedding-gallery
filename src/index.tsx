import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { App } from './components/App';

const reactRoot = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
reactRoot.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
