document.addEventListener("DOMContentLoaded", function () {
  // Modal elements
  const modal = document.getElementById("customizationModal");
  const openModalButton = document.getElementById("openModal");
  const closeModalButton = document.getElementById("closeModal");
  const saveButton = document.getElementById("saveCustomizations");
  const pageSaveButton = document.getElementById("pageSaveCustomizations");
  const closeModalX = document.querySelector(".close-modal");
  const content = document.getElementById("customizationContent");
  const menuItems = document.querySelectorAll(".modal-left li");
  const productForm = document.querySelectorAll("product-form");
  const customModalBtn = document.querySelector(".button-customize");
  const isCustomOrderPage = !!document.getElementById(
    "orderSaveCustomizations"
  );
  const customOrderPageButton = document.getElementById(
    "orderSaveCustomizations"
  );

  let selectedHardware = "Antique Silver";
  let selectedLining = "Default";
  let selectedQuiltedLining = "No";
  let selectedLeatherColor = "Default";
  let monogramLine1 = "";
  let monogramLine2 = "";
  let userComments = ""; // Add this line
  let hardwarePrice = 0;
  let quiltedPrice = 0;
  let liningPrice = 0;

  if (pageSaveButton) {
    pageSaveButton.style.display = "block";

    productForm.forEach((item) => {
      item.style.display = "none";
    });
  }

  // Fix price display on page load
  function initializePriceDisplay() {
    const priceContainer = document.querySelector('.product__price .price, .price');
    if (priceContainer && window.productData) {
      const regularPriceEl = priceContainer.querySelector('.price-item--regular');
      const compareAtPrice = parseFloat(window.productData.compareAtPrice);
      
      if (regularPriceEl && compareAtPrice) {
        // Format the price properly
        const formattedPrice = '$' + compareAtPrice.toFixed(2);
        regularPriceEl.textContent = formattedPrice + ' USD';
        console.log('Initial price fixed:', formattedPrice);
      }
    }
  }
  
  // Call on page load
  initializePriceDisplay();

  // Track price adjustments for each option group
  const priceAdjustments = {
    hardware: 0,
    monogram: 0,
    lining: 0,
    jacketLining: 0,
    leatherColor: 0,
  };

  const optionMap = Object.fromEntries(
    window.customization_options?.map((opt) => [opt.title, opt.variants])
  );

  const hardwareColors = optionMap["Hardware Color"] || [];
  const jacketLining = optionMap["Lining"] || [];
  const monogram = optionMap["Monogram"] || [];
  const quiltedOptions = optionMap["Quilted Lining"] || [];
  const leatherOptions = optionMap["Leather Color"] || [];

  // Open modal
  openModalButton?.addEventListener("click", function () {
    modal.style.display = "flex";
    document.body.classList.add("no-scroll");
    modal.querySelector(".modal-content").scrollTop = 0;
    window.loadOption("hardwareColor");
    setTimeout(updateCustomizationModalTotal, 100);
    setTimeout(() => {
      // Remove 'active' from all menu items
      document.querySelectorAll('.modal-menu-item').forEach(item => item.classList.remove('active'));
      // Set 'active' on hardware color by default
      const hardwareMenu = document.querySelector('.modal-menu-item[data-option="hardwareColor"]');
      if (hardwareMenu) hardwareMenu.classList.add('active');
      else {
        // fallback: highlight first menu item if hardware color not found
        const firstMenu = document.querySelector('.modal-menu-item');
        if (firstMenu) firstMenu.classList.add('active');
      }
    }, 100);
  });

  // Close modal
  function closeModal() {
    modal.style.display = "none";
    document.body.classList.remove("no-scroll");
    document.querySelectorAll('.modal-menu-item.active').forEach(item => item.classList.remove('active'));
  }
  const measurementKeys = {
    upperwear: [
      "weight",
      "height",
      "shoulder",
      "sleeves",
      "chest",
      "waist",
      "hip",
      "bicep",
      "cuff",
    ],
    pant: [
      "waist_circumference",
      "hip_width",
      "thigh_width",
      "knee_width",
      "leg_bottom",
      "front_rise",
      "back_rise",
      "length_waist_ankle",
    ],
    skirt: ["waist_circumference", "hip_width", "bottom", "length"],
  }[getProductType()];
  if (!window.measurements) window.measurements = {};
  measurementKeys.forEach((key) => {
    const el = document.getElementById(key);
    if (el) window.measurements[key] = el.value;
  });
  [closeModalButton, closeModalX].forEach((btn) => {
    btn?.addEventListener("click", closeModal);
  });

  // Close when clicking outside
  window.addEventListener("click", function (event) {
    if (event.target === modal) {
      closeModal();
    }
  });

  // Save customizations
  // saveButton?.addEventListener("click", function () {
  //   closeModal();
  //   // alert("Your customizations have been saved!");
  // });

  function getEffectiveBasePrice() {
    return parseFloat(window.productData?.basePrice) || 0;
  }

  function updateMenuPrices() {
    const basePrice = getEffectiveBasePrice();

    // Helper to format price
    function formatPriceUSD(amount) {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(amount);
    }

    // Hardware Color
    const hardwarePrice = hardwareColors.find((opt) => opt.title === selectedHardware)?.price || 0;
    const hardwareMenu = document.querySelector('.modal-menu-item[data-option="hardwareColor"]');
    if (hardwareMenu) {
      const priceSpan = hardwareMenu.querySelector('.option-price');
      if (priceSpan) priceSpan.textContent = hardwarePrice > 0 ? `(+${formatPriceUSD(hardwarePrice / 100)})` : '';
      if (selectedHardware && selectedHardware !== 'Antique Silver') {
        hardwareMenu.classList.add('customized');
      } else {
        hardwareMenu.classList.remove('customized');
      }
    }

    // Lining
    const liningPrice = jacketLining.find((opt) => opt.title === selectedLining)?.price || 0;
    const liningMenu = document.querySelector('.modal-menu-item[data-option="lining"]');
    if (liningMenu) {
      const priceSpan = liningMenu.querySelector('.option-price');
      if (priceSpan) priceSpan.textContent = liningPrice > 0 ? `(+${formatPriceUSD(liningPrice / 100)})` : '';
      if (selectedLining && selectedLining !== 'Default') {
        liningMenu.classList.add('customized');
      } else {
        liningMenu.classList.remove('customized');
      }
    }

    // Quilted Lining
    const quiltedPrice = quiltedOptions.find((opt) => opt.title === selectedQuiltedLining)?.price || 0;
    const quiltedMenu = document.querySelector('.modal-menu-item[data-option="quiltedLining"]');
    if (quiltedMenu) {
      const priceSpan = quiltedMenu.querySelector('.option-price');
      if (priceSpan) priceSpan.textContent = quiltedPrice > 0 ? `(+${formatPriceUSD(quiltedPrice / 100)})` : '';
      if (selectedQuiltedLining && selectedQuiltedLining !== 'No') {
        quiltedMenu.classList.add('customized');
      } else {
        quiltedMenu.classList.remove('customized');
      }
    }

    // Monogram
    const monogramPrice = monogramLine1 ? monogram[0]?.price / 100 : 0;
    const monogramMenu = document.querySelector('.modal-menu-item[data-option="monogram"]');
    if (monogramMenu) {
      const priceSpan = monogramMenu.querySelector('.option-price');
      if (priceSpan) priceSpan.textContent = monogramPrice > 0 ? `(+${formatPriceUSD(monogramPrice)})` : '';
      if (monogramLine1 && monogramLine1.trim().length > 0) {
        monogramMenu.classList.add('customized');
      } else {
        monogramMenu.classList.remove('customized');
      }
    }

    // Measurements (show 'Custom' if any measurement is filled)
    const hasMeasurements = window.measurements
      ? Object.values(window.measurements).some((val) => val && val.trim() !== "")
      : false;
    const measurementsMenu = document.querySelector('.modal-menu-item[data-option="measurements"]');
    if (measurementsMenu) {
      const priceSpan = measurementsMenu.querySelector('.option-price');
      if (priceSpan) priceSpan.textContent = hasMeasurements ? '(Custom)' : '';
      if (hasMeasurements) {
        measurementsMenu.classList.add('customized');
      } else {
        measurementsMenu.classList.remove('customized');
      }
    }

    updateCustomizationModalTotal();
  }

  function renderOptionsRadioGroup(name, options, selectedValue) {
    return options
      .map((opt, i) => {
        const title = opt.option_name || opt.title;
        const price = opt.price / 100;
        const isChecked = selectedValue === title ? "checked" : "";
        const img =
          opt.featured_image?.src ||
          opt.featured_media?.preview_image?.src ||
          "";
        return `
      <div class="option">
        <input type="radio" 
               id="${name}-${i}" 
               name="properties[${name}]" 
               value="${title}"
               data-price="${price}"
               ${isChecked}>
        <label for="${name}-${i}">
          ${img ? `<img src="${img}" class="option-image" alt="${title}">` : ""}
          <span>${title} ${price > 0 ? `(+\$${price})` : ""}</span>
        </label>
      </div>`;
      })
      .join("");
  }

  function getProductType() {
    if (window.productData?.productType) {
      return window.productData.productType;
    }

    // Then check product tags for PDP
    const tags =
      window.productData?.product?.tags || window.productData?.tags || [];

    if (tags.some((tag) => tag.match(/upperwear|jacket|coat|blazer|vest/i)))
      return "upperwear";
    if (tags.some((tag) => tag.match(/skirt/i))) return "skirt";
    if (tags.some((tag) => tag.match(/pant|trouser/i))) return "pant";

    return "upperwear";
  }

  window.loadOption = function (option, collectMode = false) {
    // Save current values
    const inp1 = document.getElementById("monogram_text1");
    const inp2 = document.getElementById("monogram_text2");
    if (inp1) monogramLine1 = inp1.value;
    if (inp2) monogramLine2 = inp2.value;
    const commentsInput = document.getElementById("user_comments");
    if (commentsInput) userComments = commentsInput.value;

    const measurementKeys = {
      upperwear: [
        "weight",
        "height",
        "shoulder",
        "sleeves",
        "chest",
        "waist",
        "hip",
        "bicep",
        "cuff",
      ],
      pant: [
        "waist_circumference",
        "hip_width",
        "thigh_width",
        "knee_width",
        "leg_bottom",
        "front_rise",
        "back_rise",
        "length_waist_ankle",
      ],
      skirt: ["waist_circumference", "hip_width", "bottom", "length"],
    }[getProductType()];
    if (!window.measurements) window.measurements = {};
    measurementKeys.forEach((key) => {
      const el = document.getElementById(key);
      if (el) window.measurements[key] = el.value;
    });

    const selectedHardwareRadio = document.querySelector(
      'input[name="properties[Hardware Color]"]:checked'
    );
    if (selectedHardwareRadio) {
      selectedHardware = selectedHardwareRadio.value;
      hardwarePrice =
        hardwareColors.find((opt) => opt.title == selectedHardware)?.price || 0;
    }

    const selectedLiningRadio = document.querySelector(
      'input[name="properties[Lining]"]:checked'
    );
    if (selectedLiningRadio) {
      selectedLining = selectedLiningRadio.value;
      liningPrice =
        jacketLining.find((opt) => opt.title == selectedLining)?.price ||
        0;
    }

    const selectedQuiltedLiningRadio = document.querySelector(
      'input[name="properties[Quilted Lining]"]:checked'
    );
    if (selectedQuiltedLiningRadio) {
      selectedQuiltedLining = selectedQuiltedLiningRadio.value;
      quiltedPrice =
        quiltedOptions.find((opt) => opt.title == selectedQuiltedLining)
          ?.price || 0;
    }
    let html = "";
    switch (option) {
      case "hardwareColor":
        if (hardwareColors.length > 0) {
          html = `
        <h2 class="modal-right-header" style="margin-top:0 !important;">Hardware Color</h2>
        <div class="hardware-options">
          <p>Please choose hardware color</p>
          <div class="two-way-options">
            <p>2-way zippers have two pulls...</p>
            <div class="options-container">
              ${renderOptionsRadioGroup(
                "Hardware Color",
                hardwareColors,
                selectedHardware
              )}
            </div>
          </div>
        </div>
        `;
        }
        break;

      case "jacketLining":
        html = `
        <h2 class="modal-right-header">Lining</h2>
        <div class="hardware-options">
          <p>Please choose Lining</p>
            ${renderOptionsRadioGroup(
              "Lining",
              jacketLining,
              selectedLining
            )}
        </div>
      `;
        break;

      case "quiltedLining":
        html = `
        <h2 class="modal-right-header">Quilted Lining</h2>
        <p>Please choose Quilted Lining</p>
        <div class="options-container">
          ${renderOptionsRadioGroup(
            "Quilted Lining",
            quiltedOptions,
            selectedQuiltedLining
          )}
        </div>
      `;
        break;

      case "monogram":
        html = `
        <h2 class="modal-right-header">Monogram</h2>
        <label for="monogram_text1">Jacket Monogram<span>(+$10)</span>:</label>
        <input type="text" id="monogram_text1" name="properties[Monogram-line1]" maxlength="20" value="${monogramLine1}" data-price="${
          monogram[0]?.price / 100 || 0
        }"/>
      `;
        break;

      case "measurements":
        const productType = getProductType();
        let measurementFields = [];
        let measurementInstructions = "";

        switch (productType) {
          case "upperwear":
            measurementFields = [
              "weight",
              "height",
              "shoulder",
              "sleeves",
              "chest",
              "waist",
              "hip",
              "bicep",
              "cuff",
            ];
            measurementInstructions = `
        <li><strong>Weight:</strong> Measure in the morning before meals, wearing light clothes.</li>
        <li><strong>Height:</strong> Stand barefoot against a wall and measure from floor to top of head.</li>
        <li><strong>Shoulder:</strong> Across the back, shoulder bone to shoulder bone.</li>
        <li><strong>Sleeves:</strong> From shoulder tip to wrist, arm slightly bent.</li>
        <li><strong>Chest:</strong> Around the fullest chest part, under armpits.</li>
        <li><strong>Waist:</strong> Above belly button at natural waistline.</li>
        <li><strong>Hip:</strong> Around the fullest part of your butt/hips.</li>
        <li><strong>Bicep:</strong> Around thickest upper arm, unflexed.</li>
        <li><strong>Cuff:</strong> Around wrist bone; add 1–2cm for comfort.</li>
      `;
            break;

          case "pant":
            measurementFields = [
              "waist_circumference",
              "hip_width",
              "thigh_width",
              "knee_width",
              "leg_bottom",
              "front_rise",
              "back_rise",
              "length_waist_ankle",
            ];
            measurementInstructions = `
        <li><strong>Waist Circumference:</strong> Around natural waistline where pants will sit</li>
        <li><strong>Hip Width:</strong> Around fullest part of hips</li>
        <li><strong>Thigh Width:</strong> Around fullest part of thigh</li>
        <li><strong>Knee Width:</strong> Around knee at cap height</li>
        <li><strong>Leg Bottom:</strong> Around leg opening circumference</li>
        <li><strong>Front Rise:</strong> From crotch seam to top front waist</li>
        <li><strong>Back Rise:</strong> From crotch seam to top back waist</li>
        <li><strong>Length:</strong> From waist to ankle bone</li>
      `;
            break;

          case "skirt":
            measurementFields = [
              "waist_circumference",
              "hip_width",
              "bottom",
              "length",
            ];
            measurementInstructions = `
        <li><strong>Waist Circumference:</strong> Around natural waistline</li>
        <li><strong>Hip Width:</strong> Around fullest part of hips</li>
        <li><strong>Bottom:</strong> Around hem circumference</li>
        <li><strong>Length:</strong> From waist to desired hem length</li>
      `;
            break;
        }

        // Add the toggle HTML at the top
        const toggleHtml = `
          <div class="measurement-toggle">
            <span class="toggle-title">Units:</span>
            <label><input type="radio" name="measurement-system" value="metric" ${window.measurementSystem === 'metric' ? 'checked' : ''}/><span>Metric (kg, cm)</span></label>
            <label><input type="radio" name="measurement-system" value="imperial" ${window.measurementSystem === 'imperial' ? 'checked' : ''}/><span>Imperial (lbs, in)</span></label>
          </div>
        `;

        html = toggleHtml + `
        <h2 class="modal-right-header">Measurements (in ${window.measurementSystem === 'imperial' ? 'inches/lbs' : 'cm/kg'})</h2>
        <p>
          <a href="#inch-to-cm" class="scroll-link">Convert Inches to CM</a> |
          <a href="#how-to-measure" class="scroll-link">How to Measure</a>
        </p>
        <div class="measurements-form">
          ${measurementFields
            .map(
              (key) => {
                const keyLabel = key
                  .split("_")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ");
                const unit = (window.measurementSystem === 'imperial' ? measurementUnitsImperial[key] : measurementUnitsMetric[key]) || "";
                return `
            <div class="form-row">
              <label for="${key}">${keyLabel}:</label>
              <input
                type="text"
                id="${key}"
                inputmode="numeric"
                pattern="[0-9]*"
                maxlength="3"
                oninput="this.value=this.value.replace(/[^0-9.]/g,'')"
                value="${window.measurements?.[key] || ""}"
              /> <span class="measurement-unit" style="margin-left:4px;color:#888;font-size:0.95em;">${unit}</span>
            </div>
          `;
              }
            )
            .join("")}
        </div>
        <div>
              <div class="form-row" id="inch-to-cm">
                <h3>Convert Inches to CM</h3>
                <label for="inch_input">Inches:</label>
                <input
                  type="text"
                  id="inch_input"
                  inputmode="decimal"
                  pattern="[0-9.]*"
                  oninput="this.value=this.value.replace(/[^0-9.]/g,'');"
                  placeholder="e.g. 12.5"
                />
                <label for="cm_output">Centimeters:</label>
                <input
                  type="text"
                  id="cm_output"
                  readonly
                  placeholder="0.00"
                />
            </div>
          <div id="how-to-measure" style="margin-top: 30px;">
            <h3>How to Measure</h3>
            <ul>${measurementInstructions}</ul>
          </div>
        </div>
      `;
        break;
      case "comments":
        html = `
    <h2 class="modal-right-header">Additional Comments</h2>
    <label for="user_comments">Any special instructions:</label>
    <textarea 
      id="user_comments" 
      name="properties[Comments]" 
      rows="4" 
      style="width:100%; resize: none;"
      maxlength="500"
      
      placeholder="Enter any special instructions or comments here"
    >${userComments}</textarea>
    <p class="helper-text">Max 500 characters</p>
  `;
        break;
      default:
        html = "<h2>Welcome</h2><p>Select an option from the menu.</p>";
    }
    content.innerHTML = html;
    setupPriceUpdates();
    if (!customOrderPageButton) updateMenuPrices();
  };

  let priceUpdateListenerInitialized = false;

  function setupPriceUpdates() {
    if (priceUpdateListenerInitialized) return;
    priceUpdateListenerInitialized = true;
    const basePrice = getEffectiveBasePrice();

    document.addEventListener("change", function (e) {
      // Leather Color
      if (e.target && e.target.matches('[name="properties[Leather Color]"]')) {
        const selectedOption = e.target;
        selectedLeatherColor = selectedOption.defaultValue;
        priceAdjustments.leatherColor =
          parseInt(selectedOption.dataset.priceAdjustment) / 100 || 0;
      }
      // Hardware Color
      if (e.target && e.target.matches('[name="properties[Hardware Color]"]')) {
        const selectedOption = e.target;
        selectedHardware = selectedOption.defaultValue;
        priceAdjustments.hardware =
          parseFloat(selectedOption.dataset.price) || 0;
      }

      // Lining
      if (e.target && e.target.matches('[name="properties[Lining]"]')) {
        const selectedOption = e.target;
        selectedLining = selectedOption.defaultValue;
        priceAdjustments.jacketLining =
          parseFloat(selectedOption.dataset.price) || 0;
      }

      // Monogram
      if (e.target && e.target.matches('[name="properties[Monogram-line1]"]')) {
        const selectedOption = e.target;
        selectedMonogram = selectedOption.value;
        if (selectedMonogram == "") priceAdjustments.monogram = 0;
        else
          priceAdjustments.monogram =
            parseFloat(selectedOption.dataset.price) || 0;
      }

      // Quilted Lining
      if (e.target && e.target.matches('[name="properties[Quilted Lining]"]')) {
        const selectedOption = e.target;
        selectedQuiltedLining = selectedOption.defaultValue;
        priceAdjustments.lining = parseFloat(selectedOption.dataset.price) || 0;
      }

      // Calculate TOTAL adjustment (sum of all selected options)
      const totalAdjustment =
        priceAdjustments.hardware +
        priceAdjustments.jacketLining +
        priceAdjustments.monogram +
        priceAdjustments.lining +
        priceAdjustments.leatherColor;
      
      // basePrice is already the discounted price (80% of original)
      // So just add customization adjustments directly
      let newPrice = basePrice + totalAdjustment;
      newPrice = newPrice.toFixed(2);

      // Update displayed price
      const priceContainer =
        document.querySelector(".product__price .price") ||
        document.querySelector(".product-price") ||
        document.querySelector(".price");

      if (priceContainer) {
        const salePriceEl = priceContainer.querySelector('.price-item--sale');
        // Strikethrough price is inside <s> tag within price__sale div
        const regularPriceEl = priceContainer.querySelector('s.price-item--regular');
        
        // Use compareAtPrice from window.productData for strikethrough price
        const compareAtPrice = parseFloat(window.productData?.compareAtPrice) || 0;
        const newComparePrice = (compareAtPrice + totalAdjustment).toFixed(2);

        // Update sale price (always visible)
        if (salePriceEl) {
          salePriceEl.textContent = formatPrice(newPrice) + " USD";
        }
        
        // Update strikethrough price (compare-at price)
        if (regularPriceEl) {
          regularPriceEl.textContent = formatPrice(newComparePrice) + " USD";
        } else if (!salePriceEl) {
          // Fallback if no sale price element exists
          priceContainer.textContent = formatPrice(newPrice) + " USD";
        }
        
        // Trigger sticky bar update if function exists
        if (typeof window.updateStickyBarPrices === 'function') {
          window.updateStickyBarPrices();
        }
      }

      const modalPriceElement = document.querySelector(".modal-title");
      const hasMeasurements = window.measurements
        ? Object.values(window.measurements).some(
            (val) => val && val.trim() !== ""
          )
        : false;
      let customCount = 0;
      if (priceAdjustments.hardware > 0) customCount++;
      if (priceAdjustments.jacketLining > 0) customCount++;
      if (priceAdjustments.monogram > 0) customCount++;
      if (priceAdjustments.lining > 0) customCount++;

      document.querySelector(
        ".modal-left li:nth-child(4) .option-price"
      ).textContent =
        priceAdjustments.monogram > 0 ? `(+$${priceAdjustments.monogram})` : "";

      if (customCount > 0 && !window?.editedItemKey) {
        modalPriceElement.textContent = window.productData?.product.title;
        customModalBtn.setAttribute("custom-count", customCount);
      }
      if (!window?.editedItemKey)
        if (newPrice > (window.productData?.basePrice || 0))
          document
            .querySelector(".button-customize")
            .classList.add("show-badge");
        else {
          document
            .querySelector(".button-customize")
            .classList.remove("show-badge");
        }
      if (!customOrderPageButton) updateMenuPrices();
    });

    updateCustomizationModalTotal();
  }

  function formatPrice(amount) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(amount);
  }

  function getSwatchColor(colorName) {
    const colorMap = {
      silver: "#C0C0C0",
      brass: "#B5A642",
      gold: "#FFD700",
      black: "#333333",
      bronze: "#CD7F32",
    };
    const lowerColor = colorName?.toLowerCase() || "";
    for (const key in colorMap) {
      if (lowerColor.includes(key)) {
        return colorMap[key];
      }
    }
    return "#CCCCCC";
  }

  // Initialize price updates
  setupPriceUpdates();
  if (!customOrderPageButton) updateMenuPrices();

  document.addEventListener("input", function (e) {
    const basePrice = getEffectiveBasePrice();
    // if it's the monogram text box…
    if (e.target && e.target.id === "monogram_text1") {
      // price = has text? dataset.price : 0
      priceAdjustments.monogram = e.target.value.trim()
        ? parseFloat(e.target.dataset.price) || 0
        : 0;
      // update the cart price and the left-sidebar price tag
      const totalAdjustment =
        priceAdjustments.hardware +
        priceAdjustments.jacketLining +
        priceAdjustments.monogram +
        priceAdjustments.lining +
        priceAdjustments.leatherColor;
      
      // basePrice is already the discounted price (80% of original)
      // So just add customization adjustments directly
      let newPrice = basePrice + totalAdjustment;
      newPrice = newPrice.toFixed(2);
      formatAndSetPrice(newPrice);
      if (!customOrderPageButton) updateMenuPrices();
    }
    const measurementKeys = {
      upperwear: [
        "weight",
        "height",
        "shoulder",
        "sleeves",
        "chest",
        "waist",
        "hip",
        "bicep",
        "cuff",
      ],
      pant: [
        "waist_circumference",
        "hip_width",
        "thigh_width",
        "knee_width",
        "leg_bottom",
        "front_rise",
        "back_rise",
        "length_waist_ankle",
      ],
      skirt: ["waist_circumference", "hip_width", "bottom", "length"],
    }[getProductType()];

    if (measurementKeys.includes(e.target.id)) {
      if (!window.measurements) window.measurements = {};
      window.measurements[e.target.id] = e.target.value.trim();

      // Optional: Update price/menu if measurements affect pricing
      updateMenuPrices();
    }
  });

  // Add blur event for monogram input
  setTimeout(() => {
    const monogramInput = document.getElementById('monogram_text1');
    if (monogramInput) {
      monogramInput.addEventListener('blur', function() {
        updateMenuPrices();
      });
    }
  }, 0);

  function formatAndSetPrice(amount) {
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(amount);

    const priceContainer =
      document.querySelector(".product__price .price") ||
      document.querySelector(".product-price") ||
      document.querySelector(".price");

    if (priceContainer) {
        const salePriceEl = priceContainer.querySelector('.price-item--sale');
        // Strikethrough price is inside <s> tag
        const regularPriceEl = priceContainer.querySelector('s.price-item--regular'); 
        
        // Recalculate total adjustment
        const totalAdjustment =
        priceAdjustments.hardware +
        priceAdjustments.jacketLining +
        priceAdjustments.monogram +
        priceAdjustments.lining +
        priceAdjustments.leatherColor;

        // Use compareAtPrice from window.productData
        const compareAtPrice = parseFloat(window.productData?.compareAtPrice) || 0;
        const newComparePrice = (compareAtPrice + totalAdjustment).toFixed(2);

        // Update sale price
        if (salePriceEl) {
          salePriceEl.textContent = formatted + " USD";
        }
        
        // Update strikethrough price
        if (regularPriceEl) {
          regularPriceEl.textContent = formatPrice(newComparePrice) + " USD";
        } else if (!salePriceEl) {
          priceContainer.textContent = formatted + " USD";
        }
        
        // Trigger sticky bar update if function exists
        if (typeof window.updateStickyBarPrices === 'function') {
          window.updateStickyBarPrices();
        }
    }

    const modalTitle = document.querySelector(".modal-title");
    if (modalTitle && !window.oldBundleId) {
      modalTitle.textContent = window.productData.product.title;
    }
  }

  const addonMap = Object.fromEntries(
    window.customization_options.map((group) => [group.title, group.variants])
  );
  async function refreshCartSection() {
    const sectionId = "main-cart-items";
    const html = await fetch(`/cart?section_id=${sectionId}`).then((r) =>
      r.text()
    );
    const doc = new DOMParser().parseFromString(html, "text/html");
    const newSection = doc.querySelector(`[data-section-id="${sectionId}"]`);
    document
      .querySelector(`[data-section-id="${sectionId}"]`)
      .replaceWith(newSection);
  }
  function generateNewBundleId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  }

  // Add to cart from customization modal
  // Save customizations
  const addToCart = async () => {
    if (window.editedItemKey) {
      const saveButton = document.getElementById("saveCustomizations");
      const buttonText = saveButton.querySelector(".button__text");
      const spinner = saveButton.querySelector(".loading__spinner");

      try {
        // Show loading state
        saveButton.disabled = true;
        buttonText.classList.add("hidden");
        spinner.classList.remove("hidden");

        const oldBundleId = window.oldBundleId;
        const newBundleId = window.newBundleId;
        const itemsToAdd = [];

        const inp1 = document.getElementById("monogram_text1");
        const inp2 = document.getElementById("monogram_text2");

        const monogram1 = inp1 ? inp1.value.trim() : monogramLine1.trim();
        const monogram2 = inp2 ? inp2.value.trim() : monogramLine2.trim();
        const comments =
          document.getElementById("user_comments")?.value.trim() ||
          userComments.trim();

        const hardwarePrice =
          hardwareColors.find((opt) => opt.title === selectedHardware)?.price /
            100 || 0;

        const liningPrice =
          jacketLining.find((opt) => opt.title === selectedLining)
            ?.price / 100 || 0;
        const quiltedPrice =
          quiltedOptions.find((opt) => opt.title === selectedQuiltedLining)
            ?.price / 100 || 0;
        const monogramPrice = monogram1 ? monogram[0]?.price / 100 : 0;

        let monogramContent = "";
        if (monogram1.trim().length > 0) {
          monogramContent = monogram1.trim() + " (+$" + monogramPrice + ")";
        }
        let commentContent = "";
        if (comments.trim().length > 0) {
          commentContent = comments.trim();
        }

        // Get measurement values
        const measurementKeys = {
          upperwear: [
            "weight",
            "height",
            "shoulder",
            "sleeves",
            "chest",
            "waist",
            "hip",
            "bicep",
            "cuff",
          ],
          pant: [
            "waist_circumference",
            "hip_width",
            "thigh_width",
            "knee_width",
            "leg_bottom",
            "front_rise",
            "back_rise",
            "length_waist_ankle",
          ],
          skirt: ["waist_circumference", "hip_width", "bottom", "length"],
        }[getProductType()];
        const measurementProps = {};
        const hasMeasurements = window.measurements
          ? Object.values(window.measurements).some(
              (val) => val && val.trim() !== ""
            )
          : false;

        if (hasMeasurements) {
          measurementKeys.forEach((key) => {
            if (
              window.measurements[key] &&
              window.measurements[key].trim() !== ""
            ) {
              let val = window.measurements[key];
              let metricVal = val;
              let unit = '';
              // Determine if this is a weight or length field
              if (window.measurementSystem === 'imperial') {
                if (measurementUnitsImperial[key] === 'in') {
                  metricVal = inToCm(val);
                  unit = 'cm';
                } else if (measurementUnitsImperial[key] === 'lbs') {
                  metricVal = lbsToKg(val);
                  unit = 'kg';
                } else {
                  unit = measurementUnitsMetric[key] || '';
                }
              } else {
                metricVal = val;
                unit = measurementUnitsMetric[key] || '';
              }
              // Only store if value is valid
              if (metricVal && !isNaN(metricVal)) {
                measurementProps[
                  `${key.charAt(0).toUpperCase() + key.slice(1)}`
                ] = `${metricVal}${unit} (Custom)`;
              }
            }
          });
        }
        // Main product item with all properties
        itemsToAdd.push({
          id: window.productData.variantId,
          quantity: window.productData.quantity,
          properties: {
            bundle_id: newBundleId,
            "Hardware Color": selectedHardware
              ? `${selectedHardware} ${
                  hardwarePrice > 0 ? `(+$${hardwarePrice})` : ""
                }`
              : "",
            "Lining": selectedLining
              ? `${selectedLining} ${
                  liningPrice > 0 ? `(+$${liningPrice})` : ""
                }`
              : "",
            "Quilted Lining": selectedQuiltedLining
              ? `${selectedQuiltedLining} ${
                  quiltedPrice > 0 ? `(+$${quiltedPrice})` : ""
                }`
              : "",
            "Monogram Line 1": monogramContent,
            "Monogram Line 2": monogram2.trim()
              ? monogram2.trim() + " (+$" + monogramPrice + ")"
              : "",
            ...measurementProps, // Include measurement properties
            Comments: comments,
            "Measurement System": window.measurementSystem === 'imperial' ? 'Imperial (lbs/in)' : 'Metric (kg/cm)',
          },
        });

        // Rest of your existing code for add-ons...
        const hw = addonMap["Hardware Color"].find(
          (v) => v.title === selectedHardware
        );
        if (hw) {
          itemsToAdd.push({
            id: hw.id,
            quantity: 1,
            properties: { bundle_id: newBundleId },
          });
        }

        if (selectedLining !== "Default") {
          const ql = addonMap["Lining"].find(
            (v) => v.title === selectedLining
          );
          if (ql) {
            itemsToAdd.push({
              id: ql.id,
              quantity: 1,
              properties: { bundle_id: newBundleId },
            });
          }
        }

        if (selectedQuiltedLining !== "No") {
          const ql = addonMap["Quilted Lining"].find(
            (v) => v.title === selectedQuiltedLining
          );
          if (ql) {
            itemsToAdd.push({
              id: ql.id,
              quantity: 1,
              properties: { bundle_id: newBundleId },
            });
          }
        }

        if (monogram1.trim().length > 0) {
          const mono = addonMap["Monogram"][0];
          itemsToAdd.push({
            id: mono.id,
            quantity: 1,
            properties: {
              bundle_id: newBundleId,
              "Monogram Line 1": monogramContent,
              "Monogram Line 2":
                monogram2.length > 0 ? monogram2.trim() : monogramLine2.trim(),
            },
          });
        }

        await replaceBundle(oldBundleId, newBundleId, itemsToAdd);
        showCartSnackbar("Your customizations have been updated!");
      } catch (error) {
        console.error("Error:", error);
        showCartSnackbar(error.message);
      } finally {
        saveButton.disabled = false;
        buttonText.classList.remove("hidden");
        spinner.classList.add("hidden");
        window.scrollTo(0, 0);
        window.location.href = "/cart";
      }
    } else {
      const customizations = {};
      const quantity =
        parseInt(document.querySelector('input[name="quantity"]')?.value) || 1;
      const inp1 = document.getElementById("monogram_text1");
      const inp2 = document.getElementById("monogram_text2");
      if (inp1) monogramLine1 = inp1.value;
      if (inp2) monogramLine2 = inp2.value;

      const savedMonogram = {
        monogramline1: monogramLine1.trim(),
        monogramline2: monogramLine2.trim(),
      };
      const savedComments =
        document.getElementById("user_comments")?.value.trim() || "";

      // Get all customization values
      document
        .querySelectorAll('#customizationContent [name^="properties["]')
        .forEach((input) => {
          const key = input.name.replace("properties[", "").replace("]", "");
          if (input.type === "checkbox") {
            if (input.checked) customizations[key] = input.defaultValue;
            else customizations["Hardware Color"] = "Antique Silver";
          } else if (input.defaultValue && input.defaultValue.trim() !== "") {
            customizations[key] = input.defaultValue;
          } else if (input.defaultValue && input.defaultValue.trim() === "") {
            customizations["Hardware Color"] = "Antique Silver";
          }
        });

      const items = [];

      const sizeSelect = document.getElementById("size_select");
      const productVariantId = sizeSelect
        ? sizeSelect.value
        : document.querySelector('form[action^="/cart"] input[name="id"]')
            ?.value || window.productData.variantId;

      const selectedHardwareColor = hardwareColors.find(
        (opt) => opt.title == selectedHardware
      ) || { title: selectedHardware, price: 0, id: null };
      const selectedLiningOption = jacketLining.find(
        (opt) => opt.title == selectedLining
      ) || { title: selectedLining, price: 0, id: null };
      const selectedQuiltedLiningOption = quiltedOptions.find(
        (opt) => opt.title == selectedQuiltedLining
      ) || { title: selectedQuiltedLining, price: 0, id: null };
      const selectedLeatherOption = leatherOptions.find(
        (opt) => opt.title == selectedLeatherColor
      ) || { title: selectedLeatherColor, price: 0, id: null };

      window.productVariantId = productVariantId;
      window.selectedHardwareColor = selectedHardwareColor;
      if (selectedLiningOption.price > 0) {
        window.selectLiningOption = selectedLiningOption;
      }
      if (selectedQuiltedLiningOption.price > 0)
        window.selectedQuiltedLiningOption = selectedQuiltedLiningOption;
      if (monogramLine1 != "") window.monogramLine1 = monogramLine1;

      if (monogramLine2 != "") window.monogramLine2 = monogramLine2;

      const _bundleId = generateNewBundleId();

      const measurementKeys = {
        upperwear: [
          "weight",
          "height",
          "shoulder",
          "sleeves",
          "chest",
          "waist",
          "hip",
          "bicep",
          "cuff",
        ],
        pant: [
          "waist_circumference",
          "hip_width",
          "thigh_width",
          "knee_width",
          "leg_bottom",
          "front_rise",
          "back_rise",
          "length_waist_ankle",
        ],
        skirt: ["waist_circumference", "hip_width", "bottom", "length"],
      }[getProductType()];
      const measurementProps = {};
      const hasMeasurements = window.measurements
        ? Object.values(window.measurements).some(
            (val) => val && val.trim() !== ""
          )
        : false;

      if (hasMeasurements) {
        measurementKeys.forEach((key) => {
          if (
            window.measurements[key] &&
            window.measurements[key].trim() !== ""
          ) {
            let val = window.measurements[key];
            let metricVal = val;
            let unit = '';
            // Determine if this is a weight or length field
            if (window.measurementSystem === 'imperial') {
              if (measurementUnitsImperial[key] === 'in') {
                metricVal = inToCm(val);
                unit = 'cm';
              } else if (measurementUnitsImperial[key] === 'lbs') {
                metricVal = lbsToKg(val);
                unit = 'kg';
              } else {
                unit = measurementUnitsMetric[key] || '';
              }
            } else {
              metricVal = val;
              unit = measurementUnitsMetric[key] || '';
            }
            // Only store if value is valid
            if (metricVal && !isNaN(metricVal)) {
              measurementProps[
                `${key.charAt(0).toUpperCase() + key.slice(1)}`
              ] = `${metricVal}${unit} (Custom)`;
            }
          }
        });
      }
      
      // Check if this is a simple product that doesn't need customization
      const isSimpleProduct = window.productData.product.tags.some(tag => 
        tag.includes("pillow cover") || tag.includes("leather skin hide")
      );
      
      if (isSimpleProduct) {
        items.push({
          id: productVariantId,
          quantity: quantity,
          // Comments: savedComments,
        });
      } else {
          items.push({
            id: productVariantId,
            quantity: quantity,
            properties: {
              "Hardware Color":
                selectedHardwareColor.title +
                (selectedHardwareColor.price > 0
                  ? " (+$" + selectedHardwareColor.price / 100 + ")"
                  : ""),
              "Lining":
                selectedLiningOption.title +
                (selectedLiningOption.price > 0
                  ? " (+$" + selectedLiningOption.price / 100 + ")"
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
              "Leather Color":
                selectedLeatherColor +
                (priceAdjustments.leatherColor > 0
                  ? "(+$" + priceAdjustments.leatherColor + ")"
                  : ""),
              bundle_id: _bundleId,
              ...measurementProps,
              Comments: savedComments,
              "Measurement System": window.measurementSystem === 'imperial' ? 'Imperial (lbs/in)' : 'Metric (kg/cm)',
            },
          });

          if (selectedHardwareColor.id) {
            items.push({
              id: selectedHardwareColor.id,
              quantity: 1,
              properties: {
                bundle_id: _bundleId,
              },
            });
          }
          if (selectedLeatherOption && selectedLeatherOption.id)
            items.push({
              id: selectedLeatherOption.id,
              quantity: 1,
              properties: {
                Color: selectedLeatherColor,
                bundle_id: _bundleId,
              },
            });
          if (selectedLining !== "Default" && selectedLiningOption.id)
            items.push({
              id: selectedLiningOption.id,
              quantity: 1,
              properties: {
                bundle_id: _bundleId,
              },
            });
          if (selectedQuiltedLining !== "No" && selectedQuiltedLiningOption.id)
            items.push({
              id: selectedQuiltedLiningOption.id,
              quantity: 1,
              properties: {
                bundle_id: _bundleId,
              },
            });
          if (monogramLine1.trim().length > 0 && monogram && monogram[0] && monogram[0].id)
            items.push({
              id: monogram[0].id,
              quantity: 1,
              properties: {
                "Monogram Line 1": savedMonogram.monogramline1,
                "Monogram Line 2": savedMonogram.monogramline2,
                bundle_id: _bundleId,
              },
            });
        }

      // Get the add to cart button and show loading state
      const addToCartButton = document.querySelector('#addToCartButton, .add-to-cart-button, [data-action="add-to-cart"]');
      
      if (addToCartButton && window.CartLoadingUtils) {
        window.CartLoadingUtils.showLoading(addToCartButton, 'Adding to cart...');
      } else if (addToCartButton) {
        // Fallback for when utility is not loaded
        const buttonText = addToCartButton.querySelector('.button__text, span');
        const loadingSpinner = addToCartButton.querySelector('.loading__spinner');
        
        addToCartButton.disabled = true;
        addToCartButton.setAttribute('aria-disabled', 'true');
        addToCartButton.classList.add('loading');
        if (buttonText) buttonText.classList.add('hidden');
        if (loadingSpinner) loadingSpinner.classList.remove('hidden');
      }

      fetch("/cart/add.js", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items }),
      })
        .then(async (response) => {
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData?.description || `Request failed with ${response.status}`
            );
          }
          return response.json();
        })
        .then((data) => {
          showCartSnackbar("Product added to cart!!");
        })
        .catch((error) => {
          console.error("Add to cart failed:", error);
          showCartSnackbar(`${error.message}`);
        })
        .finally(() => {
          // Hide loading state
          if (addToCartButton && window.CartLoadingUtils) {
            window.CartLoadingUtils.hideLoading(addToCartButton);
          } else if (addToCartButton) {
            // Fallback for when utility is not loaded
            const buttonText = addToCartButton.querySelector('.button__text, span');
            const loadingSpinner = addToCartButton.querySelector('.loading__spinner');
            
            addToCartButton.disabled = false;
            addToCartButton.removeAttribute('aria-disabled');
            addToCartButton.classList.remove('loading');
            if (buttonText) buttonText.classList.remove('hidden');
            if (loadingSpinner) loadingSpinner.classList.add('hidden');
          }
        });
      if (navigator.vibrate) {
        navigator.vibrate(150);
      }
    }
    closeModal();
  };

  saveButton?.addEventListener("click", function (e) {
    e.preventDefault();
    addToCart();
  });
  pageSaveButton?.addEventListener("click", function (e) {
    e.preventDefault();
    addToCart();
  });

  customOrderPageButton?.addEventListener("click", function (e) {
    e.preventDefault();
    addToCart();
  });

  document.querySelectorAll(".edit-customization").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();

      // Reset all modal state
      selectedHardware = "Antique Silver";
      selectedQuiltedLining = "No";
      monogramLine1 = "";
      monogramLine2 = "";
      hardwarePrice = 0;
      liningPrice = 0;
      quiltedPrice = 0;
      window.measurements = {};
      userComments = "";
      priceAdjustments.hardware = 0;
      priceAdjustments.monogram = 0;
      priceAdjustments.lining = 0;
      priceAdjustments.jacketLining = 0;
      priceAdjustments.leatherColor = 0;
      content.innerHTML = "";

      const modalTitle = document.querySelector(".modal-title");
      if (modalTitle) modalTitle.textContent = e.currentTarget.dataset.title;

      const buttonText = saveButton.querySelector(".button__text");
      buttonText.textContent = "Update Cart";

      // Get saved props with fallbacks
      const oldBundleId = e.currentTarget.dataset.bundleId || "";
      const newBundleId = generateNewBundleId();
      window.oldBundleId = oldBundleId;
      window.newBundleId = newBundleId;
      window.editedItemKey = e.currentTarget.dataset.itemKey || "";

      // Parse values with proper fallbacks
      const hw = (e.currentTarget.dataset.hardware || "Antique Silver").split(
        " (+"
      )[0];
      const jl = (e.currentTarget.dataset.lining || "").split(" (+")[0];
      const ql = (e.currentTarget.dataset.quilt || "No").split(" (+")[0];
      const m1 = (e.currentTarget.dataset.mono1 || "").split(" (+")[0];
      const m2 = (e.currentTarget.dataset.mono2 || "").split(" (+")[0];
      const co = e.currentTarget.dataset.comments || "";

      // Update state
      selectedHardware = hw.trim();
      selectedLining = jl.trim();
      selectedQuiltedLining = ql.trim();
      monogramLine1 = m1.trim();
      monogramLine2 = m2.trim();
      userComments = co.trim();

      function getProductTypeFromTags(tags) {
        if (tags.some((tag) => tag.match(/upperwear|jacket|coat|blazer|vest/i)))
          return "upperwear";
        if (tags.some((tag) => tag.match(/skirt/i))) return "skirt";
        if (tags.some((tag) => tag.match(/pant|trouser/i))) return "pant";
        return "upperwear"; // default
      }

      const productType =
        e.currentTarget.dataset.productType ||
        getProductTypeFromTags(
          JSON.parse(e.currentTarget.dataset.tags || "[]")
        );
      window.measurements = {};

      const getMeasurementValue = (key) => {
        return e.currentTarget.dataset[key]
          ? e.currentTarget.dataset[key].replace("cm (Custom)", "").trim()
          : "";
      };

      // Initialize measurements
      if (productType === "upperwear") {
        window.measurements = {
          weight: getMeasurementValue("weight"),
          height: getMeasurementValue("height"),
          shoulder: getMeasurementValue("shoulder"),
          sleeves: getMeasurementValue("sleeves"),
          chest: getMeasurementValue("chest"),
          waist: getMeasurementValue("waist"),
          hip: getMeasurementValue("hip"),
          bicep: getMeasurementValue("bicep"),
          cuff: getMeasurementValue("cuff"),
        };
      }
      // Pant measurements
      else if (productType === "pant") {
        window.measurements = {
          waist_circumference: getMeasurementValue("waist_circumference"),
          hip_width: getMeasurementValue("hip_width"),
          thigh_width: getMeasurementValue("thigh_width"),
          knee_width: getMeasurementValue("knee_width"),
          leg_bottom: getMeasurementValue("leg_bottom"),
          front_rise: getMeasurementValue("front_rise"),
          back_rise: getMeasurementValue("back_rise"),
          length_waist_ankle: getMeasurementValue("length_waist_ankle"),
        };
      }
      // Skirt measurements
      else if (productType === "skirt") {
        window.measurements = {
          waist_circumference: getMeasurementValue("waist_circumference"),
          hip_width: getMeasurementValue("hip_width"),
          bottom: getMeasurementValue("bottom"),
          length: getMeasurementValue("length"),
        };
      }

      // Update price adjustments
      priceAdjustments.hardware =
        hardwareColors.find((o) => o.title === selectedHardware)?.price / 100 ||
        0;
      priceAdjustments.jacketLining =
        jacketLining.find((o) => o.title === selectedLining)?.price /
          100 || 0;
      priceAdjustments.lining =
        quiltedOptions.find((o) => o.title === selectedQuiltedLining)?.price /
          100 || 0;
      priceAdjustments.leatherColor = 0;
      priceAdjustments.monogram = m1 ? monogram[0].price / 100 : 0;

      // Load fresh content
      window.loadOption("hardwareColor");
      if (!customOrderPageButton) updateMenuPrices();

      // Update product data
      window.productData = {
        ...(window.productData || {}),
        title: e.currentTarget.dataset.title || "",
        variantId: e.currentTarget.dataset.variantId || 0,
        quantity: e.currentTarget.dataset.quantity || 0,
        tags: JSON.parse(e.currentTarget.dataset.tags) || [],
        basePrice: e.currentTarget.dataset.basePrice || 0,
      };

      // Open modal
      modal.style.display = "flex";
      document.body.classList.add("no-scroll");
    });
  });

  async function removeItemsWithRetry(itemKeys, maxRetries = 5, delay = 500) {
    let retryCount = 0;
    let remainingItems = [...itemKeys];

    while (retryCount < maxRetries && remainingItems.length > 0) {
      try {
        // Construct updates object for all keys
        const updates = {};
        remainingItems.forEach((key) => {
          updates[key] = 0;
        });

        // Single bulk update request
        await fetch("/cart/update.js", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ updates }),
        });

        // Verify removal
        const cart = await fetch("/cart.js").then((r) => r.json());
        remainingItems = remainingItems.filter((key) =>
          cart.items.some((item) => item.key === key)
        );

        if (remainingItems.length > 0) {
          retryCount++;
          console.warn(
            `Retry ${retryCount}/${maxRetries} - Remaining items:`,
            remainingItems
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      } catch (error) {
        console.error(`Retry ${retryCount} failed:`, error);
        retryCount++;
      }
    }

    if (remainingItems.length > 0) {
      throw new Error(
        `Failed to remove items after ${maxRetries} attempts: ${remainingItems.join(
          ", "
        )}`
      );
    }

    return true;
  }

  async function replaceBundle(oldBundleId, newBundleId, itemsToAdd) {
    try {
      // 1. Get current cart state
      const cart = await fetch("/cart.js").then((r) => r.json());
      // 2. Identify all bundle components
      const bundleItems = cart.items.filter(
        (item) =>
          item.properties?.bundle_id === oldBundleId ||
          item.bundle_id === oldBundleId
      );

      // 3. Remove old items with retries
      await removeItemsWithRetry(
        bundleItems.map((item) => item.key),
        5, // Max 5 retries
        300 // 300ms delay between retries
      );
      // 4. Add new items
      const addResponse = await fetch("/cart/add.js", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: itemsToAdd.map((item) => ({
            ...item,
            properties: {
              ...item.properties,
              bundle_id: newBundleId,
            },
          })),
        }),
      });

      if (!addResponse.ok) throw new Error("Failed to add new items");

      // 5. Final verification
      await refreshCartSection();
      return true;
    } catch (error) {
      console.error("Bundle replacement failed:", error);
      alert("Error updating bundle. Please refresh the page.");
      return false;
    }
  }

  document.addEventListener("click", function (e) {
    if (e.target.classList.contains("scroll-link")) {
      e.preventDefault();
      const targetId = e.target.getAttribute("href").slice(1);
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: "smooth" });
      }
    }
  });

  document.querySelectorAll(".color-swatch__input").forEach((input) => {
    if (input.value === "Default") {
      const swatchDiv = input.closest(".color-swatch");

      const img = swatchDiv.querySelector("img.color-swatch__image");
      const img1 = document.querySelector(".color-swatch__selected");

      if (img) {
        img.src = window.productData.product.images[0]; // your new image URL
      }
      if (img1) {
        img1.src = window.productData.product.images[0]; // your new image URL
      }
    }
  });

  // Add this after menuItems is defined
  menuItems.forEach((item) => {
    item.addEventListener('click', function() {
      menuItems.forEach((el) => el.classList.remove('active'));
      this.classList.add('active');
    });
  });
  // Highlight the first menu item by default on modal open
  if (menuItems.length > 0) menuItems[0].classList.add('active');

  // --- Add this function to update the modal total ---
  function updateCustomizationModalTotal() {
    const basePrice = parseFloat(window.productData?.basePrice) || 0;
    const compareAtPrice = parseFloat(window.productData?.compareAtPrice) || 0;
    
    const totalAdjustment =
      priceAdjustments.hardware +
      priceAdjustments.jacketLining +
      priceAdjustments.monogram +
      priceAdjustments.lining +
      priceAdjustments.leatherColor;
    
    // Calculate new prices
    // basePrice is already discounted (80% of original)
    const newSalePrice = basePrice + totalAdjustment;
    const newComparePrice = compareAtPrice + totalAdjustment;
    
    let formattedTotal = "";
    
    // Show strikethrough if there's a discount
    if (compareAtPrice > basePrice) {
      formattedTotal = `<s class="modal-total-compare-price" style="color: rgba(var(--color-foreground), 0.75); margin-right: 5px;">${formatPrice(newComparePrice)} USD</s> <span class="modal-total-regular-price">${formatPrice(newSalePrice)} USD</span>`;
    } else {
      formattedTotal = `<span class="modal-total-regular-price">${formatPrice(newSalePrice)} USD</span>`;
    }

    const totalEl = document.getElementById("customization-modal-total");
    if (totalEl) totalEl.innerHTML = `Total: ${formattedTotal}`;
  }

  // --- Call this function after every price-affecting change ---
  // After updateMenuPrices()
  const origUpdateMenuPrices = updateMenuPrices;
  updateMenuPrices = function() {
    origUpdateMenuPrices.apply(this, arguments);
    updateCustomizationModalTotal();
  };

  // After setupPriceUpdates()
  const origSetupPriceUpdates = setupPriceUpdates;
  setupPriceUpdates = function() {
    origSetupPriceUpdates.apply(this, arguments);
    updateCustomizationModalTotal();
  };

  // Add this mapping for measurement units (both systems)
  const measurementUnitsMetric = {
    weight: "kg",
    height: "cm",
    shoulder: "cm",
    sleeves: "cm",
    chest: "cm",
    waist: "cm",
    hip: "cm",
    bicep: "cm",
    cuff: "cm",
    waist_circumference: "cm",
    hip_width: "cm",
    thigh_width: "cm",
    knee_width: "cm",
    leg_bottom: "cm",
    front_rise: "cm",
    back_rise: "cm",
    length_waist_ankle: "cm",
    bottom: "cm",
    length: "cm"
  };
  const measurementUnitsImperial = {
    weight: "lbs",
    height: "in",
    shoulder: "in",
    sleeves: "in",
    chest: "in",
    waist: "in",
    hip: "in",
    bicep: "in",
    cuff: "in",
    waist_circumference: "in",
    hip_width: "in",
    thigh_width: "in",
    knee_width: "in",
    leg_bottom: "in",
    front_rise: "in",
    back_rise: "in",
    length_waist_ankle: "in",
    bottom: "in",
    length: "in"
  };

  // Store the current system
  window.measurementSystem = window.measurementSystem || 'metric';

  // Conversion helpers
  function cmToIn(cm) { return (parseFloat(cm) / 2.54).toFixed(2); }
  function inToCm(inches) { return (parseFloat(inches) * 2.54).toFixed(2); }
  function kgToLbs(kg) { return (parseFloat(kg) * 2.20462).toFixed(2); }
  function lbsToKg(lbs) { return (parseFloat(lbs) / 2.20462).toFixed(2); }

  // Function to update unit labels next to inputs
  function updateMeasurementInputsAndLabels() {
    const keys = Object.keys(measurementUnitsMetric);
    keys.forEach(key => {
      const input = document.getElementById(key);
      if (input) {
        // Update unit label
        const unitSpan = document.querySelector(`#${key} ~ .measurement-unit`);
        if (unitSpan) {
          unitSpan.textContent = (window.measurementSystem === 'imperial' ? measurementUnitsImperial[key] : measurementUnitsMetric[key]) || '';
        }
      }
    });
  }

  // Patch loadOption for measurements to update unit labels after rendering
  const origLoadOption = window.loadOption;
  window.loadOption = function(option, collectMode = false) {
    let html = origLoadOption.call(this, option, collectMode);
    if (option === 'measurements' && !collectMode) {
      // Add toggle UI
      const toggleHtml = `
        <div class="measurement-toggle">
          <span class="toggle-title">Units:</span>
          <label><input type="radio" name="measurement-system" value="metric" ${window.measurementSystem === 'metric' ? 'checked' : ''}/><span>Metric (kg, cm)</span></label>
          <label><input type="radio" name="measurement-system" value="imperial" ${window.measurementSystem === 'imperial' ? 'checked' : ''}/><span>Imperial (lbs, in)</span></label>
        </div>
      `;
      html = toggleHtml + html;
      // After rendering, update unit labels
      setTimeout(updateMeasurementInputsAndLabels, 0);
    }
    return html;
  };

  // Listen for toggle changes (event delegation)
  document.body.addEventListener('change', function(e) {
    if (e.target.name === 'measurement-system') {
      const newSystem = e.target.value;
      if (window.measurementSystem !== newSystem) {
        // Convert all values
        const keys = Object.keys(measurementUnitsMetric);
        keys.forEach(key => {
          const input = document.getElementById(key);
          if (input && input.value) {
            if (newSystem === 'imperial' && window.measurementSystem === 'metric') {
              // Convert metric to imperial
              if (measurementUnitsMetric[key] === 'cm') input.value = cmToIn(input.value);
              if (measurementUnitsMetric[key] === 'kg') input.value = kgToLbs(input.value);
            } else if (newSystem === 'metric' && window.measurementSystem === 'imperial') {
              // Convert imperial to metric
              if (measurementUnitsImperial[key] === 'in') input.value = inToCm(input.value);
              if (measurementUnitsImperial[key] === 'lbs') input.value = lbsToKg(input.value);
            }
          }
        });
        window.measurementSystem = newSystem;
        // Update unit labels after conversion
        updateMeasurementInputsAndLabels();
      }
    }
  });  
  // Auto-load first option if on custom order page
  if (isCustomOrderPage) {
    window.loadOption("hardwareColor");
    // Also highlight the first menu item
    const hardwareMenu = document.querySelector('.modal-menu-item[data-option="hardwareColor"]');
    if (hardwareMenu) hardwareMenu.classList.add('active');
  }
});

