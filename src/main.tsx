import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import 'react18-json-view/src/style.css';
import 'react18-json-view/src/dark.css';
import './index.css';
import App from './App';
import { ConfigProvider, theme } from 'antd';

const firebaseConfig = {
  apiKey: 'AIzaSyBkzRzTR25e7qBx_uZOUd8G9qw9TZj6p-c',
  authDomain: 'ryanrasmussen.firebaseapp.com',
  databaseURL: 'https://ryanrasmussen.firebaseio.com',
  projectId: 'firebase-ryanrasmussen',
  storageBucket: 'firebase-ryanrasmussen.appspot.com',
  messagingSenderId: '450714895505',
  appId: '1:450714895505:web:1cad53120aa08484a8eb30',
  measurementId: 'G-DJB2CLGTYC',
};

// Initialize Firebase
initializeApp(firebaseConfig);

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ConfigProvider
        theme={{
          algorithm: theme.darkAlgorithm,
          components: {
            Spin: {
              colorPrimary: '#FFFFFF',
              algorithm: true,
            },
          },
        }}
      >
        <App />
      </ConfigProvider>
    </BrowserRouter>
  </React.StrictMode>
);
