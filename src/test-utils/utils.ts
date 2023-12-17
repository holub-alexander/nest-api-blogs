import config from '../config/config';
import supertest from 'supertest';

export const getBasicAuthToken = () => btoa(`${config.login}:${config.password}`);

export const setBasicAuthToken = (request: supertest.Test) =>
  request.set('Authorization', `Basic ${getBasicAuthToken()}`);
