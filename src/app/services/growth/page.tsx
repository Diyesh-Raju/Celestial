import { ProductPage, productMetadata } from "@/components/product/ProductPage";

export const metadata = productMetadata("growth");

export default function Page() {
  return <ProductPage slug="growth" />;
}
