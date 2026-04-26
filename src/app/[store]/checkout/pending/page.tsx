import { notFound } from "next/navigation";
import { getTenantBySlug } from "@/lib/tenants";
import { getOrderByPublicCode } from "@/lib/orders";
import { CheckoutResult } from "@/components/store/CheckoutResult";

type Props = {
  params: Promise<{ store: string }>;
  searchParams: Promise<{ order?: string }>;
};

export default async function CheckoutPendingPage({
  params,
  searchParams,
}: Props) {
  const { store } = await params;
  const { order: publicCode } = await searchParams;

  const tenant = await getTenantBySlug(store);
  if (!tenant) notFound();

  const order = publicCode
    ? await getOrderByPublicCode(tenant._id, publicCode)
    : null;

  return (
    <CheckoutResult
      store={store}
      title="Tu pago está pendiente"
      message="Mercado Pago todavía está procesando el pago. Podés consultar el estado de tu pedido cuando quieras."
      order={order}
    />
  );
}