'use client';

import { useContext, useEffect } from 'react';
import { AuthContext } from '@/components/providers/AuthProvider';
import { isAdmin } from '@/lib/blog/admin';
import { useRouter } from '@/i18n/navigation';

export default function AdminBlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!auth?.loading && (!auth?.user || !isAdmin(auth.user.id))) {
      router.push('/');
    }
  }, [auth?.loading, auth?.user, router]);

  if (!auth || auth.loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#E8E3D9] border-t-[#FF6B4A]" />
      </div>
    );
  }

  if (!auth.user || !isAdmin(auth.user.id)) {
    return null;
  }

  return <div className="min-h-screen bg-white">{children}</div>;
}
