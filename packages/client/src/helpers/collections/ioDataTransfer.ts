/* eslint-disable */
// @ts-nocheck

import { SerializedTextOperation } from 'ot';

export class ioDataTransfer {
  static encode(d: Dao_FrontType.CRDT) {
    return new Blob([JSON.stringify(d)]);
  }

  static decode(d: any) {
    // eslint-disable-next-line prefer-spread
    // !!!toFixed
    // eslint-disable-next-line prefer-spread
    const deCodeData = String.fromCharCode.apply(String, new Uint8Array(d));
    const decodedString = decodeURIComponent(escape(deCodeData));

    return JSON.parse(decodedString) as Dao_FrontType.CRDT;
  }
}
