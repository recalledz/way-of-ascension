export const iconMap = {
  'Forest Rabbit': 'mdi:rabbit',
  'Wild Boar': 'mdi:pig',
  'River Frog': 'mdi:frog',
  'Honey Bee': 'mdi:bee',
  'Tree Sprite': 'mdi:pine-tree',
  'Stone Lizard': 'mdi:lizard',
  'Water Snake': 'mdi:snake',
  'Grass Wolf': 'mdi:wolf',
  'Ruin Guardian': 'mdi:shield',
  'Forest Spirit': 'mdi:tree',
};

export function getIcon(name){
  return iconMap[name] || 'mdi:help-circle';
}
