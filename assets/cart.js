// Simple cart handling with localStorage
(function () {
  const STORAGE_KEY = 'cartItems';

  function getCartItems() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function getTotalQuantity(items) {
    // Show number of distinct products in the cart
    return Array.isArray(items) ? items.length : 0;
  }

  function saveCartItems(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    updateCartBadge(items);
  }

  function updateCartBadge(items) {
    const currentItems = items || getCartItems();
    const totalQty = getTotalQuantity(currentItems);
    const cartLinks = document.querySelectorAll('.nav-icons a');
    cartLinks.forEach((link) => {
      if (link.textContent.trim().toLowerCase().startsWith('anfrage')) {
        link.textContent = `Anfrage (${totalQty})`;
      }
    });
  }

  function setupAddToCartOnProductPage() {
    const button = document.querySelector('.btn-request');
    if (!button) return;

    button.addEventListener('click', function (e) {
      e.preventDefault();

      const titleEl = document.querySelector('.product-info h1');
      const metaEl = document.querySelector('.description p');
      const imgEl = document.getElementById('mainImage');
      const qtyInput = document.querySelector('.action-area input[type="number"]');

      if (!titleEl || !imgEl) return;

      const specsRows = Array.from(document.querySelectorAll('.specs-table tr'));
      const nrRow = specsRows.find(
        (tr) =>
          tr.children[0] &&
          tr.children[0].textContent.trim().toLowerCase() === 'nr.'
      );
      const id = nrRow
        ? nrRow.children[1].textContent.trim()
        : titleEl.textContent.trim();

      const qtyRaw = qtyInput ? parseInt(qtyInput.value, 10) : 1;
      const qty = Number.isNaN(qtyRaw) || qtyRaw < 1 ? 1 : qtyRaw;

      const items = getCartItems();
      const existing = items.find((item) => item.id === id);

      if (existing) {
        const currentQty = parseInt(existing.qty, 10);
        existing.qty = (Number.isNaN(currentQty) ? 0 : currentQty) + qty;
      } else {
        items.push({
          id,
          title: titleEl.textContent.trim(),
          meta: metaEl ? metaEl.textContent.trim() : '',
          image: imgEl.src,
          qty,
        });
      }

      saveCartItems(items);

      // Navigate to cart page after adding
      const cartHref = document.querySelector('.nav-icons a[href$="cart.html"]');
      if (cartHref && cartHref.getAttribute('href')) {
        window.location.href = cartHref.getAttribute('href');
      } else {
        window.location.href = '../cart.html';
      }
    });
  }

  function renderCartPage() {
    const tbody = document.querySelector('.cart-table tbody');
    if (!tbody) return;

    const items = getCartItems();
    tbody.innerHTML = '';

    if (!items.length) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = 2;
      td.textContent = 'Ihre Anfrage-Liste ist leer.';
      td.style.padding = '20px 0';
      tr.appendChild(td);
      tbody.appendChild(tr);
      return;
    }

    items.forEach((item) => {
      const tr = document.createElement('tr');

      const tdProduct = document.createElement('td');
      const tdQty = document.createElement('td');
      tdQty.className = 'cart-qty';

      const itemCol = document.createElement('div');
      itemCol.className = 'cart-item-col';

      const img = document.createElement('img');
      img.className = 'cart-item-img';
      img.src = item.image;
      img.alt = item.title;

      const details = document.createElement('div');
      details.className = 'cart-item-details';

      const titleDiv = document.createElement('div');
      titleDiv.className = 'cart-item-title';
      titleDiv.textContent = item.title;

      if (item.meta) {
        const metaDiv = document.createElement('div');
        metaDiv.className = 'cart-item-meta';
        metaDiv.textContent = item.meta;
        details.appendChild(metaDiv);
      }

      const removeLink = document.createElement('a');
      removeLink.href = '#';
      removeLink.className = 'cart-item-remove';
      removeLink.textContent = 'Aus Liste entfernen';
      removeLink.dataset.id = item.id;

      details.insertBefore(titleDiv, details.firstChild);
      details.appendChild(removeLink);

      itemCol.appendChild(img);
      itemCol.appendChild(details);

      tdProduct.appendChild(itemCol);

      const input = document.createElement('input');
      input.type = 'number';
      input.min = '1';
      input.value = String(item.qty || 1);
      input.dataset.id = item.id;

      tdQty.appendChild(input);

      tr.appendChild(tdProduct);
      tr.appendChild(tdQty);
      tbody.appendChild(tr);
    });

    attachCartHandlers();
  }

  function attachCartHandlers() {
    const tbody = document.querySelector('.cart-table tbody');
    if (!tbody) return;

    tbody.addEventListener('click', (e) => {
      const target = e.target;
      if (
        target &&
        target.matches &&
        target.matches('.cart-item-remove')
      ) {
        e.preventDefault();
        const id = target.dataset.id;
        if (!id) return;
        const items = getCartItems().filter((item) => item.id !== id);
        saveCartItems(items);
        renderCartPage();
      }
    });

    tbody.addEventListener('change', (e) => {
      const target = e.target;
      if (
        target &&
        target.matches &&
        target.matches('.cart-qty input[type="number"]')
      ) {
        const id = target.dataset.id;
        if (!id) return;
        let qty = parseInt(target.value, 10);
        if (Number.isNaN(qty) || qty < 1) {
          qty = 1;
          target.value = '1';
        }
        const items = getCartItems();
        const existing = items.find((item) => item.id === id);
        if (existing) {
          existing.qty = qty;
          saveCartItems(items);
        }
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    updateCartBadge();
    setupAddToCartOnProductPage();
    renderCartPage();
  });
})();

