export const loading_visible = (data: boolean) => ({ type: 'project/loading', data })
export const loading_text = (data: string) => ({ type: 'project/loadingText', data })
export const loading_status = (data: string) => ({ type: 'project/loadingStatus', data })
export const update_porjects = (data: string) => ({ type: 'project/projects', data })

