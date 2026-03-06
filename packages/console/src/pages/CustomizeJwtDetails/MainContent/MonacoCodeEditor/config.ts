import { type EditorProps } from '@monaco-editor/react';

import type { IStandaloneThemeData } from './type';

// MyEyesID dark theme extends vs-dark theme
export const myeyesidDarkTheme: IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [],
  colors: {
    'editor.background': '#090613', // :token/code/code-bg
  },
};

export const myeyesidLightTheme: IStandaloneThemeData = {
  ...myeyesidDarkTheme,
  colors: {
    'editor.background': '#181133', // :token/code/code-bg
  },
};

// @see {@link https://microsoft.github.io/monaco-editor/typedoc/interfaces/editor.IStandaloneEditorConstructionOptions.html}
export const defaultOptions: EditorProps['options'] = {
  minimap: {
    enabled: false,
  },
  renderLineHighlight: 'none',
  fontFamily: 'Roboto Mono, monospace',
  fontSize: 14,
  automaticLayout: true,
  tabSize: 2,
  scrollBeyondLastLine: false,
};
