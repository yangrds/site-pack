
import { Navigate, RouteObject } from "react-router-dom";
import ProjectList from '../containers/ProjectList'
import BasicLayout from '../containers/BasicLayout'
import Login from '../containers/Login'

const routes: RouteObject[] = [
    {
        path: '/main',
        element: <BasicLayout />,
        children: [
            {
                path: 'project-list',
                element: <ProjectList />,
            },
            {
                path: '',
                element: <Navigate to="project-list" />
            }
        ],
    },
    {
        path: '/login',
        element: <Login />
    },
    {
        path: '/',
        element: <Navigate to="/main" />
    }
]

export default routes
