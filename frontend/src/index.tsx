import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';


const link = document.createElement('link');
link.type = 'image/svg+xml';
link.rel = 'icon';
link.href = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="white" class="w-5 h-5"%3E%3Cpath fill-rule="evenodd" d="M17.721 1.599a.75.75 0 01.279.584v11.29a2.25 2.25 0 01-1.774 2.198l-2.041.442a2.216 2.216 0 01-.938-4.333l2.662-.576a.75.75 0 00.591-.734V6.112l-8 1.73v7.684a2.25 2.25 0 01-1.774 2.2l-2.042.44a2.216 2.216 0 11-.935-4.33l2.659-.574A.75.75 0 007 12.53V4.237a.75.75 0 01.591-.733l9.5-2.054a.75.75 0 01.63.149z" clip-rule="evenodd"%3E%3C/path%3E%3C/svg%3E';

document.head.appendChild(link);

const root = document.getElementById('root');
if (root !== null) {
    ReactDOM.createRoot(root).render(
        <StrictMode>
            <App />
        </StrictMode>);
}