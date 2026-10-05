import type { Metadata } from "next";
import { Keizu } from "@/components/Keizu";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function Page() {
  return <Keizu />;
}
