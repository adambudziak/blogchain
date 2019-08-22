import { RouteComponentProps } from 'react-router-dom';


export const redirectIfNotAuthenticated = (props: RouteComponentProps) => {
    if (!localStorage.getItem('token')) {
        props.history.push('/login');
    }
};
