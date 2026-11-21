import { ProductPage, productMetadata } from "@/components/product/ProductPage";

export const metadata = productMetadata("crm");

export default function Page() {
  return <ProductPage slug="crm" />;
}
