import React from 'react';
import { connect } from 'react-redux'
import style from './index.module.scss';

const View: React.FC = (props: any) => {
    return (
        <div className={style.container}>

        </div>
    )
}
export default connect()(View)