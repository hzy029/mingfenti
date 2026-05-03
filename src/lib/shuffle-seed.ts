/** 将字符串哈希为 32 位无符号种子，用于可复现乱序。 */
function hashStringToUint32(input: string): number {
  let hash = 2166136261;

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function mulberry32(seed: number) {
  return function next() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher–Yates，同一 seed 得到同一排列。 */
export function shuffleWithSeed<T>(items: readonly T[], seed: string): T[] {
  const copy = [...items];
  const random = mulberry32(hashStringToUint32(seed));

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const j = Math.floor(random() * (index + 1));
    const tmp = copy[index];
    copy[index] = copy[j]!;
    copy[j] = tmp!;
  }

  return copy;
}
