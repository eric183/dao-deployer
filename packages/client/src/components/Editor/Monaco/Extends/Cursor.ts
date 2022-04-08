export class Cursor {
  [x: string]: any;
  constructor(position: any, selectionEnd: any) {
    this.position = position;
    this.selectionEnd = selectionEnd;
  }

  static fromJSON = (obj: { position: any; selectionEnd: any }) => {
    return new Cursor(obj.position, obj.selectionEnd);
  };

  equals(other: { position: any; selectionEnd: any }) {
    return (
      this.position === other.position &&
      this.selectionEnd === other.selectionEnd
    );
  }

  // Return the more current cursor information.
  compose(other: any) {
    return other;
  }

  // Update the cursor with respect to an operation.
  transform(other: { ops: string | any[] }) {
    function transformIndex(index: number) {
      let newIndex = index;
      const ops = other.ops;
      for (let i = 0, l = other.ops.length; i < l; i++) {
        if (ops[i].isRetain()) {
          index -= ops[i].chars;
        } else if (ops[i].isInsert()) {
          newIndex += ops[i].text.length;
        } else {
          newIndex -= Math.min(index, ops[i].chars);
          index -= ops[i].chars;
        }
        if (index < 0) {
          break;
        }
      }
      return newIndex;
    }

    const newPosition = transformIndex(this.position);
    if (this.position === this.selectionEnd) {
      return new Cursor(newPosition, newPosition);
    }
    return new Cursor(newPosition, transformIndex(this.selectionEnd));
  }
}
