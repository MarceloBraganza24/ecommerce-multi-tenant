import { notFound } from "next/navigation";
import { getTenantBySlug } from "@/lib/tenants";
import { getOrderByPublicCode } from "@/lib/orders";
import { CheckoutResult } from "@/components/store/CheckoutResult";
import { ClearCartOnSuccess } from "@/components/store/ClearCartOnSuccess";

type Props = {
  params: Promise<{ store: string }>;
  searchParams: Promise<{ order?: string }>;
};

export default async function CheckoutSuccessPage({
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
    <>
    <ClearCartOnSuccess store={store} />
    <CheckoutResult
      store={store}
      title="¡Gracias por tu compra!"
      message="Recibimos tu pedido. Si el pago fue aprobado, lo vamos a preparar pronto."
      order={order}
      />
    </>
  );
}