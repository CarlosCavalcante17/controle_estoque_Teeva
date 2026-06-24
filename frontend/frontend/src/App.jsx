import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Bell,
  Boxes,
  ChevronLeft,
  ChevronRight,
  Download,
  Edit3,
  FileText,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Moon,
  PackagePlus,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Smartphone,
  Sun,
  Trash2,
  Upload,
  Users,
  X,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { jsPDF } from "jspdf";

const storageKey = "teeva-stock-app";

const demoUsers = [
  { id: "u-admin", name: "Administrador", email: "admin@teeva.com", password: "admin123", role: "ADMIN" },
  { id: "u-func", name: "Funcionario", email: "funcionario@teeva.com", password: "func123", role: "EMPLOYEE" },
];

const initialState = {
  theme: "light",
  session: null,
  notificationConfig: {
    emailEnabled: true,
    whatsappEnabled: false,
    emailTo: "compras@teeva.com",
    whatsappTo: "5511999999999",
  },
  products: [
    {
      id: "p-1",
      brand: "Samsung",
      model: "Galaxy S24",
      caseColor: "Transparente",
      caseType: "Transparente",
      quantity: 3,
      minimumStock: 5,
      purchasePrice: 18,
      salePrice: 39.9,
      internalCode: "SAM-S24-TR",
      supplier: "Premium Cases",
      notes: "Reposicao urgente",
      photoUrl: "",
      soldCount: 42,
    },
    {
      id: "p-2",
      brand: "Apple",
      model: "iPhone 15",
      caseColor: "Preta",
      caseType: "Anti-impacto",
      quantity: 14,
      minimumStock: 6,
      purchasePrice: 24,
      salePrice: 59.9,
      internalCode: "APL-15-AI",
      supplier: "Urban Distribuidora",
      notes: "",
      photoUrl: "",
      soldCount: 31,
    },
    {
      id: "p-3",
      brand: "Motorola",
      model: "Moto G84",
      caseColor: "Azul",
      caseType: "Silicone",
      quantity: 0,
      minimumStock: 4,
      purchasePrice: 12,
      salePrice: 29.9,
      internalCode: "MOT-G84-SI",
      supplier: "Connect Capas",
      notes: "Sem estoque",
      photoUrl: "",
      soldCount: 18,
    },
    {
      id: "p-4",
      brand: "Xiaomi",
      model: "Redmi Note 13",
      caseColor: "Fume",
      caseType: "Premium",
      quantity: 9,
      minimumStock: 5,
      purchasePrice: 20,
      salePrice: 49.9,
      internalCode: "XIA-RN13-PR",
      supplier: "Premium Cases",
      notes: "",
      photoUrl: "",
      soldCount: 25,
    },
  ],
  movements: [
    {
      id: "m-1",
      productId: "p-1",
      productName: "Samsung Galaxy S24 - Transparente",
      type: "OUT",
      quantity: 2,
      oldQuantity: 5,
      newQuantity: 3,
      userName: "Administrador",
      note: "Venda no balcao",
      createdAt: new Date().toISOString(),
    },
    {
      id: "m-2",
      productId: "p-2",
      productName: "Apple iPhone 15 - Anti-impacto",
      type: "IN",
      quantity: 10,
      oldQuantity: 4,
      newQuantity: 14,
      userName: "Administrador",
      note: "Compra semanal",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ],
  notifications: [
    {
      id: "n-1",
      title: "Estoque minimo atingido",
      message: "Samsung Galaxy S24 - Capinha Transparente esta com 3 unidades.",
      createdAt: new Date().toISOString(),
      read: false,
    },
  ],
};

const emptyProduct = {
  brand: "",
  model: "",
  caseType: "",
  quantity: 0,
  minimumStock: 0,
  supplier: "",
  notes: "",
  soldCount: 0,
};

function currency(value) {
  return Number(value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(value) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function productName(product) {
  return `${product.brand} ${product.model} - Capinha ${product.caseType}`;
}

function loadState() {
  try {
    const saved = localStorage.getItem(storageKey);
    return saved ? { ...initialState, ...JSON.parse(saved) } : initialState;
  } catch {
    return initialState;
  }
}

function Badge({ children, tone = "neutral" }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

function IconButton({ title, children, onClick, disabled }) {
  return (
    <button type="button" className="icon-button" title={title} aria-label={title} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

function Login({ onLogin }) {
  const [email, setEmail] = useState("admin@teeva.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");

  function submit(event) {
    event.preventDefault();
    const user = demoUsers.find((item) => item.email === email && item.password === password);
    if (!user) {
      setError("E-mail ou senha invalidos.");
      return;
    }
    onLogin({ id: user.id, name: user.name, email: user.email, role: user.role });
  }

  return (
    <main className="login-page">
      <section className="login-panel">
        <div className="brand-mark">
          <Smartphone size={30} />
        </div>
        <h1>TeeVa Estoque</h1>
        <p>Controle inteligente para capinhas de celular.</p>
        <form onSubmit={submit} className="login-form">
          <label>
            E-mail
            <input value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label>
            Senha
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>
          {error && <div className="form-error">{error}</div>}
          <button className="primary-button" type="submit">
            Entrar
          </button>
        </form>
        <div className="demo-access">
          <span>Admin: admin@teeva.com / admin123</span>
          <span>Funcionario: funcionario@teeva.com / func123</span>
        </div>
      </section>
    </main>
  );
}

function Shell({ activeView, setActiveView, user, theme, toggleTheme, onLogout, children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigation = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "products", label: "Produtos", icon: Boxes },
    { id: "movements", label: "Movimentacoes", icon: PackagePlus },
    { id: "reports", label: "Relatorios", icon: FileText },
    { id: "settings", label: "Configuracoes", icon: Settings, admin: true },
    { id: "users", label: "Usuarios", icon: Users, admin: true },
  ].filter((item) => !item.admin || user.role === "ADMIN");

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? "open" : ""}`}>
        <div className="sidebar-head">
          <div className="brand-mark small">
            <Smartphone size={22} />
          </div>
          <div>
            <strong>TeeVa</strong>
            <span>Estoque</span>
          </div>
          <IconButton title="Fechar menu" onClick={() => setMenuOpen(false)}>
            <X size={18} />
          </IconButton>
        </div>
        <nav>
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={activeView === item.id ? "active" : ""}
                onClick={() => {
                  setActiveView(item.id);
                  setMenuOpen(false);
                }}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <div className="content-area">
        <header className="topbar">
          <IconButton title="Abrir menu" onClick={() => setMenuOpen(true)}>
            <Menu size={20} />
          </IconButton>
          <div>
            <h2>{navigation.find((item) => item.id === activeView)?.label || "Dashboard"}</h2>
            <span>{user.role === "ADMIN" ? "Administrador" : "Funcionario"} conectado</span>
          </div>
          <div className="topbar-actions">
            <button className="ghost-button" onClick={toggleTheme}>
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              Tema
            </button>
            <button className="ghost-button" onClick={onLogout}>
              <LogOut size={18} />
              Sair
            </button>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, tone }) {
  return (
    <article className={`metric-card ${tone || ""}`}>
      <div className="metric-icon">
        <Icon size={22} />
      </div>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function Dashboard({ products, movements, notifications }) {
  const lowStock = products.filter((product) => product.quantity <= product.minimumStock);
  const outOfStock = products.filter((product) => product.quantity === 0);
  const bestSellers = [...products].sort((a, b) => b.soldCount - a.soldCount).slice(0, 6);

  return (
    <main className="page-grid">
      <section className="metrics-grid">
        <MetricCard icon={Boxes} label="Produtos cadastrados" value={products.length} />
        <MetricCard icon={PackagePlus} label="Unidades em estoque" value={products.reduce((sum, product) => sum + product.quantity, 0)} />
        <MetricCard icon={AlertTriangle} label="Estoque baixo" value={lowStock.length} tone="danger" />
        <MetricCard icon={ShoppingCart} label="Sem estoque" value={outOfStock.length} tone="warning" />
      </section>

      <section className="panel wide">
        <div className="panel-head">
          <h3>Produtos mais vendidos</h3>
          <Badge tone="success">tempo real</Badge>
        </div>
        <div className="chart-box">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={bestSellers}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="model" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="soldCount" fill="#2563eb" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h3>Alertas</h3>
          <Bell size={18} />
        </div>
        <div className="stack-list">
          {lowStock.map((product) => (
            <div className="alert-row" key={product.id}>
              <AlertTriangle size={18} />
              <div>
                <strong>{productName(product)}</strong>
                <span>Quantidade atual: {product.quantity}</span>
              </div>
            </div>
          ))}
          {notifications.slice(0, 3).map((notification) => (
            <div className="alert-row neutral" key={notification.id}>
              <Bell size={18} />
              <div>
                <strong>{notification.title}</strong>
                <span>{notification.message}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h3>Ultimas movimentacoes</h3>
          <PackagePlus size={18} />
        </div>
        <div className="stack-list">
          {movements.slice(0, 6).map((movement) => (
            <div className="movement-row" key={movement.id}>
              <Badge tone={movement.type === "OUT" ? "danger" : movement.type === "IN" ? "success" : "warning"}>{movement.type}</Badge>
              <div>
                <strong>{movement.productName}</strong>
                <span>{movement.quantity} un. por {movement.userName} - {formatDate(movement.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function ProductModal({ product, onSave, onClose }) {
  const [form, setForm] = useState(product || emptyProduct);

  function change(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function submit(event) {
    event.preventDefault();
    onSave({
      ...form,
      quantity: Number(form.quantity),
      minimumStock: Number(form.minimumStock),
      purchasePrice: Number(form.purchasePrice),
      salePrice: Number(form.salePrice),
      soldCount: Number(form.soldCount || 0),
    });
  }

  function selectPhoto(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => change("photoUrl", reader.result);
    reader.readAsDataURL(file);
  }

  return (
    <div className="modal-backdrop">
      <form className="modal product-modal" onSubmit={submit}>
        <div className="modal-head">
          <h3>{product ? "Editar produto" : "Novo produto"}</h3>
          <IconButton title="Fechar" onClick={onClose}>
            <X size={18} />
          </IconButton>
        </div>
        <div className="form-grid">
          <label>Marca<input required value={form.brand} onChange={(event) => change("brand", event.target.value)} /></label>
          <label>Modelo<input required value={form.model} onChange={(event) => change("model", event.target.value)} /></label>
          <label>Tipo<input required value={form.caseType} onChange={(event) => change("caseType", event.target.value)} /></label>
          <label>Quantidade<input type="number" min="0" value={form.quantity} onChange={(event) => change("quantity", event.target.value)} /></label>
          <label>Estoque minimo<input type="number" min="0" value={form.minimumStock} onChange={(event) => change("minimumStock", event.target.value)} /></label>
          <label className="span-2">Observacoes<textarea value={form.notes} onChange={(event) => change("notes", event.target.value)} /></label>
        </div>
        <div className="modal-actions">
          <button type="button" className="ghost-button" onClick={onClose}>Cancelar</button>
          <button className="primary-button" type="submit">Salvar</button>
        </div>
      </form>
    </div>
  );
}

function MovementModal({ product, user, onSave, onClose }) {
  const [type, setType] = useState("IN");
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");

  function submit(event) {
    event.preventDefault();
    onSave({ product, type, quantity: Number(quantity), note, user });
  }

  return (
    <div className="modal-backdrop">
      <form className="modal" onSubmit={submit}>
        <div className="modal-head">
          <h3>Movimentar estoque</h3>
          <IconButton title="Fechar" onClick={onClose}><X size={18} /></IconButton>
        </div>
        <div className="selected-product">
          <strong>{productName(product)}</strong>
          <span>Estoque atual: {product.quantity}</span>
        </div>
        <label>Tipo
          <select value={type} onChange={(event) => setType(event.target.value)}>
            <option value="IN">Entrada</option>
            <option value="OUT">Saida</option>
            {user.role === "ADMIN" && <option value="ADJUST">Ajuste manual</option>}
          </select>
        </label>
        <label>{type === "ADJUST" ? "Novo estoque" : "Quantidade"}
          <input type="number" min="0" value={quantity} onChange={(event) => setQuantity(event.target.value)} />
        </label>
        <label>Observacao<textarea value={note} onChange={(event) => setNote(event.target.value)} /></label>
        <div className="modal-actions">
          <button type="button" className="ghost-button" onClick={onClose}>Cancelar</button>
          <button className="primary-button" type="submit">Registrar</button>
        </div>
      </form>
    </div>
  );
}

function ProductsPage({ products, user, onSaveProduct, onDeleteProduct, onMoveStock }) {
  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState("all");
  const [supplier, setSupplier] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [modalProduct, setModalProduct] = useState(null);
  const [movementProduct, setMovementProduct] = useState(null);
  const pageSize = 6;

  const brands = [...new Set(products.map((product) => product.brand))];
  const suppliers = [...new Set(products.map((product) => product.supplier))];

  const filtered = products.filter((product) => {
    const search = `${product.brand} ${product.model} ${product.caseType} ${product.internalCode}`.toLowerCase();
    const matchesQuery = search.includes(query.toLowerCase());
    const matchesBrand = brand === "all" || product.brand === brand;
    const matchesSupplier = supplier === "all" || product.supplier === supplier;
    const matchesStock =
      stockFilter === "all" ||
      (stockFilter === "low" && product.quantity <= product.minimumStock) ||
      (stockFilter === "empty" && product.quantity === 0);
    return matchesQuery && matchesBrand && matchesSupplier && matchesStock;
  });
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => setPage(1), [query, brand, supplier, stockFilter]);

  return (
    <main className="panel page-panel">
      <div className="panel-head wrap">
        <div>
          <h3>Produtos</h3>
          <span>Cadastro, pesquisa, filtros e estoque minimo.</span>
        </div>
        {user.role === "ADMIN" && (
          <button className="primary-button" onClick={() => setModalProduct(emptyProduct)}>
            <Plus size={18} />
            Novo produto
          </button>
        )}
      </div>

      <div className="filters">
        <label className="search-field">
          <Search size={18} />
          <input placeholder="Buscar por marca, modelo, tipo ou codigo" value={query} onChange={(event) => setQuery(event.target.value)} />
        </label>
        <select value={brand} onChange={(event) => setBrand(event.target.value)}>
          <option value="all">Todas as marcas</option>
          {brands.map((item) => <option key={item}>{item}</option>)}
        </select>
        <select value={supplier} onChange={(event) => setSupplier(event.target.value)}>
          <option value="all">Todos fornecedores</option>
          {suppliers.map((item) => <option key={item}>{item}</option>)}
        </select>
        <select value={stockFilter} onChange={(event) => setStockFilter(event.target.value)}>
          <option value="all">Todos estoques</option>
          <option value="low">Estoque baixo</option>
          <option value="empty">Sem estoque</option>
        </select>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Produto</th>
              <th>Tipo</th>
              <th>Estoque</th>
              <th>Fornecedor</th>
              <th>Compra</th>
              <th>Venda</th>
              <th>Acoes</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((product) => {
              const low = product.quantity <= product.minimumStock;
              return (
                <tr key={product.id} className={low ? "low-stock" : ""}>
                  <td>
                    <div className="product-cell">
                      {product.photoUrl ? <img src={product.photoUrl} alt="" /> : <div className="photo-placeholder"><Smartphone size={18} /></div>}
                      <div>
                        <strong>{product.brand} {product.model}</strong>
                        <span>{product.internalCode || "Sem codigo"} {product.caseColor ? `- ${product.caseColor}` : ""}</span>
                      </div>
                    </div>
                  </td>
                  <td>{product.caseType}</td>
                  <td>
                    <strong>{product.quantity}</strong>
                    <span className="muted">min. {product.minimumStock}</span>
                  </td>
                  <td>{product.supplier}</td>
                  <td>{currency(product.purchasePrice)}</td>
                  <td>{currency(product.salePrice)}</td>
                  <td>
                    <div className="row-actions">
                      <IconButton title="Movimentar" onClick={() => setMovementProduct(product)}><Upload size={17} /></IconButton>
                      {user.role === "ADMIN" && <IconButton title="Editar" onClick={() => setModalProduct(product)}><Edit3 size={17} /></IconButton>}
                      {user.role === "ADMIN" && <IconButton title="Excluir" onClick={() => onDeleteProduct(product.id)}><Trash2 size={17} /></IconButton>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button className="ghost-button" disabled={page === 1} onClick={() => setPage((current) => current - 1)}><ChevronLeft size={18} />Anterior</button>
        <span>Pagina {page} de {pages}</span>
        <button className="ghost-button" disabled={page === pages} onClick={() => setPage((current) => current + 1)}>Proxima<ChevronRight size={18} /></button>
      </div>

      {modalProduct && (
        <ProductModal
          product={modalProduct.id ? modalProduct : null}
          onClose={() => setModalProduct(null)}
          onSave={(payload) => {
            onSaveProduct(payload);
            setModalProduct(null);
          }}
        />
      )}
      {movementProduct && (
        <MovementModal
          product={movementProduct}
          user={user}
          onClose={() => setMovementProduct(null)}
          onSave={(payload) => {
            onMoveStock(payload);
            setMovementProduct(null);
          }}
        />
      )}
    </main>
  );
}

function MovementsPage({ movements }) {
  return (
    <main className="panel page-panel">
      <div className="panel-head">
        <h3>Historico de movimentacoes</h3>
        <Badge>{movements.length} registros</Badge>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Data e hora</th>
              <th>Produto</th>
              <th>Tipo</th>
              <th>Qtd.</th>
              <th>Antes</th>
              <th>Depois</th>
              <th>Usuario</th>
              <th>Obs.</th>
            </tr>
          </thead>
          <tbody>
            {movements.map((movement) => (
              <tr key={movement.id}>
                <td>{formatDate(movement.createdAt)}</td>
                <td>{movement.productName}</td>
                <td><Badge tone={movement.type === "OUT" ? "danger" : movement.type === "IN" ? "success" : "warning"}>{movement.type}</Badge></td>
                <td>{movement.quantity}</td>
                <td>{movement.oldQuantity}</td>
                <td>{movement.newQuantity}</td>
                <td>{movement.userName}</td>
                <td>{movement.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

function ReportsPage({ products, movements }) {
  const reports = {
    stock: products,
    lowStock: products.filter((product) => product.quantity <= product.minimumStock),
    movements,
    bestSellers: [...products].sort((a, b) => b.soldCount - a.soldCount),
  };

  function downloadCsv(name, rows) {
    const normalized = rows.map((row) => {
      if (row.model) {
        return {
          produto: productName(row),
          marca: row.brand,
          modelo: row.model,
          tipo: row.caseType,
          quantidade: row.quantity,
          minimo: row.minimumStock,
          fornecedor: row.supplier,
          compra: row.purchasePrice,
          venda: row.salePrice,
          vendidos: row.soldCount,
        };
      }
      return row;
    });
    const headers = Object.keys(normalized[0] || { vazio: "" });
    const csv = [headers.join(";"), ...normalized.map((row) => headers.map((header) => `"${String(row[header] ?? "").replaceAll('"', '""')}"`).join(";"))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${name}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function downloadPdf(name, rows) {
    const pdf = new jsPDF();
    pdf.setFontSize(16);
    pdf.text(`Relatorio - ${name}`, 14, 18);
    pdf.setFontSize(10);
    rows.slice(0, 28).forEach((row, index) => {
      const text = row.model ? `${productName(row)} | Estoque: ${row.quantity} | Fornecedor: ${row.supplier}` : `${row.createdAt} | ${row.productName} | ${row.type} ${row.quantity}`;
      pdf.text(text.slice(0, 105), 14, 30 + index * 8);
    });
    pdf.save(`${name}.pdf`);
  }

  const cards = [
    { id: "stock", label: "Estoque completo", rows: reports.stock },
    { id: "lowStock", label: "Produtos com estoque baixo", rows: reports.lowStock },
    { id: "movements", label: "Historico de movimentacoes", rows: reports.movements },
    { id: "bestSellers", label: "Produtos mais vendidos", rows: reports.bestSellers },
  ];

  return (
    <main className="reports-grid">
      {cards.map((card) => (
        <section className="panel report-card" key={card.id}>
          <FileText size={28} />
          <h3>{card.label}</h3>
          <p>{card.rows.length} registros prontos para exportacao.</p>
          <div className="report-actions">
            <button className="ghost-button" onClick={() => downloadCsv(card.id, card.rows)}><Download size={18} />Excel CSV</button>
            <button className="primary-button" onClick={() => downloadPdf(card.id, card.rows)}><Download size={18} />PDF</button>
          </div>
        </section>
      ))}
    </main>
  );
}

function SettingsPage({ config, onSave }) {
  const [form, setForm] = useState(config);
  return (
    <main className="panel page-panel settings-page">
      <div className="panel-head">
        <div>
          <h3>Configuracoes de notificacao</h3>
          <span>Use SMTP Gmail e Meta WhatsApp Cloud API no backend.</span>
        </div>
      </div>
      <div className="settings-grid">
        <label className="switch-row">
          <input type="checkbox" checked={form.emailEnabled} onChange={(event) => setForm({ ...form, emailEnabled: event.target.checked })} />
          <Mail size={20} />
          Enviar por e-mail
        </label>
        <label className="switch-row">
          <input type="checkbox" checked={form.whatsappEnabled} onChange={(event) => setForm({ ...form, whatsappEnabled: event.target.checked })} />
          <Bell size={20} />
          Enviar por WhatsApp
        </label>
        <label>E-mail destino<input value={form.emailTo} onChange={(event) => setForm({ ...form, emailTo: event.target.value })} /></label>
        <label>WhatsApp destino<input value={form.whatsappTo} onChange={(event) => setForm({ ...form, whatsappTo: event.target.value })} /></label>
      </div>
      <div className="code-note">
        <strong>Variaveis no backend</strong>
        <span>SMTP_USER, SMTP_PASS, WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID e WHATSAPP_TO.</span>
      </div>
      <button className="primary-button fit" onClick={() => onSave(form)}>Salvar configuracoes</button>
    </main>
  );
}

function UsersPage() {
  return (
    <main className="panel page-panel">
      <div className="panel-head">
        <h3>Usuarios e permissoes</h3>
        <ShieldCheck size={20} />
      </div>
      <div className="user-grid">
        {demoUsers.map((user) => (
          <article className="user-card" key={user.id}>
            <div className="avatar">{user.name.charAt(0)}</div>
            <strong>{user.name}</strong>
            <span>{user.email}</span>
            <Badge tone={user.role === "ADMIN" ? "success" : "neutral"}>{user.role}</Badge>
          </article>
        ))}
      </div>
    </main>
  );
}

export default function App() {
  const [state, setState] = useState(loadState);
  const [activeView, setActiveView] = useState("dashboard");

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(state));
    document.documentElement.dataset.theme = state.theme;
  }, [state]);

  const lowStockIds = useMemo(
    () => new Set(state.products.filter((product) => product.quantity <= product.minimumStock).map((product) => product.id)),
    [state.products],
  );

  function updateState(updater) {
    setState((current) => (typeof updater === "function" ? updater(current) : updater));
  }

  function saveProduct(payload) {
    updateState((current) => {
      const exists = current.products.some((product) => product.id === payload.id);
      const product = { ...payload, id: payload.id || crypto.randomUUID() };
      return {
        ...current,
        products: exists ? current.products.map((item) => (item.id === product.id ? product : item)) : [product, ...current.products],
      };
    });
  }

  function deleteProduct(id) {
    if (!confirm("Deseja excluir este produto?")) return;
    updateState((current) => ({
      ...current,
      products: current.products.filter((product) => product.id !== id),
      movements: current.movements.filter((movement) => movement.productId !== id),
    }));
  }

  function moveStock({ product, type, quantity, note, user }) {
    updateState((current) => {
      const target = current.products.find((item) => item.id === product.id);
      if (!target) return current;
      if (type === "OUT" && quantity > target.quantity) {
        alert("Estoque insuficiente para esta saida.");
        return current;
      }

      const oldQuantity = target.quantity;
      const newQuantity = type === "IN" ? oldQuantity + quantity : type === "OUT" ? oldQuantity - quantity : quantity;
      const updatedProduct = {
        ...target,
        quantity: newQuantity,
        soldCount: type === "OUT" ? target.soldCount + quantity : target.soldCount,
      };
      const movement = {
        id: crypto.randomUUID(),
        productId: target.id,
        productName: productName(target),
        type,
        quantity,
        oldQuantity,
        newQuantity,
        userName: user.name,
        note,
        createdAt: new Date().toISOString(),
      };
      const shouldNotify = !lowStockIds.has(target.id) && newQuantity <= target.minimumStock;
      const notification = shouldNotify
        ? {
            id: crypto.randomUUID(),
            title: "Estoque minimo atingido",
            message: `${productName(target)} esta com ${newQuantity} unidades. Notificacao configurada para ${current.notificationConfig.emailEnabled ? "e-mail" : ""}${current.notificationConfig.emailEnabled && current.notificationConfig.whatsappEnabled ? " e " : ""}${current.notificationConfig.whatsappEnabled ? "WhatsApp" : ""}.`,
            createdAt: new Date().toISOString(),
            read: false,
          }
        : null;

      return {
        ...current,
        products: current.products.map((item) => (item.id === target.id ? updatedProduct : item)),
        movements: [movement, ...current.movements],
        notifications: notification ? [notification, ...current.notifications] : current.notifications,
      };
    });
  }

  if (!state.session) {
    return <Login onLogin={(user) => updateState((current) => ({ ...current, session: user }))} />;
  }

  const views = {
    dashboard: <Dashboard products={state.products} movements={state.movements} notifications={state.notifications} />,
    products: (
      <ProductsPage
        products={state.products}
        user={state.session}
        onSaveProduct={saveProduct}
        onDeleteProduct={deleteProduct}
        onMoveStock={moveStock}
      />
    ),
    movements: <MovementsPage movements={state.movements} />,
    reports: <ReportsPage products={state.products} movements={state.movements} />,
    settings: <SettingsPage config={state.notificationConfig} onSave={(config) => updateState((current) => ({ ...current, notificationConfig: config }))} />,
    users: <UsersPage />,
  };

  return (
    <Shell
      activeView={activeView}
      setActiveView={setActiveView}
      user={state.session}
      theme={state.theme}
      toggleTheme={() => updateState((current) => ({ ...current, theme: current.theme === "dark" ? "light" : "dark" }))}
      onLogout={() => updateState((current) => ({ ...current, session: null }))}
    >
      {views[activeView] || views.dashboard}
    </Shell>
  );
}
