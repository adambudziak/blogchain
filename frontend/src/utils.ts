import { RouteComponentProps } from 'react-router-dom';


export const redirectIfNotAuthenticated = (props: RouteComponentProps) => {
  if (localStorage.getItem('token') === null) {
    props.history.push('/login');
  }
};
