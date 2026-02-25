import { notFound } from "next/navigation";
import { getFingerprintByTargetId } from "@/db/queries";
import FingerprintViewer from "@/components/FingerprintViewer";

export default async function ViewerPage({
  params,
}: {
  params: Promise<{ targetId: string }>;
}) {
  const { targetId } = await params;

  if (!targetId) {
    return notFound();
  }

  const fingerprint = await getFingerprintByTargetId(targetId);

  if (!fingerprint) {
    return notFound();
  }

  return <FingerprintViewer data={fingerprint} />;
}
