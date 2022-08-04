import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Provider } from "react-redux";
import { legacy_createStore as createStore } from "redux";
import reducers from "./redux/reducers";
import { BrowserRouter, HashRouter } from "react-router-dom";
import 'antd/dist/antd.min.css';
import { interceptors } from './http/http';
const store = createStore(reducers)
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

interceptors()

root.render(
  <Provider store={store}>
    <HashRouter>
      <App />
    </HashRouter>
  </Provider>
);
