const CART_KEY = "cart";
let cart = [];

function addToCart(name, price, image) {
  cart.push({ name, price, image });
  saveCart();
  updateCart();
}

function removeItem(index) {
  cart.splice(index, 1);
  saveCart();
  updateCart();
}

function toggleCart() {
  document.getElementById("cart-drawer").classList.toggle("open");
}

function openModal(modalId) {
  if (event) event.preventDefault();
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.style.display = "block";
  document.body.style.overflow = "hidden";
  const video = modal.querySelector('video');
  if (video) {
    try {
      video.currentTime = 0;
      const promise = video.play();
      if (promise !== undefined) promise.catch(() => {});
    } catch (e) {}
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  const video = modal.querySelector('video');
  if (video) {
    try { video.pause(); video.currentTime = 0; } catch (e) {}
  }
  modal.style.display = "none";
  document.body.style.overflow = "auto";
}

window.onclick = function(event) {
  if (event.target.classList.contains('modal')) {
    const modal = event.target;
    const video = modal.querySelector('video');
    if (video) { try { video.pause(); video.currentTime = 0; } catch(e){} }
    modal.style.display = "none";
    document.body.style.overflow = "auto";
  }
}

function updateCart() {
  const cartItems = document.getElementById("cart-items");
  const cartCount = document.getElementById("cart-count");
  const cartTotal = document.getElementById("cart-total");

  if (!cartItems || !cartCount || !cartTotal) return;

  cartCount.innerText = cart.length;
  cartItems.innerHTML = "";

  if (cart.length === 0) {
    cartItems.innerHTML = `<p class="empty-cart">Your cart is empty</p>`;
    cartTotal.innerText = "KSh 0";
    return;
  }

  let total = 0;

  cart.forEach((item, index) => {
    total += item.price;

    cartItems.innerHTML += `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}">
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <span>KSh ${item.price}</span>
        </div>
        <span class="remove-item" onclick="removeItem(${index})">✕</span>
      </div>
    `;
  });

  cartTotal.innerText = "KSh " + total;
}

function saveCart() {
  sessionStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function loadCart() {
  const stored = sessionStorage.getItem(CART_KEY);
  cart = stored ? JSON.parse(stored) : [];
}

function toggleMoreDropdown(e) {
  e.preventDefault();
  const menu = document.getElementById('more-menu');
  menu.classList.toggle('open');
}

function toggleFAQ(element) {
  const faqItem = element.parentElement;
  const answer = faqItem.querySelector('.faq-answer');
  const toggle = element.querySelector('.faq-toggle');
  
  answer.classList.toggle('open');
  toggle.textContent = answer.classList.contains('open') ? '−' : '+';
}

window.addEventListener('click', (e) => {
  const dropdown = document.querySelector('.more-dropdown');
  if (dropdown && !dropdown.contains(e.target)) {
    document.getElementById('more-menu').classList.remove('open');
  }
});

// Close modals when clicking outside
// Close modals when touching outside (mobile)
window.addEventListener('touchstart', function(event) {
  if (event.target.classList.contains('modal')) {
    const modal = event.target;
    const video = modal.querySelector('video');
    if (video) { try { video.pause(); video.currentTime = 0; } catch(e){} }
    modal.style.display = "none";
    document.body.style.overflow = "auto";
  }
});
document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    updateCart();

    const links = document.querySelectorAll('.category-link');
    const sections = document.querySelectorAll('.product-category');

    links.forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const target = link.getAttribute('data-category');

            // Remove active class from all links
            links.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Hide all sections
            sections.forEach(sec => sec.classList.remove('active'));

            // Show selected section
            const selected = document.getElementById(target);
            if(selected) selected.classList.add('active');

            // Scroll to top of products
            selected.scrollIntoView({ behavior: 'smooth' });
        });
    });
});
