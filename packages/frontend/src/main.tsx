import React from 'react';
import './index.css';
import App from './App';
import {BrowserRouter} from 'react-router-dom';
import ReactDOM from 'react-dom/client';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <BrowserRouter>
      <React.StrictMode>
        <App/>
      </React.StrictMode>
    </BrowserRouter>
);
