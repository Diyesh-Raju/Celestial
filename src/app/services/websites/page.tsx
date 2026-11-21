import { ProductPage, productMetadata } from "@/components/product/ProductPage";

export const metadata = productMetadata("websites");

export default function Page() {
  return <ProductPage slug="websites" />;
}
