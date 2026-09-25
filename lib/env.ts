export function env(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`faltou a variável de ambiente ${name}`);
  return value;
}
