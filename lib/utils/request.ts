import { tokenStore } from '../stores/tokenStore';
import cryptoTool from './cryptoTool';
const URL = 'https://develop.1024paas.com';

const tenantCode = 1;
const secret = 'qwertyuioplkjhgf';
const curretTime = new Date().getTime();

export const getHeader = (url: string) => {
  const token = cryptoTool.encrypt(
    tenantCode + '_' + url + '_' + curretTime,
    secret,
  );
  const headers = new Headers({
    'Content-Type': 'application/json;charset=UTF-8',
  });
  headers.append('token', token);
  headers.append('userId', '1');
  headers.append('nonce', url);
  headers.append('timestamp', curretTime.toString());
  headers.append('tenantCode', tenantCode.toString());
  return headers;
};

const getTicket = async () => {
  const response = await fetch(`${URL}/sdk/ticket`, {
    mode: 'cors',
    method: 'POST',
    headers: getHeader(URL),
    body: JSON.stringify({
      playgroundId: '28',
      userInfo: {
        name: '头电五',
        email: 'u.ezdci@qq.com',
        userId: '97',
        phoneNumber: '54',
      },
      actions: 'do Lorem',
      tillTime: -33875896,
    }),
  });

  return response.json();
  // console.log(response.json());
  // return postByJson("/sdk/codeZones/fork", param);
};

const protocol = 'https';

// const PAAS_ORIGIN = window.location.origin;
const PAAS_ORIGIN = process.env.NEXT_PUBLIC_API_ORIGIN;

const API_PORT = '8001';

export const request = async (url: string, method?: string, body?: any) => {
  return await fetch(`${protocol}://${PAAS_ORIGIN}${url}`, {
    mode: 'cors',
    method: method ? method : 'GET',
    headers: {
      'Content-type': 'application/json',
      token: tokenStore.getState().token,
    },
    body: body ? JSON.stringify(body) : null,
  });
};

export { getTicket };
