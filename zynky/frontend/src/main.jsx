// ============================================================
//  src/main.jsx  — ENTRY POINT
//
//  จุดเริ่มต้นของ React App ทั้งหมด
//  - ห่อ App ด้วย AppProvider เพื่อให้ทุก Component เข้า Context ได้
//  - import CSS global styles
// ============================================================

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AppProvider } from './context/AppContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* AppProvider ต้องห่อนอกสุด เพื่อให้ทุก Component ลูกเรียก useApp() ได้ */}
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>
);
