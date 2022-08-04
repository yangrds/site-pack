import { Avatar, Badge, Button, Descriptions, List, Table, Tooltip, Modal, Tag } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux'
import style from './index.module.scss';
import zip_icon from '../../assets/images/zip.png'
import { ColumnsType } from 'antd/lib/table';
import { FileUpload, history_list, history_remove, injection } from '../../http/api';
import { Percentage, renderSize } from '../../utils';
import { loading_status, loading_text, loading_visible } from '../../redux/actions/project';
const { confirm } = Modal;

interface DataType {
    name: string;
    remark: string;
    port?: string;
    key?: string;
    host?: string;
    history?: string;
    date?: string;
    status?: string;
    process?: any;
}

interface HistoryFile {
    date: number;
    dateText: string;
    fileName: string;
    size: number
}


interface Complete { text: string; time?: number; err?: boolean, callback?: () => void }


const View: React.FC = (props: any) => {
    const details: DataType = props.siteDetails




    // 静态资源压缩包
    const [buildZip, setBuildZip] = useState<File | null>(null)


    const [historyFiles, sethistoryFiles] = useState<HistoryFile[]>([])





    const columns: ColumnsType = [

        {
            title: "文件名",
            dataIndex: 'fileName',
            key: 'fileName',
            width: '100px',
            render: (_, { fileName }) => (
                <>
                    <img width={22} height={22} src={zip_icon} />
                    <span style={{ marginLeft: '10px' }}>{fileName}</span>
                </>
            ),
        },
        {
            title: '创建时间',
            dataIndex: 'dateText',
            key: 'date',
            width: '120px',
        },
        {
            title: '文件大小',
            dataIndex: 'size',
            key: 'date',
            width: '60px',
            render: (_, { size }) => (
                <>
                    <span style={{ marginLeft: '10px' }}>{renderSize(size)}</span>
                </>
            ),


        },
        {
            title: '操作',
            dataIndex: 'operate',
            key: 'operate',
            width: '120px',
            render: (_, { key }) => (
                <>
                    <Button onClick={() => _injection(key)} style={{ marginLeft: '10px' }} type="primary" size="small">部署</Button>
                    <Button onClick={() => _history_remove(key)} style={{ marginLeft: '10px' }} size="small">删除</Button>
                </>
            ),
        },

    ];


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



    async function _history_remove(file_key: string) {
        confirm({
            title: '确定删除该历史文件？',
            icon: <ExclamationCircleOutlined />,
            content: `历史文件：${file_key}，删除后将无法恢复！`,
            okText: '确定',
            okType: 'danger',
            cancelText: '取消',
            async onOk() {
                props.loading_visible(true)
                const res = await history_remove({ id: details.key, file_key })
                if (res.code === 200) {
                    { }
                    complete({ text: '删除成功', callback: _history_list })
                } else {
                    complete({ text: `${res.msg}`, err: true, time: 2000 })
                }

            },
        });

    }


    async function _history_list() {
        const res = await history_list({ id: details.key })
        if (res.code === 200) {
            sethistoryFiles(res.data.sort((a, b) => b.date - a.date))
        }
    }

    async function _injection(file_key: string) {
        props.loading_visible(true)
        const res = await injection({ id: details.key, file_key })
        if (res.code === 200) {
            { }
            complete({ text: '部署成功' })
        } else {
            complete({ text: `${res.msg}`, err: true, time: 2000 })
        }
    }


    useEffect(() => {
        _history_list()
    }, [])



    // 选择文件
    function fileSelectClick() {
        const input: HTMLInputElement = document.createElement("input");
        input.type = "file";
        input.multiple = false;
        input.onchange = async (e: any) => {
            props.loading_visible(true)
            const formdata = new FormData()
            formdata.append('file', e.target.files[0])
            formdata.append('id', details.key)
            const res = await FileUpload(formdata, (progressEvent: any) => {
                const schedule = Percentage(
                    progressEvent.loaded,
                    progressEvent.total
                );
            })
            if (res.code === 200) {
                complete({ text: '静态资源上传成功', callback: _history_list })
            } else {
                complete({ text: `${res.msg}`, err: true, time: 2000 })
            }

        };
        input.click();
    }



    return (
        <div className={style.container}>
            <Descriptions size='small' bordered>
                <Descriptions.Item label="网站标识" >{details.name}</Descriptions.Item>
                <Descriptions.Item label="站点ID" span={2}>{details.key}</Descriptions.Item>
                <Descriptions.Item label="端口" >
                    <Tag color={'green'}>
                        {details.port}
                    </Tag>
                </Descriptions.Item>

                <Descriptions.Item label="状态" span={2}>
                    <Badge status={details.status === '1' ? 'warning' : 'error'} text={details.status === '1' ? '运行中' : '已关闭'} />
                </Descriptions.Item>
                <Descriptions.Item label="创建时间" >{details.date}</Descriptions.Item>
                <Descriptions.Item label="访问地址" span={2}>
                    <a target="_blank" href={`http://${window.location.hostname}:` + details.port}>{window.location.hostname + ':' + details.port}</a>
                </Descriptions.Item>

                <Descriptions.Item label="备注" >
                    {details.remark}
                </Descriptions.Item>
            </Descriptions>

            <Button onClick={fileSelectClick} type="primary" style={{ marginTop: '12px' }}>上传静态资源</Button>
            {details.status === '0' && <Button onClick={() => props.process_start(details.key)} style={{ marginTop: '12px', marginLeft: '12px' }} type='dashed'>启动进程</Button>}
            {details.status === '1' && <Button onClick={() => props.process_kill(details.key)} style={{ marginTop: '12px', marginLeft: '12px' }} type='dashed' danger>关闭进程</Button>}
            <Table scroll={{ y: '400px' }} pagination={false} style={{ marginTop: '10px' }} size="small" columns={columns} dataSource={historyFiles} />


        </div>
    )
}
export default connect((state: any, props: any) => ({
    ...props,
}), {
    loading_visible,
    loading_text,
    loading_status
})(View)