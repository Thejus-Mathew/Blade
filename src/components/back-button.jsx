'use client';

import { useRouter } from 'next/navigation';

export default function BackButton() {
  const router = useRouter();

  return (
    <button onClick={() => router.back()} className="px-4 py-2 dark:bg-gray-400 rounded border mb-6">
      ← Back
    </button>
  );
}
