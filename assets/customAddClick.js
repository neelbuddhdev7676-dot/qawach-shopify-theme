document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form.product-form");
  form?.addEventListener("submit", function (e) {
    e.preventDefault();
    
    // Get the submit button and show loading state
    const submitButton = form.querySelector('[type="submit"]');
    if (window.CartLoadingUtils) {
      window.CartLoadingUtils.showLoading(submitButton, 'Adding to cart...');
    } else {
      // Fallback for when utility is not loaded
      const buttonText = submitButton.querySelector('span');
      const loadingSpinner = submitButton.querySelector('.loading__spinner');
      
      submitButton.disabled = true;
      submitButton.setAttribute('aria-disabled', 'true');
      submitButton.classList.add('loading');
      if (buttonText) buttonText.classList.add('hidden');
      if (loadingSpinner) loadingSpinner.classList.remove('hidden');
    }
    
    const customizations = {};
    monogramLine1 = window.monogramLine1 || "";
    monogramLine2 = window.monogramLine2 || "";

    const savedMonogram = {
      monogramline1: monogramLine1.trim(),
      monogramline2: monogramLine2.trim(),
    };
    const selectedHardware = window.selectedHardware || "Antique Silver";
    const selectedQuiltedLining = window.selectedQuiltedLining || "No";

    const productVariantId = document.querySelector(
      'form[action^="/cart"] input[name="id"]'
    )?.value;

    const selectedHardwareColor = hardwareColors.find(
      (opt) => opt.title == selectedHardware
    ) || { title: selectedHardware, price: 0, id: null };
    const selectedQuiltedLiningOption = quiltedOptions.find(
      (opt) => opt.title == selectedQuiltedLining
    ) || { title: selectedQuiltedLining, price: 0, id: null };

    window.productVariantId = productVariantId;
    window.selectedHardwareColor = selectedHardwareColor;
    if (selectedQuiltedLiningOption.price > 0)
      window.selectedQuiltedLiningOption = selectedQuiltedLiningOption;
    if (monogramLine1 != "") window.monogramLine1 = monogramLine1;

    if (monogramLine2 != "") window.monogramLine2 = monogramLine2;

    const items = [];
    
    // Check if this is a simple product that doesn't need customization
    const isSimpleProduct = window.productData.tags.some(tag => 
      tag.includes("pillow cover") || tag.includes("leather skin hide")
    );
    
    if (isSimpleProduct) {
      items.push({
        id: productVariantId,
        quantity: 1,
      });
    } else {
        items.push({
          id: productVariantId,
          quantity: 1,
          properties: {
            "Hardware Color":
              selectedHardwareColor.title +
              (selectedHardwareColor.price > 0
                ? " (+$" + selectedHardwareColor.price / 100 + ")"
                : ""),
            "Monogram Line 1":
              savedMonogram.monogramline1 +
              (savedMonogram.monogramline1.length > 0 ? " (+$10)" : ""),
            "Monogram Line 2": savedMonogram.monogramline2,
            "Quilted Lining":
              selectedQuiltedLiningOption.title +
              (selectedQuiltedLiningOption.price > 0
                ? " (+$" + selectedQuiltedLiningOption.price / 100 + ")"
                : ""),
          },
        });
        if (selectedHardwareColor.id) {
          items.push({
            id: selectedHardwareColor.id,
            quantity: 1,
          });
        }
        if (selectedQuiltedLining != "No" && selectedQuiltedLiningOption.id)
          items.push({
            id: selectedQuiltedLiningOption.id,
            quantity: 1,
          });
        if (monogramLine1.length > 0 && monogram && monogram[0] && monogram[0].id)
          items.push({
            id: monogram[0].id,
            quantity: 1,
            properties: {
              "Monogram Line 1": savedMonogram.monogramline1,
              "Monogram Line 2": savedMonogram.monogramline2,
            },
          });
      }

    fetch("/cart/add.js", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        // Show success message
        if (window.showCartSnackbar) {
          window.showCartSnackbar("Product added to cart!");
        }
      })
      .catch((error) => {
        // Show error message
        if (window.showCartSnackbar) {
          window.showCartSnackbar("Error adding product to cart. Please try again.");
        }
      })
      .finally(() => {
        // Hide loading state
        if (window.CartLoadingUtils) {
          window.CartLoadingUtils.hideLoading(submitButton);
        } else {
          // Fallback for when utility is not loaded
          const buttonText = submitButton.querySelector('span');
          const loadingSpinner = submitButton.querySelector('.loading__spinner');
          
          submitButton.disabled = false;
          submitButton.removeAttribute('aria-disabled');
          submitButton.classList.remove('loading');
          if (buttonText) buttonText.classList.remove('hidden');
          if (loadingSpinner) loadingSpinner.classList.add('hidden');
        }
      });

    closeModal();
  });
});
