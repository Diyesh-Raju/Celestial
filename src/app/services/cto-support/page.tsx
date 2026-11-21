import { ProductPage, productMetadata } from "@/components/product/ProductPage";

export const metadata = productMetadata("cto-support");

export default function Page() {
  return <ProductPage slug="cto-support" />;
}
