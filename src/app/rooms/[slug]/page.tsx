import { redirect } from 'next/navigation';

export default async function RoomDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(`/stays/${slug}`);
}
