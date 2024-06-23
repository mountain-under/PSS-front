import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './firebaseConfig'; // Firebaseの初期化をインポート

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
