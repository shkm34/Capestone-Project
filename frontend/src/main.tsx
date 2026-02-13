import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './style.css';

// React entry point:
// - Finds the #app div created in index.html.
// - Mounts our root <App /> component inside it.
ReactDOM.createRoot(document.getElementById('app') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

