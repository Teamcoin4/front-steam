import GameDetailClient from './GameDetailClient';

export default async function GameDetailPage({
  params,
}: {
  params: Promise<{ appId: string }>;
}) {
  const { appId } = await params;
  return <GameDetailClient appId={Number(appId)} />;
}
