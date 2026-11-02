class CartRemoveButton extends HTMLElement {
  constructor() {
    super();

    this.addEventListener("click", async (event) => {
      event.preventDefault();
      const cartItemsEl = this.closest("cart-items");
      const lineIndex = parseInt(this.dataset.index, 10);

      // 1️⃣ Fetch full cart to read bundle_ids
      const cart = await fetch("/cart.js").then((r) => r.json());
      const clickedItem = cart.items[lineIndex - 1];
      const _bundleId = clickedItem.properties?.bundle_id;

      // 2️⃣ If no bundle_id, remove single line as before
      if (!_bundleId) {
        return cartItemsEl.updateQuantity(lineIndex, 0, event);
      }
      // 3️⃣ Build a single update payload mapping EACH line-key → 0
      const updates = {};
      cart.items.forEach((item) => {
        if (item.properties.bundle_id === _bundleId) {
          updates[item.key] = 0;
        }
      });

      // 4️⃣ Send one POST to /cart/update.js to remove them all at once
      fetch("/cart/update.js", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      })
        .then((res) => res.json())
        .then(() => {
          // 5️⃣ Refresh UI (or call your section-render logic)
          cartItemsEl.onCartUpdate();
          window.location.reload();
        })
        .catch(console.error);
    });
  }
}
customElements.define("cart-remove-button", CartRemoveButton);

class CartItems extends HTMLElement {
  constructor() {
    super();
    this.lineItemStatusElement =
      document.getElementById("shopping-cart-line-item-status") ||
      document.getElementById("CartDrawer-LineItemStatus");

    const debouncedOnChange = debounce((event) => {
      this.onChange(event);
    }, ON_CHANGE_DEBOUNCE_TIMER);

    this.addEventListener("change", debouncedOnChange.bind(this));
  }

  cartUpdateUnsubscriber = undefined;

  connectedCallback() {
    this.cartUpdateUnsubscriber = subscribe(
      PUB_SUB_EVENTS.cartUpdate,
      (event) => {
        if (event.source === "cart-items") {
          return;
        }
        return this.onCartUpdate();
      }
    );
  }

  disconnectedCallback() {
    if (this.cartUpdateUnsubscriber) {
      this.cartUpdateUnsubscriber();
    }
  }

  resetQuantityInput(id) {
    const input = this.querySelector(`#Quantity-${id}`);
    input.value = input.getAttribute("value");
    this.isEnterPressed = false;
  }

  setValidity(event, index, message) {
    event.target.setCustomValidity(message);
    event.target.reportValidity();
    this.resetQuantityInput(index);
    event.target.select();
  }

  validateQuantity(event) {
    const inputValue = parseInt(event.target.value);
    const index = event.target.dataset.index;
    let message = "";

    if (inputValue < event.target.dataset.min) {
      message = window.quickOrderListStrings.min_error.replace(
        "[min]",
        event.target.dataset.min
      );
    } else if (inputValue > parseInt(event.target.max)) {
      message = window.quickOrderListStrings.max_error.replace(
        "[max]",
        event.target.max
      );
    } else if (inputValue % parseInt(event.target.step) !== 0) {
      message = window.quickOrderListStrings.step_error.replace(
        "[step]",
        event.target.step
      );
    }

    if (message) {
      this.setValidity(event, index, message);
    } else {
      event.target.setCustomValidity("");
      event.target.reportValidity();
      this.updateQuantity(
        index,
        inputValue,
        event,
        document.activeElement.getAttribute("name"),
        event.target.dataset.quantityVariantId
      );
    }
  }

  onChange(event) {
    this.validateQuantity(event);
  }

  onCartUpdate() {
    if (this.tagName === "CART-DRAWER-ITEMS") {
      return fetch(`${routes.cart_url}?section_id=cart-drawer`)
        .then((response) => response.text())
        .then((responseText) => {
          const html = new DOMParser().parseFromString(
            responseText,
            "text/html"
          );
          const selectors = ["cart-drawer-items", ".cart-drawer__footer"];
          for (const selector of selectors) {
            const targetElement = document.querySelector(selector);
            const sourceElement = html.querySelector(selector);
            if (targetElement && sourceElement) {
              targetElement.replaceWith(sourceElement);
            }
          }
        })
        .catch((e) => {
          console.error(e);
        });
    } else {
      return fetch(`${routes.cart_url}?section_id=main-cart-items`)
        .then((response) => response.text())
        .then((responseText) => {
          const html = new DOMParser().parseFromString(
            responseText,
            "text/html"
          );
          const sourceQty = html.querySelector("cart-items");
          this.innerHTML = sourceQty.innerHTML;
        })
        .catch((e) => {
          console.error(e);
        });
    }
  }

  getSectionsToRender() {
    return [
      {
        id: "main-cart-items",
        section: document.getElementById("main-cart-items").dataset.id,
        selector: ".js-contents",
      },
      {
        id: "cart-icon-bubble",
        section: "cart-icon-bubble",
        selector: ".shopify-section",
      },
      {
        id: "cart-live-region-text",
        section: "cart-live-region-text",
        selector: ".shopify-section",
      },
      {
        id: "main-cart-footer",
        section: document.getElementById("main-cart-footer").dataset.id,
        selector: ".js-contents",
      },
    ];
  }

  updateQuantity(line, quantity, event, name, variantId) {
    this.enableLoading(line);

    // Step 1: Fetch current cart
    fetch("/cart.js")
      .then((res) => res.json())
      .then((cart) => {
        const targetItem = cart.items[line - 1];
        const bundleId = targetItem?.properties?.bundle_id;

        // Step 2: If no bundle_id, normal quantity update
        if (!bundleId) {
          return fetch(routes.cart_change_url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              line,
              quantity,
            }),
          });
        }

        // Step 3: If bundle_id exists, update ALL related lines
        const updates = {};
        cart.items.forEach((item) => {
          if (item.properties?.bundle_id === bundleId) {
            updates[item.key] = quantity;
          }
        });

        return fetch("/cart/update.js", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ updates }),
        });
      })
      .then(() => {
        // Step 4: After update, fetch updated cart sections
        return fetch(
          `${routes.cart_url}?sections=main-cart-items,cart-icon-bubble,main-cart-footer,cart-live-region-text`
        );
      })
      .then((res) => res.json())
      .then((sectionsHtml) => {
        // Step 5: Finally re-render all sections
        this.renderSections(sectionsHtml);
      })
      .catch((e) => {
        console.error(e);
      })
      .finally(() => {
        this.disableLoading(line);
        window.location.reload();
      });
  }
  renderSections(sectionsHtml) {
    const sections = this.getSectionsToRender();
    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (!element) return;

      const html = sectionsHtml[section.section];
      if (!html) return;

      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = html;
      const newContent = tempDiv.querySelector(section.selector);
      if (newContent) {
        const targetElement =
          element.querySelector(section.selector) || element;
        targetElement.innerHTML = newContent.innerHTML;
      }
    });

    // Handle empty cart state
    const cartWrapper = document.querySelector("cart-items");
    if (cartWrapper && "item_count" in sectionsHtml) {
      cartWrapper.classList.toggle("is-empty", sectionsHtml.item_count === 0);
    }
  }

  updateLiveRegions(line, message) {
    const lineItemError =
      document.getElementById(`Line-item-error-${line}`) ||
      document.getElementById(`CartDrawer-LineItemError-${line}`);
    if (lineItemError)
      lineItemError.querySelector(".cart-item__error-text").textContent =
        message;

    this.lineItemStatusElement.setAttribute("aria-hidden", true);

    const cartStatus =
      document.getElementById("cart-live-region-text") ||
      document.getElementById("CartDrawer-LiveRegionText");
    cartStatus.setAttribute("aria-hidden", false);

    setTimeout(() => {
      cartStatus.setAttribute("aria-hidden", true);
    }, 1000);
  }

  getSectionInnerHTML(html, selector) {
    return new DOMParser()
      .parseFromString(html, "text/html")
      .querySelector(selector).innerHTML;
  }

  enableLoading(line) {
    const mainCartItems =
      document.getElementById("main-cart-items") ||
      document.getElementById("CartDrawer-CartItems");
    mainCartItems.classList.add("cart__items--disabled");

    const cartItemElements = this.querySelectorAll(
      `#CartItem-${line} .loading__spinner`
    );
    const cartDrawerItemElements = this.querySelectorAll(
      `#CartDrawer-Item-${line} .loading__spinner`
    );

    [...cartItemElements, ...cartDrawerItemElements].forEach((overlay) =>
      overlay.classList.remove("hidden")
    );

    document.activeElement.blur();
    this.lineItemStatusElement.setAttribute("aria-hidden", false);
  }

  disableLoading(line) {
    const mainCartItems =
      document.getElementById("main-cart-items") ||
      document.getElementById("CartDrawer-CartItems");
    mainCartItems.classList.remove("cart__items--disabled");

    const cartItemElements = this.querySelectorAll(
      `#CartItem-${line} .loading__spinner`
    );
    const cartDrawerItemElements = this.querySelectorAll(
      `#CartDrawer-Item-${line} .loading__spinner`
    );

    cartItemElements.forEach((overlay) => overlay.classList.add("hidden"));
    cartDrawerItemElements.forEach((overlay) =>
      overlay.classList.add("hidden")
    );
  }
}

customElements.define("cart-items", CartItems);

if (!customElements.get("cart-note")) {
  customElements.define(
    "cart-note",
    class CartNote extends HTMLElement {
      constructor() {
        super();

        this.addEventListener(
          "input",
          debounce((event) => {
            const body = JSON.stringify({ note: event.target.value });
            fetch(`${routes.cart_update_url}`, {
              ...fetchConfig(),
              ...{ body },
            }).then(() =>
              CartPerformance.measureFromEvent("note-update:user-action", event)
            );
          }, ON_CHANGE_DEBOUNCE_TIMER)
        );
      }
    }
  );
}
