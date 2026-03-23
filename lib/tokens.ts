import { nanoid } from 'nanoid';
export function createToken() {
  return nanoid(48);
}
