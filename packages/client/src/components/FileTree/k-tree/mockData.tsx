export const fetchMockTreeData = async () => {
  const responseData = await (await fetch('/api/file-tree')).json();
  return responseData;
};
