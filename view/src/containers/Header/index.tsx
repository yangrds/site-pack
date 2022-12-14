import React, { useEffect, useState } from 'react';
import style from './index.module.scss';
import blog from '../../assets/images/blog.png'
import devops_select from '../../assets/images/devops_select.png'
import github from '../../assets/images/github.png'
import avatar from '../../assets/images/avatar.svg'
import gy from '../../assets/images/gy.svg'
import qp from '../../assets/images/qp.svg'
import out from '../../assets/images/out.svg'
import { useNavigate } from 'react-router-dom';
import { Input, Modal } from 'antd';
import { ExclamationCircleOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { connect } from 'react-redux';
import { loading_status, loading_text, loading_visible } from '../../redux/actions/project';
import { UserInfo, UserUpdate } from '../../http/api';
const { confirm } = Modal;
interface Complete { text: string; time?: number; err?: boolean, callback?: () => void }

const View: React.FC = (props: any) => {

    const [isModalVisible, setIsModalVisible] = useState(false);

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


    const navigate = useNavigate()

    const [fullscreen, setFullscreen] = useState(true)
    const [optionsVisible, setOptionsVisible] = useState(false)
    const [userInfo, setUserInfo] = useState<{ account?: string; name?: string }>({})

    const [updateData, setUpdateData] = useState<{ account?: string; password?: string; name?: string }>({})


    function globalClick() {
        setOptionsVisible(false)
    }

    useEffect(() => {
        window.addEventListener('click', globalClick)
        return () => {
            window.removeEventListener('click', globalClick)
        }
    }, [])


    useEffect(() => {
        _UserInfo()
    }, [])


    async function _UserInfo() {
        const res = await UserInfo()
        if (res.code === 200) {
            setUserInfo(res.data)
            setUpdateData({
                account: res.data.account,
                name: res.data.name,
                password: ''
            })
        }
    }


    function launchFullscreen(element: any) {
        if (element.requestFullscreen) {
            element.requestFullscreen()
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen()
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen()
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullScreen()
        }
    }


    function exitFullscreen(doc: any) {
        if (doc.exitFullscreen) {
            doc.exitFullscreen()
        } else if (doc.msExitFullscreen) {
            doc.msExitFullscreen()
        } else if (doc.mozCancelFullScreen) {
            doc.mozCancelFullScreen()
        } else if (doc.webkitExitFullscreen) {
            doc.webkitExitFullscreen()
        }
    }


    async function fullScreenClick() {
        if (document.fullscreenElement) {
            exitFullscreen(document)
        } else {
            launchFullscreen(document.documentElement)
        }
        setFullscreen(!!document.fullscreenElement)
    }


    function signOut() {
        confirm({
            title: '?????????????????????',
            icon: <ExclamationCircleOutlined />,
            content: `??????????????????????????????????????????`,
            okText: '??????',
            okType: 'danger',
            cancelText: '??????',
            async onOk() {
                props.loading_visible(true)
                complete({
                    text: '??????????????????...', callback: () => {
                        window.localStorage.removeItem('token')
                        navigate('/login')
                    }
                })

            },
        });

    }



    const handleCancel = () => {
        setIsModalVisible(false);
    };

    function Change(value: any, key: string) {
        const _updateData = JSON.parse(JSON.stringify(updateData))
        _updateData[key] = value
        setUpdateData(_updateData)
    }


    async function _UserUpdate() {
        props.loading_visible(true)
        const res = await UserUpdate(updateData)
        if (res.code === 200) {
            setIsModalVisible(false);
            complete({
                text: '?????????????????????????????????????????????...', callback: () => {
                    window.localStorage.removeItem('token')
                    navigate('/login')
                }
            })
        } else {
            complete({ text: `${res.msg}`, err: true, time: 2000 })
        }
    }


    return (
        <>
            <div className={style.container}>
                <div className={style['header-info']}>
                    <div className={style['login-title']}>
                        <img src={devops_select} />
                        <span>SITE-PACK</span>
                    </div>
                    <div className={style['header-options']}>

                        <a href="https://js-vue.com/" target="_blank" className={style['options-child']}>
                            <img src={blog} />
                            <span>????????????</span>
                        </a>

                        <a href="https://github.com/yangrds" target="_blank" className={style['options-child']}>
                            <img src={github} />
                            <span>????????????</span>
                        </a>

                        <div className={style['personal']} onClick={(event) => {
                            event.stopPropagation()
                            setOptionsVisible(true)
                        }}>
                            <img src={avatar} />
                            <div className={style['user-info']}>
                                <span>{userInfo.account}</span>
                                <span>{userInfo.name}</span>
                            </div>
                        </div>
                    </div>
                    {optionsVisible && <div className={style['options']} >
                        <div onClick={() => setIsModalVisible(true)} className={style['options-item']}>
                            <img src={gy} />
                            <span>????????????</span>
                        </div>
                        <div onClick={fullScreenClick} className={style['options-item']}>
                            <img src={qp} />
                            <span>{fullscreen ? '??????' : '????????????'}</span>
                        </div>
                        <div onClick={signOut} className={style['options-item']} >
                            <img src={out} />
                            <span>????????????</span>
                        </div>
                    </div>}
                </div>
            </div >

            <Modal width={420} title="????????????" visible={isModalVisible} onOk={_UserUpdate} onCancel={handleCancel}>
                <div className={style.child_input}>
                    <span>??????</span>
                    <Input className={style['input-item']} value={userInfo.account} disabled maxLength={30} />
                </div>
                <div className={style.child_input}>
                    <span>????????????</span>
                    <Input className={style['input-item']} value={updateData.name} onChange={(e) => Change(e.target.value, 'name')} />
                </div>
                <div className={style.child_input}>
                    <span>????????????</span>
                    <Input.Password className={style['input-item']} value={updateData.password} onChange={(e) => Change(e.target.value, 'password')} />
                </div>
            </Modal>
        </>

    )
}
export default connect((_, props) => props, {
    loading_visible,
    loading_text,
    loading_status
})(View)