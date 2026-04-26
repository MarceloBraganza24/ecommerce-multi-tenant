import { notFound } from "next/navigation";
import { getTenantBySlug } from "@/lib/tenants";
import { getOrderByPublicCode } from "@/lib/orders";
import { CheckoutResult } from "@/components/store/CheckoutResult";

type Props = {
  params: Promise<{ store: string }>;
  searchParams: Promise<{ order?: string }>;
};

export default async function CheckoutFailurePage({
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
      title="No pudimos confirmar el pago"
      message="El pago no se completó o fue rechazado. Podés volver a intentarlo o consultar con la tienda."
      order={order}
    />
  );
}