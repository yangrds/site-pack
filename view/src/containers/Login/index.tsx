import { SafetyCertificateOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Input } from 'antd';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux'
import { useNavigate } from 'react-router-dom';
import { login } from '../../http/api';
import { loading_status, loading_text, loading_visible } from '../../redux/actions/project';
import style from './index.module.scss';


interface Complete { text: string; time?: number; err?: boolean, callback?: () => void }

const View: React.FC = (props: any) => {
    const [account, setAccount] = useState('')
    const [password, setPassword] = useState('')
    const navigate = useNavigate()

    function complete({ text, time = 800, err, callback }: Complete) {
        const time1 = setTimeout(() => {
            props.loading_status(err ? 'fail' : 'success')
            props.loading_text(text)
            clearTimeout(time1)
        }, 300);

        const time2 = setTimeout(() => {
            props.loading_visible(false)
            callback && callback()
            clearTimeout(time2)
        }, time);
    }





    async function _login() {
        props.loading_visible(true)
        const res = await login({ account, password })
        if (res.code === 200) {
            window.localStorage.setItem('token', res.data)
            complete({ text: '登录成功，跳转中...', callback: () => navigate('/', { replace: true }) })
        } else {
            complete({ text: res.msg, err: true })
        }
    }


    function onKeyDown(e: any) {
        if (e.key === 'Enter') {
            _login()
        }
    }


    return (
        <div className={style.container} onKeyDown={(e) => onKeyDown(e)}>
            <div className={style.login}>
                <div className={style['login-top']}>
                    <span>SITE-PACK</span>
                </div>
                <div className={style['login-info']}>
                    <Input value={account} onChange={(e) => setAccount(e.target.value)} className={style['input-item']} prefix={<UserOutlined />} style={{ marginBottom: '30px' }} placeholder="账号" />
                    <Input.Password value={password} onChange={(e) => setPassword(e.target.value)} className={style['input-item']} prefix={<SafetyCertificateOutlined />} style={{ marginBottom: '30px' }} placeholder="密码" />
                    <Button onClick={_login} style={{ height: '40px', marginTop: '10px' }} type="primary">登录</Button>
                </div>
            </div>
        </div >
    )
}
export default connect((_, props) => props, {
    loading_visible,
    loading_text,
    loading_status
})(View)