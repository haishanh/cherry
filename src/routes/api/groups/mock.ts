export async function genGroups(_userId: number) {
  const mod: { nanoid: (sz: number) => string } = await import('nanoid');
  const groups = [];
  for (let i = 0; i < 100; i++) {
    const id = mod.nanoid(getRandomInt(4, 9));
    groups.push({ id: i, name: id });
  }
  return groups;
}

function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}
