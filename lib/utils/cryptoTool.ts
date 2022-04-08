/* eslint-disable */
// @ts-nocheck

import CryptoJS from 'crypto-js';
export default {
  encrypt(word: any, keyStr: any) {
    // 加密
    const key = CryptoJS.enc.Utf8.parse(keyStr);
    const srcs = CryptoJS.enc.Utf8.parse(word);
    const encrypted = CryptoJS.AES.encrypt(srcs, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    }); // 加密模式为ECB，补码方式为PKCS5Padding（也就是PKCS7）
    return encrypted.toString();
  },
  decrypt(word: any, keyStr: any) {
    // 解密
    const key = CryptoJS.enc.Utf8.parse(keyStr);
    const decrypt = CryptoJS.AES.decrypt(word, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    });
    return CryptoJS.enc.Utf8.stringify(decrypt).toString();
  },
  // 请求是否成功
  requestSuccess(res: { status: string; }) {
    return res && res.status == 'success';
  },
  getQueryVariable(variable: string) {
    const query = window.location.search.substring(1);
    const vars = query.split('&');
    for (let i = 0; i < vars.length; i++) {
      const pair = vars[i].split('=');
      if (pair[0] == variable) {
        return pair[1];
      }
    }
    return false;
  },
  // yyyy-mm-dd hh:mi:ss
  formatDate(time: string) {
    const d = new Date(parseInt(time));
    const year = d.getFullYear();
    let month = d.getMonth() + 1;
    month = month > 9 ? '' + month.toString() : '0' + month.toString();
    let day = d.getDate();
    day = day > 9 ? '' + day : '0' + day;
    let hour = d.getHours();
    hour = hour > 9 ? '' + hour : '0' + hour;
    let min = d.getMinutes();
    min = min > 9 ? '' + min : '0' + min;
    let sec = d.getSeconds();
    sec = sec > 9 ? '' + sec : '0' + sec;
    return year + '-' + month + '-' + day + ' ' + hour + ':' + min + ':' + sec;
  },
  /**
   * 时间转换
   * @param time 秒数
   */
  formatTime(time: string | number) {
    console.log('formatTime>>>' + time);
    if (isNaN(time)) {
      return '--';
    }
    const seconds = parseInt(time); // 总共多少秒

    // 时
    let hour = parseInt(seconds / 3600);
    // 分
    let min = parseInt((seconds % 3600) / 60) + '';
    // 秒
    let second = parseInt((seconds % 3600) % 60) + '';

    let res = '';
    if (hour > 0) {
      hour = hour.length >= 2 ? hour : '0' + hour;
      res = res + hour + ':';
    }
    //if(min>0){
    min = min.length >= 2 ? min : '0' + min;
    res = res + min + ':';
    //}
    if (second > 0) {
      second = second.length >= 2 ? second : '0' + second;
      res = res + second;
    }
    return res;
  },
  format(date: string | number | Date, format: string) {
    if (!date) {
      return '';
    }

    const d = new Date(date);

    // 年
    if (/YYYY/.test(format)) {
      format = format.replace(/YYYY/, d.getFullYear());
    }
    // 月份
    const month = d.getMonth() + 1;
    if (/MM/.test(format)) {
      const monthStr = month < 10 ? '0' + month : month;
      format = format.replace(/MM/, monthStr);
    } else if (/M/.test(format)) {
      format = format.replace(/M/, month);
    }
    // 日期
    const dates = d.getDate();
    if (/DD/.test(format)) {
      const dateStr = dates < 10 ? '0' + dates : dates;
      format = format.replace(/DD/, dateStr);
    } else if (/D/.test(format)) {
      format = format.replace(/D/, dates);
    }
    // 小时
    const hours = d.getHours();
    if (/HH/.test(format)) {
      const hoursStr = hours < 10 ? '0' + hours : hours;
      format = format.replace(/HH/, hoursStr);
    } else if (/H/.test(format)) {
      format = format.replace(/H/, hours);
    } else if (/hh/.test(format)) {
      const hoursMin = hours > 12 ? hours - 12 : hours;
      const hoursStr = hoursMin < 10 ? '0' + hoursMin : hoursMin;
      format = format.replace(/hh/, hoursStr);
    } else if (/h/.test(format)) {
      const hoursMin = hours > 12 ? hours - 12 : hours;
      format = format.replace(/h/, hoursMin);
    }
    // 分
    const minutes = d.getMinutes();
    if (/mm/.test(format)) {
      const minutesStr = minutes < 10 ? '0' + minutes : minutes;
      format = format.replace(/mm/, minutesStr);
    } else if (/m/.test(format)) {
      format = format.replace(/m/, minutes);
    }
    // 秒
    const seconds = d.getSeconds();
    if (/ss/.test(format)) {
      const secondsStr = seconds < 10 ? '0' + seconds : seconds;
      format = format.replace(/ss/, secondsStr);
    } else if (/s/.test(format)) {
      format = format.replace(/s/, seconds);
    }
    return format;
  },
  getRandomNum(num: number) {
    const chars = [
      '0',
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      'A',
      'B',
      'C',
      'D',
      'E',
      'F',
      'G',
      'H',
      'I',
      'J',
      'K',
      'L',
      'M',
      'N',
      'O',
      'P',
      'Q',
      'R',
      'S',
      'T',
      'U',
      'V',
      'W',
      'X',
      'Y',
      'Z',
    ];
    let res = '';
    for (let i = 0; i < num; i++) {
      const id = Math.ceil(Math.random() * 35);
      res += chars[id];
    }
    return res;
  },
};
