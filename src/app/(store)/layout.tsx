import { CartProvider } from "@/lib/cart-context";
import StoreNavbar from "@/components/store/StoreNavbar";
import CartDrawer from "@/components/store/CartDrawer";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <div className="min-h-screen bg-white">
        <StoreNavbar />
        <CartDrawer />
        <main>{children}</main>
      </div>
    </CartProvider>
  );
}
