import { useOT } from '~/hooks';
import { daoStore } from '~/stores';
import { DiffPatternInfo, diffStore } from '~/stores/daoStore';

export const globalVal = (global: {
  d42: Window & typeof globalThis;
  log: {
    (...data: any[]): void;
    (message?: string, ...optionalParams: unknown[]): void;
  };
}) => {
  global.d42 = window;
  global.log = console.log;
};

export const getSizeOfJSON = (json: JSON) => {
  return encodeURI(JSON.stringify(json)).split(/%..|./).length - 1;
};

export const checkIfTheFileHasDeleted = (fileTree: JSON, value: string) => {
  return !JSON.stringify(fileTree).includes(value);
};

export const fetchSpeed = ({ url, size }: { url: string; size: number }) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = `${url}?_t=${Math.random()}`;
    // 加个时间戳以避免浏览器只发起一次请求
    const startTime = new Date().getTime();

    img.onload = function () {
      const fileSize = size; // 单位是 kb
      const endTime = new Date().getTime();
      const costTime = endTime - startTime;
      const speed = (fileSize / (endTime - startTime)) * 1000; // 单位是 kb/s
      resolve({ speed, costTime });
    };

    img.onerror = reject;
  });
};

let packetsPerSeconds = '';
export const printReport = (heartbeatTime: number | undefined) => {
  const lastReport = new Date().getTime();
  const packetsSinceLastReport = 0;
  setInterval(() => {
    const now = new Date().getTime();
    const durationSinceLastReport = (now - lastReport) / 1000;
    packetsPerSeconds = (
      packetsSinceLastReport / durationSinceLastReport
    ).toFixed(2);

    console.log(`average packets received per second: ${packetsPerSeconds}`);

    console.log(`lastReport: ${lastReport}`);
  }, heartbeatTime);

  // packetsSinceLastReport = 0;
  // lastReport = now;
};

export const setDiff = (current: DiffPatternInfo, next: DiffPatternInfo) => {
  diffStore.getState().setDiffPattern([current, next]);
};

export const isDev = () => {
  const strPoints = ['localhost', '127.0.', '192.168.'];

  return strPoints.some((point) => window.location.hostname.includes(point));
};
