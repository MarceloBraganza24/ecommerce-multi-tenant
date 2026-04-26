type Props = {
  store: string;
  tenantName: string;
};

export function AdminSidebar({ store, tenantName }: Props) {
  return (
    <aside className="adminSidebar">
      <div>
        <strong>{tenantName}</strong>
        <span>Panel admin</span>
      </div>

      <nav>
        <a href={`/${store}/admin`}>Dashboard</a>
        <a href={`/${store}/admin/productos`}>Productos</a>
        <a href={`/${store}/admin/categorias`}>Categorías</a>
        <a href={`/${store}/admin/pedidos`}>Pedidos</a>
        <a href={`/${store}/admin/analytics`}>Analytics</a>
        <a href={`/${store}/admin/apariencia`}>Apariencia</a>
        <a href={`/${store}/admin/configuracion`}>Configuración</a>
        <a href={`/${store}`} target="_blank">
          Ver tienda
        </a>
      </nav>
    </aside>
  );
}