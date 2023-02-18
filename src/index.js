import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import UsuarioProvider from './context/UsuarioProvider';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <UsuarioProvider>
    <App />
    </UsuarioProvider>
  </React.StrictMode>
);
