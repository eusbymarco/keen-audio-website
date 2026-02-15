document.addEventListener('DOMContentLoaded', () => {
    const cartCount = document.getElementById('cart-count');
    const cartBtn = document.getElementById('cart-btn');
    const cartDrawer = document.getElementById('cart-drawer');
    const cartItemsEl = document.getElementById('cart-items');
    const cartTotalEl = document.getElementById('cart-total');
    const closeCartBtn = document.querySelector('.close-cart');

    const currency = 'KSH';
    const stored = localStorage.getItem('cart');
    let cart = stored ? JSON.parse(stored) : [];

    const formatCurrency = (value) => `${currency} ${value.toLocaleString()}`;

    const saveCart = () => {
        localStorage.setItem('cart', JSON.stringify(cart));
        const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        cartCount.textContent = count;
    };

    const renderCart = () => {
        cartItemsEl.innerHTML = '';

        if (cart.length === 0) {
            cartItemsEl.innerHTML = '<p class="empty-cart">Your cart is empty.</p>';
            cartTotalEl.textContent = formatCurrency(0);
            return;
        }

        let total = 0;
        cart.forEach((item, index) => {
            const qty = item.quantity || 1;
            total += item.price * qty;
            const itemEl = document.createElement('div');
            itemEl.className = 'cart-item';
            itemEl.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <span>${formatCurrency(item.price)} x ${qty}</span>
                </div>
                <span class="remove-item" data-index="${index}">Remove</span>
            `;
            cartItemsEl.appendChild(itemEl);
        });

        cartTotalEl.textContent = formatCurrency(total);
    };

    const openCart = () => {
        cartDrawer.classList.add('open');
    };

    const closeCart = () => {
        cartDrawer.classList.remove('open');
    };

    const parsePrice = (raw) => {
        if (!raw) return 0;
        const cleaned = raw.toString().replace(/[^0-9.]/g, '');
        const value = parseFloat(cleaned);
        return Number.isNaN(value) ? 0 : value;
    };

    const getProductImage = (button) => {
        const card = button.closest('.product-card');
        const img = card ? card.querySelector('img') : null;
        return img ? img.getAttribute('src') : '';
    };

    // Initialize cart display
    saveCart();
    renderCart();

    // Add to cart buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', () => {
            const name = button.getAttribute('data-name') || 'Item';
            const priceAttr = button.getAttribute('data-price');
            const card = button.closest('.product-card');
            const priceText = card ? card.querySelector('.price')?.textContent : '';
            const price = parsePrice(priceAttr || priceText);
            const image = getProductImage(button);

            const existing = cart.find(item => item.name === name && item.price === price && item.image === image);
            if (existing) {
                existing.quantity = (existing.quantity || 1) + 1;
            } else {
                cart.push({ name, price, image, quantity: 1 });
            }
            saveCart();
            renderCart();
            openCart();
        });
    });

    // Remove item
    cartItemsEl.addEventListener('click', (event) => {
        const target = event.target;
        if (!target.classList.contains('remove-item')) return;
        const index = parseInt(target.getAttribute('data-index'), 10);
        if (Number.isNaN(index)) return;
        cart.splice(index, 1);
        saveCart();
        renderCart();
    });

    // Open/close cart
    cartBtn.addEventListener('click', (event) => {
        event.preventDefault();
        if (cartDrawer.classList.contains('open')) {
            closeCart();
        } else {
            renderCart();
            openCart();
        }
    });

    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', closeCart);
    }
});
