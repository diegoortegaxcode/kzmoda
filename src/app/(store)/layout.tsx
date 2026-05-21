import { CartProvider } from "@/lib/cart-context";
import StoreNavbar from "@/components/store/StoreNavbar";
import CartDrawer from "@/components/store/CartDrawer";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const store = await cookies();
  const token = store.get("kmoda_customer")?.value;
  const session = token ? await verifyJWT(token) : null;
  const customer =
    session?.role === "CLIENTE"
      ? {
          name: session.name,
          initials: session.name
            .split(" ")
            .slice(0, 2)
            .map((w: string) => w[0])
            .join("")
            .toUpperCase(),
        }
      : null;

  return (
    <CartProvider>
      <div className="min-h-screen bg-white">
        <StoreNavbar customer={customer} />
        <CartDrawer />
        <main>{children}</main>
      </div>
    </CartProvider>
  );
}
