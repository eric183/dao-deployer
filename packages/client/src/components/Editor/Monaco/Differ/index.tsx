import * as monaco from 'monaco-editor';

export class Differ {
  editor: monaco.editor.IStandaloneDiffEditor;
  models: {
    value: string;
    path: string;
  }[];
  constructor(editorIns: monaco.editor.IStandaloneDiffEditor) {
    this.editor = editorIns;
    this.models = [];
  }

  //   set setModel(model: any) {}
  set setModel(models: any) {
    // this.editor.setModel(models);
    this.models = models;
    // this.editor.setModel()
  }

  get getModels() {
    return this.models;
  }
}
