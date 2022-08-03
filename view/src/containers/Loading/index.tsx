import React, { useEffect, useState } from 'react';
import { connect, InferableComponentEnhancer, MapStateToPropsParam } from 'react-redux'
import style from './index.module.scss';
import loading from '../../assets/images/loading.gif'
import success from '../../assets/images/success.png'
import fail from '../../assets/images/fail.png'
import { loading_status, loading_text, loading_visible } from '../../redux/actions/project'
import { createPortal } from 'react-dom';

const View: React.FC = (props: any) => {

    const [visible, setVisible] = useState<boolean>(false)
    const [text, setText] = useState<string>('')
    const [animation, setAnimation] = useState<string>(style.open)


    useEffect(() => {
        setVisible(props.loading)
    }, [])


    useEffect(() => {
        setText(props.loadingText)
    }, [props.loadingText])

    useEffect(() => {
        if (!props.loading) {
            setAnimation(style.close)
            setTimeout(() => {
                setVisible(props.loading)
                props.loading_status('loading')
                props.loading_text('正在处理，请稍等...')
            }, 300)
        } else {
            setAnimation(style.open)
            setVisible(props.loading)
        }
    }, [props.loading])
    return (
        <div className={style.container}>
            {visible && createPortal(<div className={style.mask}>
                <div className={`${style.spin} ${animation}`}>
                    {props.loadingStatus === 'loading' && <img src={loading} />}
                    {props.loadingStatus === 'success' && <img src={success} />}
                    {props.loadingStatus === 'fail' && <img src={fail} />}
                    <span>{text}</span>
                </div>
            </div>, document.querySelector('#root'))}
        </div>
    )
}
export default connect(
    (state: any) => (
        {
            loading: state.project.loading,
            loadingText: state.project.loadingText,
            loadingStatus: state.project.loadingStatus,

        }
    ),
    {
        loading_visible,
        loading_text,
        loading_status
    }
)(View)