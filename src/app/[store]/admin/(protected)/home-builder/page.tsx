import { HomeBuilderAdmin } from "@/components/admin/builder/HomeBuilderAdmin";
import { Tenant } from "@/models/Tenant";
import { connectDB } from "@/lib/mongodb";
import { defaultHomeSections } from "@/lib/builder/defaultHomeSections";
import { defaultFooter } from "@/lib/builder/defaultFooter";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{
    store: string;
  }>;
};

export default async function AdminHomeBuilderPage({ params }: Props) {
  const { store } = await params;

  await connectDB();

  const tenant = await Tenant.findOne({ slug: store }).lean();
  const safeTenant = JSON.parse(JSON.stringify(tenant));

  if (!tenant) {
    notFound();
  }

  const initialSections =
    safeTenant.builder?.homeSections?.length > 0
      ? JSON.parse(JSON.stringify(safeTenant.builder.homeSections))
      : defaultHomeSections;

  const initialFooter = safeTenant.builder?.footer
    ? JSON.parse(JSON.stringify(safeTenant.builder.footer))
    : defaultFooter;

  return (
    <HomeBuilderAdmin
      tenantId={String(safeTenant._id)}
      store={store}
      storeName={safeTenant.name}
      initialSections={initialSections}
      initialFooter={initialFooter}
    />
  );
}