import { editor } from 'monaco-editor';
import { TextOperation } from 'ot';
import { lineAndColumnToIndex } from './MonacoIndexConverter';

export function operationFromMonacoChanges(
  changeEvent: editor.IModelContentChangedEvent,
  liveOperationCode: string,
) {
  let operation;

  let composedCode = liveOperationCode;

  // eslint-disable-next-line no-restricted-syntax
  for (const change of [...changeEvent.changes]) {
    const newOt = new TextOperation();
    const cursorStartOffset = lineAndColumnToIndex(
      composedCode.split(/\n/),
      change.range.startLineNumber,
      change.range.startColumn,
    );

    const retain = cursorStartOffset - newOt.targetLength;

    if (retain !== 0) {
      newOt.retain(retain);
    }

    if (change.rangeLength > 0) {
      newOt.delete(change.rangeLength);
    }

    if (change.text) {
      newOt.insert(change.text);
    }

    const remaining = composedCode.length - newOt.baseLength;
    if (remaining > 0) {
      newOt.retain(remaining);
    }

    operation = operation ? operation.compose(newOt) : newOt;

    composedCode = operation.apply(liveOperationCode);
  }

  return {
    operation,
    liveOperationCode: composedCode,
  };
}
