import { message } from 'antd';
import Axios from 'axios';
import React from 'react';
import { useNavigate, useRoutes } from 'react-router-dom';
import Loading from './containers/Loading';
import routes from './router';


function App() {



  console.log(window.location);
  

  const navigate = useNavigate()


  // 设置统一拦截（REQ）
  Axios.interceptors.request.use(
    (config: any) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.token = token;
      }
      return config;
    },
    (err: any) => {
      return Promise.reject(err);
    }
  );


  // 设置统一拦截（RES）
  Axios.interceptors.response.use(
    (response: any) => {
      if (response.data.code === 304) {
        navigate('/login')
      }
      if (response.data.code != 200) {
        message.error(response.data.msg);
      }
      return response;
    },
    (error: any) => {
      return Promise.reject(error);
    }
  );

  const Views = () => useRoutes(routes)
  return (
    <div className="App">
      <Loading />
      <Views />
    </div>
  );
}

export default App;


