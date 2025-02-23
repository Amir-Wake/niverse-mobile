import { Themes } from '@epubjs-react-native/core';

export const MAX_FONT_SIZE = 32;
export const MIN_FONT_SIZE = 12;

export const availableFonts: Array<string> = [
  'Fira Mono',
  'AmericanTypewriter-Bold',
  'Courier New',
];

export const themes = Object.values(Themes);

export const contrast: { [key: string]: string } = {
  '#fff': '#333',
  '#333': '#fff',
  '#e8dcb8': '#333',
};

export default { contrast };