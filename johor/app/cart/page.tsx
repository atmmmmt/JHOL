import { buildPageMetadata } from "../../lib/seo";
import CartPage from "../../src/page-components/cart-page";

export function generateMetadata() {
  return buildPageMetadata({
    description: "سلة الطلبات في جهور، راجع العناصر المضافة وأرسل طلبك بسهولة.",
    path: "/cart",
    title: "السلة | جهور",
  });
}

export default function Page() {
  return <CartPage />;
}
