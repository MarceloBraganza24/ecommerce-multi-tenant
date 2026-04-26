import { notFound } from "next/navigation";
import { getTenantBySlug } from "@/lib/tenants";
import { CheckoutForm } from "@/components/store/CheckoutForm";

type Props = {
  params: Promise<{ store: string }>;
};

export default async function CheckoutPage({ params }: Props) {
  const { store } = await params;

  const tenant = await getTenantBySlug(store);
  if (!tenant) notFound();

  return (
    <div className="innerPage">
      <div className="pageHeader">
        <span className="eyebrow">Checkout</span>
        <h1>Finalizar compra</h1>
        <p>Completá tus datos para continuar al pago seguro.</p>
      </div>

      <CheckoutForm store={store} />
    </div>
  );
}