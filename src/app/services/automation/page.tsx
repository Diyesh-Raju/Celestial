import { ProductPage, productMetadata } from "@/components/product/ProductPage";

export const metadata = productMetadata("automation");

export default function Page() {
  return <ProductPage slug="automation" />;
}
