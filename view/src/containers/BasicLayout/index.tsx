import React from 'react'
import { connect } from 'react-redux'
import style from "./index.module.scss";
import Header from '../Header'
import Sidebar from '../Sidebar'
import Loading from '../Loading';
import { Outlet } from 'react-router-dom';

const View: React.FC = (props: any) => {
    return (
        <div className={style.container}>
            <div className={style.content}>
                <div className={style.header}>
                    <Header />
                </div>
                <div className={style.main}>
                    <Outlet />
                </div>
            </div>
        </div>
    )
}

export default connect()(View)