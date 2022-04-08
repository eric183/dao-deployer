import { operationFromMonacoChanges } from './OperationFromMonacoChanges';

describe('OperationFromMonacoChangesTest', () => {
  const multiLineCode = `你好 Daopaas

  你好 Daopaas

  你好 Daopaas`;

  describe('Monaco Event to OT Transform', () => {
    it('Correctly transforms adding text', () => {
      const changeEvent = {
        changes: [
          {
            range: {
              startLineNumber: 1,
              startColumn: 4,
              endLineNumber: 1,
              endColumn: 4,
            },
            rangeLength: 0,
            text: 'e',
            rangeOffset: 3,
            forceMoveMarkers: false,
          },
        ],
        eol: '\n',
        versionId: 28,
        isUndoing: false,
        isRedoing: false,
        isFlush: false,
      };

      const code = `你好 Daopaas`;

      const { operation, liveOperationCode } = operationFromMonacoChanges(
        changeEvent,
        code,
      );

      expect(operation?.apply(code)).toBe(liveOperationCode);
    });

    it('Correctly transforms removing text', () => {
      const changeEvent = {
        changes: [
          {
            range: {
              startLineNumber: 1,
              startColumn: 3,
              endLineNumber: 1,
              endColumn: 4,
            },
            rangeLength: 1,
            text: '',
            rangeOffset: 2,
            forceMoveMarkers: false,
          },
        ],
        eol: '\n',
        versionId: 3,
        isUndoing: false,
        isRedoing: false,
        isFlush: false,
      };

      const code = `你好 Daopaas`;

      const { operation, liveOperationCode } = operationFromMonacoChanges(
        changeEvent,
        code,
      );

      expect(operation?.apply(code)).toBe(liveOperationCode);
    });

    it('Correctly transforms multLine deleting text', () => {
      const changeEvent = {
        changes: [
          {
            range: {
              startLineNumber: 5,
              startColumn: 3,
              endLineNumber: 5,
              endColumn: 4,
            },
            rangeLength: 1,
            text: '',
            rangeOffset: 26,
            forceMoveMarkers: false,
          },
          {
            range: {
              startLineNumber: 3,
              startColumn: 3,
              endLineNumber: 3,
              endColumn: 4,
            },
            rangeLength: 1,
            text: '',
            rangeOffset: 14,
            forceMoveMarkers: false,
          },
          {
            range: {
              startLineNumber: 1,
              startColumn: 3,
              endLineNumber: 1,
              endColumn: 4,
            },
            rangeLength: 1,
            text: '',
            rangeOffset: 2,
            forceMoveMarkers: false,
          },
        ],
        eol: '\n',
        versionId: 6,
        isUndoing: false,
        isRedoing: false,
        isFlush: false,
      };

      const { operation, liveOperationCode } = operationFromMonacoChanges(
        changeEvent,
        multiLineCode,
      );

      expect(operation?.apply(multiLineCode)).toBe(liveOperationCode);
    });

    it('Correctly transforms multLine editing text', () => {
      const changeEvent = {
        changes: [
          {
            range: {
              startLineNumber: 5,
              startColumn: 4,
              endLineNumber: 5,
              endColumn: 11,
            },
            rangeLength: 7,
            text: 'a',
            rangeOffset: 27,
            forceMoveMarkers: false,
          },
          {
            range: {
              startLineNumber: 3,
              startColumn: 4,
              endLineNumber: 3,
              endColumn: 11,
            },
            rangeLength: 7,
            text: 'a',
            rangeOffset: 15,
            forceMoveMarkers: false,
          },
          {
            range: {
              startLineNumber: 1,
              startColumn: 4,
              endLineNumber: 1,
              endColumn: 11,
            },
            rangeLength: 7,
            text: 'a',
            rangeOffset: 3,
            forceMoveMarkers: false,
          },
        ],
        eol: '\n',
        versionId: 3,
        isUndoing: false,
        isRedoing: false,
        isFlush: false,
      };

      const { operation, liveOperationCode } = operationFromMonacoChanges(
        changeEvent,
        multiLineCode,
      );

      expect(operation?.apply(multiLineCode)).toBe(liveOperationCode);
    });
  });
});
