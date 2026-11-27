import type { Metadata } from "next";
import { SERVICES_DESCRIPTION, ServicesPage } from "@/components/services/ServicesPage";

export const metadata: Metadata = {
  title: "Products & services — Celestial Developers",
  description: SERVICES_DESCRIPTION,
};

export default function Page() {
  return <ServicesPage />;
}
