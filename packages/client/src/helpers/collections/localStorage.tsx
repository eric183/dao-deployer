const localStorageSpace = () => {
  let allStrings = '';
  for (const key in window.localStorage) {
    allStrings += window.localStorage[key];
  }
  return allStrings
    ? 3 + (allStrings.length * 16) / (8 * 1024) + ' KB'
    : 'Empty (0 KB)';
};

export { localStorageSpace };
