import { brandIcon } from "@/lib/brandIcon";

const SIZES = ["192", "512", "maskable"];

export function generateStaticParams() {
  return SIZES.map((size) => ({ size }));
}

export async function GET(_: Request, { params }: RouteContext<"/icons/[size]">) {
  const { size } = await params;
  if (!SIZES.includes(size)) return new Response(null, { status: 404 });
  return size === "maskable" ? brandIcon(512, true) : brandIcon(Number(size));
}
