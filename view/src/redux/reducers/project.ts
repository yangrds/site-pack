
const projectParams = {
    loading: false,
    loadingText: '正在处理，请稍等...',
    loadingStatus: 'loading',
    projects: []
}

const project_fun = (state: any = projectParams, action: { type: string; data: any }) => {
    const _state = JSON.parse(JSON.stringify(state))
    switch (action.type) {
        case 'project/loading':
            _state.loading = action.data
            return _state
        case 'project/loadingText':
            _state.loadingText = action.data
            return _state
        case 'project/loadingStatus':
            _state.loadingStatus = action.data
            return _state
        default:
            return _state
    }
    return state
}



export function updatePorjects(state: any = projectParams, action: { type: string; data: any }) {
    const _state = JSON.parse(JSON.stringify(state))
    switch (action.type) {
        case 'project/projects':
            _state.projects = action.data
            return _state
        default:
            return _state
    }
}


export default project_fun