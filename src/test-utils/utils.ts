import config from '../config/config';

export const getBasicAuthToken = () => btoa(`${config.login}:${config.password}`);
