require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { randomUUID } = require("crypto");
const { sendLowStockAlert } = require("./services/notificationService");

const app = express();
const port = process.env.PORT || 3333;
const jwtSecret = process.env.JWT_SECRET || "dev-secret-change-me";

app.use(cors());
app.use(express.json({ limit: "10mb" }));

const users = [
  {
    id: "u-admin",
    name: "Administrador",
    email: "admin@teeva.com",
    passwordHash: bcrypt.hashSync("admin123", 10),
    role: "ADMIN",
  },
  {
    id: "u-func",
    name: "Funcionario",
    email: "funcionario@teeva.com",
    passwordHash: bcrypt.hashSync("func123", 10),
    role: "EMPLOYEE",
  },
];

let brands = [
  { id: "b-apple", name: "Apple" },
  { id: "b-samsung", name: "Samsung" },
  { id: "b-motorola", name: "Motorola" },
  { id: "b-xiaomi", name: "Xiaomi" },
];

let suppliers = [
  { id: "s-premium", name: "Premium Cases", email: "compras@premium.test", phone: "11999990000" },
  { id: "s-urban", name: "Urban Distribuidora", email: "vendas@urban.test", phone: "11888880000" },
];

let products = [
  {
    id: "p-1",
    brandId: "b-samsung",
    supplierId: "s-premium",
    model: "Galaxy S24",
    caseColor: "Transparente",
    caseType: "Transparente",
    quantity: 3,
    minimumStock: 5,
    purchasePrice: 18,
    salePrice: 39.9,
    internalCode: "SAM-S24-TR",
    notes: "Reposicao urgente",
    photoUrl: "",
    soldCount: 42,
  },
  {
    id: "p-2",
    brandId: "b-apple",
    supplierId: "s-urban",
    model: "iPhone 15",
    caseColor: "Preta",
    caseType: "Anti-impacto",
    quantity: 14,
    minimumStock: 6,
    purchasePrice: 24,
    salePrice: 59.9,
    internalCode: "APL-15-AI",
    notes: "",
    photoUrl: "",
    soldCount: 31,
  },
];

let movements = [
  {
    id: "m-1",
    productId: "p-1",
    userId: "u-admin",
    type: "OUT",
    quantity: 2,
    oldQuantity: 5,
    newQuantity: 3,
    note: "Venda balcão",
    createdAt: new Date().toISOString(),
  },
];

let notificationConfig = {
  emailEnabled: false,
  whatsappEnabled: false,
  emailTo: "",
  whatsappTo: "",
};

function signUser(user) {
  return jwt.sign({ id: user.id, role: user.role, name: user.name }, jwtSecret, { expiresIn: "8h" });
}

function auth(req, res, next) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ message: "Token ausente." });

  try {
    req.user = jwt.verify(token, jwtSecret);
    return next();
  } catch {
    return res.status(401).json({ message: "Token invalido." });
  }
}

function adminOnly(req, res, next) {
  if (req.user.role !== "ADMIN") return res.status(403).json({ message: "Acesso permitido apenas ao administrador." });
  return next();
}

function hydrateProduct(product) {
  return {
    ...product,
    brand: brands.find((brand) => brand.id === product.brandId),
    supplier: suppliers.find((supplier) => supplier.id === product.supplierId) || null,
  };
}

app.get("/health", (_req, res) => res.json({ ok: true }));

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = users.find((item) => item.email === email);
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ message: "E-mail ou senha invalidos." });
  }

  const { passwordHash, ...safeUser } = user;
  return res.json({ token: signUser(user), user: safeUser });
});

app.get("/me", auth, (req, res) => {
  const user = users.find((item) => item.id === req.user.id);
  const { passwordHash, ...safeUser } = user;
  res.json(safeUser);
});

app.get("/products", auth, (req, res) => res.json(products.map(hydrateProduct)));

app.post("/products", auth, adminOnly, (req, res) => {
  const product = { id: randomUUID(), soldCount: 0, photoUrl: "", notes: "", ...req.body };
  products.push(product);
  res.status(201).json(hydrateProduct(product));
});

app.put("/products/:id", auth, adminOnly, (req, res) => {
  const index = products.findIndex((product) => product.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: "Produto nao encontrado." });

  products[index] = { ...products[index], ...req.body };
  return res.json(hydrateProduct(products[index]));
});

app.delete("/products/:id", auth, adminOnly, (req, res) => {
  products = products.filter((product) => product.id !== req.params.id);
  movements = movements.filter((movement) => movement.productId !== req.params.id);
  res.status(204).send();
});

app.post("/products/:id/movements", auth, async (req, res) => {
  const product = products.find((item) => item.id === req.params.id);
  if (!product) return res.status(404).json({ message: "Produto nao encontrado." });

  const { type, quantity, note } = req.body;
  const amount = Number(quantity);
  const oldQuantity = product.quantity;

  if (!["IN", "OUT", "ADJUST"].includes(type)) return res.status(400).json({ message: "Tipo de movimentacao invalido." });
  if (amount < 0) return res.status(400).json({ message: "Quantidade invalida." });
  if (type === "OUT" && amount > product.quantity) return res.status(400).json({ message: "Estoque insuficiente." });

  if (type === "IN") product.quantity += amount;
  if (type === "OUT") {
    product.quantity -= amount;
    product.soldCount += amount;
  }
  if (type === "ADJUST") {
    if (req.user.role !== "ADMIN") return res.status(403).json({ message: "Apenas administrador pode ajustar estoque." });
    product.quantity = amount;
  }

  const movement = {
    id: randomUUID(),
    productId: product.id,
    userId: req.user.id,
    type,
    quantity: amount,
    oldQuantity,
    newQuantity: product.quantity,
    note: note || "",
    createdAt: new Date().toISOString(),
  };
  movements.unshift(movement);

  let notification = null;
  if (product.quantity <= product.minimumStock && (notificationConfig.emailEnabled || notificationConfig.whatsappEnabled)) {
    try {
      notification = await sendLowStockAlert(hydrateProduct(product), notificationConfig);
    } catch (error) {
      notification = { error: error.message };
    }
  }

  return res.status(201).json({ movement, product: hydrateProduct(product), notification });
});

app.get("/movements", auth, (_req, res) => {
  const result = movements.map((movement) => ({
    ...movement,
    product: hydrateProduct(products.find((product) => product.id === movement.productId)),
    user: users.find((user) => user.id === movement.userId),
  }));
  res.json(result);
});

app.get("/dashboard", auth, (_req, res) => {
  const hydrated = products.map(hydrateProduct);
  res.json({
    totalProducts: products.length,
    totalUnits: products.reduce((sum, product) => sum + product.quantity, 0),
    lowStock: hydrated.filter((product) => product.quantity <= product.minimumStock),
    outOfStock: hydrated.filter((product) => product.quantity === 0),
    bestSellers: [...hydrated].sort((a, b) => b.soldCount - a.soldCount).slice(0, 5),
    latestMovements: movements.slice(0, 6),
  });
});

app.get("/settings/notifications", auth, adminOnly, (_req, res) => res.json(notificationConfig));

app.put("/settings/notifications", auth, adminOnly, (req, res) => {
  notificationConfig = { ...notificationConfig, ...req.body };
  res.json(notificationConfig);
});

app.post("/notifications/test", auth, adminOnly, async (req, res) => {
  const product = hydrateProduct(products[0]);
  const result = await sendLowStockAlert(product, { ...notificationConfig, ...req.body });
  res.json(result);
});

app.get("/reports/:type", auth, (req, res) => {
  const hydrated = products.map(hydrateProduct);
  const payload = {
    stock: hydrated,
    "low-stock": hydrated.filter((product) => product.quantity <= product.minimumStock),
    movements,
    "best-sellers": [...hydrated].sort((a, b) => b.soldCount - a.soldCount),
  }[req.params.type];

  if (!payload) return res.status(404).json({ message: "Relatorio nao encontrado." });
  return res.json(payload);
});

app.listen(port, () => {
  console.log(`API TeeVa rodando em http://localhost:${port}`);
});
