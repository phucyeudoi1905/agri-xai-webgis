import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { GISMapContainer } from './components/map/GISMapContainer';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GISMapContainer />
  </StrictMode>,
);
