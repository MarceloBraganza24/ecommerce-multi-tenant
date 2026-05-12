import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/adminAuth";
import { AdminLoginForm } from "@/components/admin/auth/AdminLoginForm";

type Props = {
  params: Promise<{
    store: string;
  }>;
};

export default async function AdminLoginPage({ params }: Props) {
  const { store } = await params;

  const session = await getAdminSession();

  if (session?.user?.tenantSlug === store) {
    redirect(`/${store}/admin`);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-400">
            Admin
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-950">
            Ingresar a la tienda
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Accedé al panel de administración de {store}.
          </p>
        </div>

        <AdminLoginForm store={store} />
      </div>
    </main>
  );
}