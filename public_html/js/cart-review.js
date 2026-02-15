const CART_KEY = "cart";
const WHATSAPP_NUMBER = "254768102133";
const currency = "KSh";

const cartList = document.getElementById("cart-review-list");
const cartTotalEl = document.getElementById("cart-review-total");
const cartCountEl = document.getElementById("cart-count");
const confirmBtn = document.getElementById("confirm-order");

function loadCart() {
  const stored = localStorage.getItem(CART_KEY);
  return stored ? JSON.parse(stored) : [];
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function formatCurrency(value) {
  return `${currency} ${value.toLocaleString()}`;
}

function normalizeCart(cart) {
  const normalized = [];

  cart.forEach(item => {
    const qty = item.quantity || 1;
    const key = `${item.name}__${item.price}__${item.image}`;
    const existing = normalized.find(entry => entry.key === key);
    if (existing) {
      existing.quantity += qty;
    } else {
      normalized.push({
        key,
        name: item.name,
        price: item.price,
        image: item.image || "",
        quantity: qty
      });
    }
  });

  return normalized;
}

function updateCartCount(cart) {
  const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  if (cartCountEl) cartCountEl.textContent = count;
}

function renderCart() {
  let cart = loadCart();
  cart = normalizeCart(cart);
  saveCart(cart);

  cartList.innerHTML = "";

  if (cart.length === 0) {
    cartList.innerHTML = '<p class="empty-cart">Your cart is empty.</p>';
    cartTotalEl.textContent = formatCurrency(0);
    updateCartCount(cart);
    return;
  }

  let total = 0;

  cart.forEach((item, index) => {
    total += item.price * item.quantity;

    const row = document.createElement("div");
    row.className = "cart-review-item";
    row.innerHTML = `
      <div class="cart-review-info">
        <img src="${item.image}" alt="${item.name}">
        <div class="cart-review-meta">
          <h4>${item.name}</h4>
          <span>${formatCurrency(item.price)}</span>
        </div>
      </div>
      <div class="cart-review-controls">
        <div class="qty-control">
          <button class="qty-btn" data-action="decrease" data-index="${index}">-</button>
          <span class="qty-value">${item.quantity}</span>
          <button class="qty-btn" data-action="increase" data-index="${index}">+</button>
        </div>
        <button class="remove-btn" data-index="${index}">Remove</button>
      </div>
    `;
    cartList.appendChild(row);
  });

  cartTotalEl.textContent = formatCurrency(total);
  updateCartCount(cart);
}

function updateQuantity(index, delta) {
  const cart = normalizeCart(loadCart());
  if (!cart[index]) return;

  cart[index].quantity += delta;
  if (cart[index].quantity <= 0) {
    cart.splice(index, 1);
  }

  saveCart(cart);
  renderCart();
}

function removeItem(index) {
  const cart = normalizeCart(loadCart());
  cart.splice(index, 1);
  saveCart(cart);
  renderCart();
}

cartList.addEventListener("click", (event) => {
  const target = event.target;
  const index = parseInt(target.getAttribute("data-index"), 10);

  if (target.classList.contains("qty-btn")) {
    const action = target.getAttribute("data-action");
    updateQuantity(index, action === "increase" ? 1 : -1);
  }

  if (target.classList.contains("remove-btn")) {
    removeItem(index);
  }
});

confirmBtn.addEventListener("click", () => {
  const cart = normalizeCart(loadCart());
  if (cart.length === 0) {
    alert("Your cart is empty.");
    return;
  }

  const lines = cart.map((item, i) => {
    const lineTotal = item.price * item.quantity;
    return `${i + 1}. ${item.name} x ${item.quantity} - ${formatCurrency(lineTotal)}`;
  });
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const message = `KEEN Audio Order:\n${lines.join("\n")}\nTotal: ${formatCurrency(total)}`;

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
});

renderCart();
