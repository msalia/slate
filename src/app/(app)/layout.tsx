import { Sidebar } from '@/components/layout/sidebar';
import { getUser } from '@/lib/auth/dal';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar user={user} />
      <main className="flex flex-1 flex-col overflow-hidden">{children}</main>
    </div>
  );
}
