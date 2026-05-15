import { PageHeader } from '@/components/layout/page-header';
import { TopBar } from '@/components/layout/top-bar';
import { Separator } from '@/components/ui/separator';
import { getUser } from '@/lib/auth/dal';

import { DeleteAccountSection, PasswordForm, ProfileForm } from './settings-forms';

export default async function SettingsPage() {
  const user = await getUser();

  return (
    <>
      <TopBar title="Settings" breadcrumbs={[{ label: 'Settings' }]} />
      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-2xl space-y-6">
          <PageHeader
            title="Settings"
            description="Manage your account details, update your password, and configure your preferences."
          />
          <ProfileForm user={user} />
          <PasswordForm />
          <Separator />
          <DeleteAccountSection />
        </div>
      </div>
    </>
  );
}
