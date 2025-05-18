import { hashPassword } from './server/auth';

async function main() {
  const password = 'MojeNoveHeslo123';
  const hashedPassword = await hashPassword(password);
  console.log('Hashované heslo:', hashedPassword);
}

main().catch(console.error);