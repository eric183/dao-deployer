export const roleColors = (index: number) =>
  [
    '#d904c7',
    '#49cf5b',
    '#D9C589',
    '#F27B13',
    '#A0D9D9',
    '#45858C',
    '#8C311C',
    '#4A5B8C',
    '#8C4F2B',
    '#34401A',
    '#CAD959',
    '#0476D9',
  ][index];

export const avatarGenerator = (
  value: number,
  userInfo: { uuid?: string; onlineCount?: number; avatarUrl?: string },
) => {
  const avatarSeries = [
    'initials',
    'avataaars',
    'big-ears',
    'bottts',
    'croodles',
    'personas',
    'micah',
  ];
  // return `https://avatars.dicebear.com/api/avataaars/${name}.svg`;
  // return `https://avatars.dicebear.com/api/human/${name}.svg`;

  return userInfo.avatarUrl;
  // return `https://avatars.dicebear.com/api/initials/${userInfo.username}.svg`;
  // return `https://avatars.dicebear.com/api/${avatarSeries[value]}/${name}.svg`;
};
