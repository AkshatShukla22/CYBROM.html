import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './App.jsx';
import { store } from './store/store.js';
import './index.css';

// Entry point of the application
// This file connects Redux store to the entire app using Provider
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Provider makes Redux store available to all components */}
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
);