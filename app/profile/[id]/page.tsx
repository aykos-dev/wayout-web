import { ProfileView } from '@/features/profile/profile-view';

export default function ProfilePage({ params }: { params: { id: string } }) {
  return <ProfileView userId={params.id} />;
}
