import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { decrypt } from '@/lib/auth/session';

export default async function Home() {
  const cookie = (await cookies()).get('session')?.value;
  const session = await decrypt(cookie);

  if (session?.userId) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}
