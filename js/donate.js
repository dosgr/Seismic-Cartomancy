import {currentLanguage} from "./strings.js?v=2.0.0";
(() => {
  const area = document.getElementById("support-area");
  const config = window.SEISMO_DONATE_CONFIG ?? { professional: true };
  const support = document.getElementById("support-card");
  const professional = document.getElementById("professional-card");
  const disclosure = document.getElementById("support-disclosure");
  const panel = document.getElementById("support-panel");
  const controls = [document.getElementById("support-donate"), document.getElementById("support-toggle")];
  const status = document.getElementById("support-copy-status");
  const address = document.getElementById("support-address");
  const hosts = { revolut: "revolut.me", paypal: "paypal.me", facebook: "www.facebook.com" };
  const localAsset = path => new URL(path, new URL("../",import.meta.url)).href;
  let count = 0;
  professional.hidden = config.professional !== true;
  for (const method of area.querySelectorAll("[data-method]")) {
    const key = method.dataset.method;
    const option = config[key];
    if (config.support !== true || option?.enabled !== true ||
        !/^assets\/support\/qr\/[\w-]+\.png$/.test(option.qr ?? "")) continue;
    if (key === "bitcoin") {
      if (!/^bc1[a-z0-9]{11,87}$/.test(option.address ?? "")) continue;
      address.textContent = option.address;
    } else {
      let url;
      try { url = new URL(option.url); } catch { continue; }
      if (url.protocol !== "https:" || url.host !== hosts[key] || url.username || url.password) continue;
      method.querySelector("a").href = url.href;
    }
    const logo = method.querySelector("[data-logo]");
    logo.src = localAsset(`assets/support/logos/${logo.dataset.logo}`);
    method.querySelector(".support-qr").src = localAsset(option.qr);
    method.hidden = false;
    count++;
  }
  area.querySelector(".support-methods").dataset.count = count;
  support.hidden = disclosure.hidden = count === 0;
  area.hidden = support.hidden && professional.hidden;

  function toggle(event) {
    const open = event.currentTarget.getAttribute("aria-expanded") === "false";
    if (!open && panel.contains(document.activeElement)) event.currentTarget.focus();
    for (const control of controls) control.setAttribute("aria-expanded", String(open));
    panel.inert = !open;
    panel.classList.toggle("is-open", open);
  }
  for (const control of controls) control.addEventListener("click", toggle);
  document.getElementById("support-copy").addEventListener("click", async () => {
    let message;
    try {
      await navigator.clipboard.writeText(address.textContent);
      message = "Η διεύθυνση αντιγράφηκε.";
    } catch {
      message = "Δεν έγινε αντιγραφή. Επιλέξτε και αντιγράψτε τη διεύθυνση χειροκίνητα.";
    }
    status.dataset.el = message;
    status.dataset.en = message === "Η διεύθυνση αντιγράφηκε." ? "Address copied." : "Copy failed. Select and copy the address manually.";
    status.textContent = status.dataset[currentLanguage()];
  });
})();
