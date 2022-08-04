import { message } from 'antd';
import Axios from 'axios';
import React, { useEffect } from 'react';
import { useNavigate, useRoutes } from 'react-router-dom';
import Loading from './containers/Loading';
import routes from './router';


function App() {

  const navigate = useNavigate()








  useEffect(() => {
    const token = window.localStorage.getItem('token')
    if (!token) navigate('/login', { replace: true })
  }, [])


  const Views = () => useRoutes(routes)
  return (
    <div className="App">
      <Loading />
      <Views />
    </div>
  );
}

export default App;


