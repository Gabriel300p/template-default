const LOWER = "abcdefghijklmnopqrstuvwxyz";
const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const NUM = "0123456789";
const SPECIAL = "!@#$%^&*_-";
const ALL = LOWER + UPPER + NUM + SPECIAL;

export function generatePassword(length = 12) {
  if (length < 8) throw new Error("Password length must be >= 8");
  const must = [
    LOWER[Math.floor(Math.random() * LOWER.length)],
    UPPER[Math.floor(Math.random() * UPPER.length)],
    NUM[Math.floor(Math.random() * NUM.length)],
    SPECIAL[Math.floor(Math.random() * SPECIAL.length)],
  ];
  const remaining: string[] = [];
  for (let i = must.length; i < length; i++) {
    remaining.push(ALL[Math.floor(Math.random() * ALL.length)]);
  }
  const chars = [...must, ...remaining];
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}
