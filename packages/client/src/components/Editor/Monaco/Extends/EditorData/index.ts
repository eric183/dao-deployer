import { uniqBy } from 'lodash';
import * as monaco from 'monaco-editor';
import create from 'zustand';

import { FExtension } from '~/enum/FExtension';

// const [FileTreeStack, setFileTreeStack] = useState<
// {
//   label: string;
//   path: string;
//   model: monaco.editor.ITextModel;
// }[]
// >([]);
export type FileTreeStackType = {
  label: string;
  path: string;
  model: monaco.editor.ITextModel | null;
};

const curserStore = create<{
  cursor: any;
  setCursor: (arg: any) => any;
}>((set) => ({
  cursor: {},
  setCursor: (arg) => set((state) => ({ cursor: arg })),
  // setCursor: (arg) =>
  //   set({
  //     cursor: arg,
  //   }),
}));

export const editorStore = create<{
  fileTreeStack: FileTreeStackType[];
  setFileTreeStack: (arg: FileTreeStackType[]) => void;
}>((set) => ({
  fileTreeStack: [],
  setFileTreeStack: (arg) => set(() => ({ fileTreeStack: arg })),
  // setCursor: (arg) =>
  //   set({
  //     cursor: arg,
  //   }),
}));

export class EditorData {
  static EditorData: FileTreeStackType;
  private localSetFileTreeStack(arg: FileTreeStackType[]) {
    editorStore.getState().setFileTreeStack(arg);
  }

  static get fileTreeStack() {
    const fileTreeStack = editorStore.getState().fileTreeStack;
    // console.log(fileTreeStack);
    return fileTreeStack;
  }

  static setFileTreeStack(arg: FileTreeStackType[]) {
    return editorStore.getState().setFileTreeStack(arg);
  }

  static updateModel(
    {
      value,
      path,
      language,
      APP_DIR,
    }: {
      value: string;
      path: string;
      language: FExtension;
      APP_DIR: string;
    },
    callback: (val: monaco.editor.ITextModel | null) => void,
    cover = false,
  ) {
    let gotModel = monaco.editor
      .getModels()
      .find((x) => x.uri.path.includes(path))!;
    // monaco.editor.getModels()[0].uri.path.includes(path)
    if (!gotModel && !!cover) {
      gotModel = monaco.editor.createModel(
        value,
        language,
        monaco.Uri.parse(`file://${APP_DIR}${path}`),
      );
    }

    const _fileTreeStack = [
      ...this.fileTreeStack,
      {
        label: path,
        path: path,
        model: gotModel,
      },
    ];

    this.setFileTreeStack(uniqBy(_fileTreeStack, 'path'));

    if (cover) {
      gotModel?.setValue(value);
    }
    callback && callback(gotModel);
  }
}
