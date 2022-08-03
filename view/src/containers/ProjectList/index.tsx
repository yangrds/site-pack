import React, { useState, BaseSyntheticEvent, useEffect } from 'react';
import { connect } from 'react-redux'
import style from './index.module.scss';
import { Table, Button, Modal, Input, Tag, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { process_init, process_kill, process_kill_all, process_start, project_create, project_list } from '../../http/api'
import { dateFormat, formatDuring, formatSeconds } from '../../utils';
import { loading_status, loading_text, loading_visible } from '../../redux/actions/project'
import Details from '../Details/index'

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

interface Complete { text: string; time?: number; err?: boolean, callback?: () => void }






const View: React.FC = (props: any) => {

    const columns: ColumnsType<DataType> = [
        {
            title: '网站标识',
            dataIndex: 'name',
            key: 'name',
            width: '200px',
            ellipsis: {
                showTitle: false,
            },
            render: (_, { name }) => (
                <>
                    <Tooltip placement="topLeft" title={name}>
                        {name}
                    </Tooltip>
                </>
            ),
        },
        {
            title: '端口',
            dataIndex: 'port',
            key: 'port',
            width: '100px',
            render: (_, { key, port }) => (
                <Tag color={'green'} key={key}>
                    {port.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            width: '100px',
            render: (_, { key, status }) => (
                <>
                    {status === '1' ? <Tag color="#87d068">运行中</Tag> :
                        <Tag color="#888">已停止</Tag>}
                </>

            ),
        },
        {
            title: '创建时间',
            dataIndex: 'date',
            key: 'date',
            width: '120px',
        },
        {
            title: '访问地址',
            dataIndex: 'ip',
            key: 'ip',
            width: '150px',
            render: (_, { port }) => (
                <a target="_blank" href={`http://${window.location.hostname}:` + port}>{window.location.hostname + ':' + port}</a>
            ),
        },
        {
            title: '备注',
            dataIndex: 'remark',
            key: 'remark',
            width: '200px',
            ellipsis: {
                showTitle: false,
            },
            render: (_, { remark }) => (
                <>
                    <Tooltip placement="topLeft" title={remark}>
                        {remark}
                    </Tooltip>
                </>
            ),

        },
        {
            title: '操作',
            dataIndex: 'operate',
            key: 'operate',
            width: '150px',
            render: (_, details) => (
                <>
                    {details.status === '0' ? <Button size="small" onClick={() => _process_start(details.key)} type="primary" >启动</Button>
                        : <Button size="small" onClick={() => _process_kill(details.key)} type="primary" danger>停止</Button>}
                    <Button onClick={() => detailsShow(details)} style={{ marginLeft: '10px' }} size="small">管理</Button>
                </>
            ),
        },

    ];





    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [detailsModalVisible, setDetailsModalVisible] = useState(false);


    const [siteDetails, setSiteDetails] = useState<any>({});
    const [project_key, setProject_key] = useState<string>('');




    const [project, setProject] = useState<DataType>({
        name: '“正规”网站',
        remark: '司搭街坊昆仑山搭街坊独立思考',
        port: '8070',
    })


    const [projects, setProjects] = useState<DataType[]>([]);


    useEffect(() => {
        const details = projects.find((item) => item.key === project_key)
        details && setSiteDetails(details)
    }, [projects])


    const showModal = () => {
        setCreateModalVisible(true);
    };


    const handleCancel = () => {
        setCreateModalVisible(false);
    };


    function detailsShow(details: DataType) {
        setSiteDetails(details)
        setProject_key(details.key)
        setDetailsModalVisible(true)
    }



    // 创建站点->提交数据
    async function submit() {
        props.loading_visible(true)
        const _project = JSON.parse(JSON.stringify(project))
        const res = await project_create({
            name: _project.name,
            remark: _project.remark,
            port: _project.port,
        })
        if (res.code === 200) {
            setCreateModalVisible(false);
            complete({ text: '站点添加成功', callback: _project_list })
        }
    }

    // 创建站点->数据录入
    function projectChange(e: BaseSyntheticEvent, key: string) {
        const _project = JSON.parse(JSON.stringify(project))
        _project[key] = e.target.value
        setProject(_project)
    }




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


    // 启动进程[指定]
    async function _process_start(key: string) {
        props.loading_visible(true)
        const res = await process_start({ id: key })
        if (res.code === 200) {
            complete({ text: `【${key}】进程启动成功`, callback: _project_list })
        } else {
            complete({ text: `${res.msg}`, err: true, time: 2000 })
        }
    }

    // 重启进程池
    async function _process_init() {
        props.loading_visible(true)
        const res = await process_init()
        if (res.code === 200) {
            complete({ text: '进程池重启成功', callback: _project_list })
        } else {
            complete({ text: `${res.msg}`, err: true, time: 2000 })
        }
    }

    // 冻结进程池
    async function _process_kill_all() {
        props.loading_visible(true)
        const res = await process_kill_all()
        if (res.code === 200) {
            complete({ text: '进程池冻结成功', callback: _project_list })
        } else {
            complete({ text: `${res.msg}`, err: true, time: 2000 })
        }
    }

    // 关闭进程[指定]
    async function _process_kill(key: string) {
        props.loading_visible(true)
        const res = await process_kill({ id: key })
        if (res.code === 200) {
            complete({ text: `【${key}】进程关闭成功`, callback: _project_list })
        } else {
            complete({ text: `${res.msg}`, err: true, time: 2000 })
        }

    }

    // 站点列表
    async function _project_list() {
        const res = await project_list()
        if (res.code === 200) {
            const _projects = res.data.map((item: DataType) => {
                item.date = dateFormat('YY-mm-dd HH:MM:SS', item.date as any)
                return item
            })
            setProjects(_projects)
        }
    }

    useEffect(() => {
        _project_list()
    }, [])


    return (
        <div className={style.container}>
            <div className={style.operate} style={{ marginBottom: '6px' }}>
                <Button onClick={showModal} style={{ marginRight: '10px' }} type="primary">添加站点</Button>
                <Button onClick={_process_init} style={{ marginRight: '10px' }} >刷新进程池</Button>
                <Button onClick={_process_kill_all} style={{ marginRight: '10px' }} >关闭进程池</Button>
            </div>
            <Table size='small' columns={columns} dataSource={projects} />

            <Modal zIndex={0} title="添加网站" okText='提交' cancelText='取消' visible={createModalVisible} onOk={submit} onCancel={handleCancel}>
                <div className={style.child_input}>
                    <span>站点名称</span>
                    <Input value={project.name} onChange={(e) => projectChange(e, 'name')} maxLength={30} placeholder="可输入1-30汉字/字母/数字" />
                </div>
                <div className={style.child_input}>
                    <span>端口</span>
                    <Input value={project.port} onChange={(e) => projectChange(e, 'port')} placeholder="尽量保持在1024~65535用户端口范围" />
                </div>
                <div className={style.child_input}>
                    <span>备注</span>
                    <Input value={project.remark} onChange={(e) => projectChange(e, 'remark')} placeholder="备注" />
                </div>
            </Modal>



            <Modal destroyOnClose={true} width="800px" footer={null} title="网站管理" visible={detailsModalVisible} onCancel={() => setDetailsModalVisible(false)}>
                <Details process_kill={_process_kill} process_start={_process_start} siteDetails={siteDetails} />
            </Modal>
        </div>
    )
}
export default connect(() => ({}), {
    loading_visible,
    loading_text,
    loading_status
})(View)


