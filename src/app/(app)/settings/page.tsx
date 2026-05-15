import { TopBar } from '@/components/layout/top-bar';
import { Separator } from '@/components/ui/separator';
import { getUser } from '@/lib/auth/dal';

import { DeleteAccountSection, PasswordForm, ProfileForm } from './settings-forms';

export default async function SettingsPage() {
  const user = await getUser();

  return (
    <>
      <TopBar title="Settings" />
      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-2xl space-y-6">
          <ProfileForm user={user} />
          <PasswordForm />
          <Separator />
          <DeleteAccountSection />
        </div>
      </div>
    </>
  );
}
