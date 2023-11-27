import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';

const root = document.getElementById('root');
if (root !== null) {
    ReactDOM.createRoot(root).render(
        <StrictMode>
            <App />
        </StrictMode>);
}