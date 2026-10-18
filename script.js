const products = [
  {
    id: 1,
    name: "Ethiopian Black Tea",
    category: "Tea",
    price: 950,
    description: "Full-bodied black tea with smooth malt notes and a deep golden finish.",
    image:
      "eddx.jpeg",
  },
  {
    id: 2,
    name: "Green Tea Blend",
    category: "Tea",
    price: 820,
    description: "Bright and refreshing green tea with a natural grassy aroma.",
    image:
      "eddx.jpeg",
  },
  {
    id: 3,
    name: "Cardamom Pods",
    category: "Spice",
    price: 1200,
    description: "Premium whole cardamom pods with rich aroma and vibrant flavour.",
    image:
      "eddx.jpeg",
  },
  {
    id: 4,
    name: "Masala Chai Mix",
    category: "Tea",
    price: 1100,
    description: "Warm spice blend for creating authentic chai with a bold finish.",
    image:
      "eddx.jpeg",
  },
];

const cart = [];
const cartCountEl = document.getElementById("cart-count");
const cartItemsEl = document.getElementById("cart-items");
const subtotalEl = document.getElementById("subtotal");
const shippingEl = document.getElementById("shipping");
const totalEl = document.getElementById("total");
const productGrid = document.getElementById("product-grid");
const cartButton = document.querySelector(".cart-button");
const checkoutForm = document.getElementById("checkout-form");
const clearCartButton = document.getElementById("clear-cart");
const countryCodeEl = document.getElementById("country-code");
const customerPhoneEl = document.getElementById("customer-phone");

function formatCurrency(value) {
  return `Rs ${value.toLocaleString()}`;
}

function validatePhoneNumber(phone, countryCode) {
  const digits = phone.replace(/\D/g, "");
  const code = countryCode.replace(/\D/g, "");

  return code.length > 0 && /^\d{10}$/.test(digits);
}

function renderProducts() {
  productGrid.innerHTML = products
    .map(
      (product) => `
        <article class="product-card">
          <img src="${product.image}" alt="${product.name}" />
          <div class="product-content">
            <div class="product-top">
              <h3>${product.name}</h3>
              <span class="product-tag">${product.category}</span>
            </div>
            <p>${product.description}</p>
            <div class="product-bottom">
              <span class="price">${formatCurrency(product.price)}</span>
              <button class="product-btn" type="button" data-id="${product.id}">Add to cart</button>
            </div>
          </div>
        </article>
      `
    )
    .join("");

  document.querySelectorAll(".product-btn").forEach((button) => {
    button.addEventListener("click", () => addToCart(Number(button.dataset.id)));
  });
}

function addToCart(productId) {
  const existingItem = cart.find((item) => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    const product = products.find((item) => item.id === productId);
    cart.push({ ...product, quantity: 1 });
  }

  renderCart();
}

function changeQuantity(productId, delta) {
  const itemIndex = cart.findIndex((item) => item.id === productId);

  if (itemIndex === -1) return;

  cart[itemIndex].quantity += delta;

  if (cart[itemIndex].quantity <= 0) {
    cart.splice(itemIndex, 1);
  }

  renderCart();
}

function clearCart() {
  cart.length = 0;
  renderCart();
}

function calculateTotals() {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = cart.length ? 250 : 0;
  const total = subtotal + shipping;
  return { subtotal, shipping, total };
}

function renderCart() {
  const { subtotal, shipping, total } = calculateTotals();

  cartCountEl.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (cart.length === 0) {
    cartItemsEl.innerHTML = '<div class="empty-state">Your cart is empty. Add tea or cardamom to begin.</div>';
  } else {
    cartItemsEl.innerHTML = cart
      .map(
        (item) => `
          <div class="cart-item">
            <div>
              <strong>${item.name}</strong>
              <div class="cart-meta">
                <span>${formatCurrency(item.price)}</span>
                <div class="quantity-control">
                  <button type="button" data-action="decrease" data-id="${item.id}">−</button>
                  <span>${item.quantity}</span>
                  <button type="button" data-action="increase" data-id="${item.id}">+</button>
                </div>
              </div>
            </div>
            <strong>${formatCurrency(item.price * item.quantity)}</strong>
          </div>
        `
      )
      .join("");

    cartItemsEl.querySelectorAll("button[data-action]").forEach((button) => {
      const productId = Number(button.dataset.id);
      const action = button.dataset.action;

      button.addEventListener("click", () => {
        if (action === "increase") {
          changeQuantity(productId, 1);
        } else {
          changeQuantity(productId, -1);
        }
      });
    });
  }

  subtotalEl.textContent = formatCurrency(subtotal);
  shippingEl.textContent = formatCurrency(shipping);
  totalEl.textContent = formatCurrency(total);
}

function buildWhatsAppMessage(formData) {
  const orderItems = cart
    .map((item) => `${item.name} x${item.quantity} - ${formatCurrency(item.price * item.quantity)}`)
    .join("\n");

  const { subtotal, shipping, total } = calculateTotals();

  return `Hello Golden Leaf Tea & Cardamom, I would like to place an order.\n\nCustomer: ${formData.name}\nPhone: ${formData.phone}\nAddress: ${formData.address}\nNotes: ${formData.notes || "None"}\n\nOrder:\n${orderItems}\n\nSubtotal: ${formatCurrency(subtotal)}\nDelivery: ${formatCurrency(shipping)}\nTotal: ${formatCurrency(total)}\n\nPlease confirm payment and delivery details.`;
}

checkoutForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!cart.length) {
    alert("Please add at least one product to your cart before checking out.");
    return;
  }

  const name = document.getElementById("customer-name").value.trim();
  const countryCode = countryCodeEl.value;
  const phone = customerPhoneEl.value.trim();
  const address = document.getElementById("customer-address").value.trim();
  const notes = document.getElementById("customer-notes").value.trim();

  if (!name || !phone || !address) {
    alert("Please complete your name, phone number, and delivery address.");
    return;
  }

  if (!validatePhoneNumber(phone, countryCode)) {
    alert("Please enter a valid 10-digit phone number with the selected country code.");
    customerPhoneEl.focus();
    return;
  }

  const fullPhone = `${countryCode} ${phone.replace(/\D/g, "")}`;
  const message = buildWhatsAppMessage({ name, phone: fullPhone, address, notes });
  const whatsappNumber = "9919871131";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  window.open(whatsappUrl, "_blank");
});

clearCartButton.addEventListener("click", clearCart);
cartButton.addEventListener("click", () => {
  document.querySelector(".checkout-area").scrollIntoView({ behavior: "smooth" });
});

renderProducts();
renderCart();
