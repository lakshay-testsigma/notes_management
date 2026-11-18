import { shareOrCopy } from "./share";

const button = document.querySelector<HTMLButtonElement>("#share-button")!;
const status = document.querySelector<HTMLElement>("#share-status")!;
const linkBox = document.querySelector<HTMLElement>("#share-link-box")!;
const linkInput = document.querySelector<HTMLInputElement>("#share-link")!;

// A real <button> is keyboard-usable (Tab, Enter, Space) with no extra code.
button.addEventListener("click", async () => {
  const data = { title: document.title, url: window.location.href };
  const result = await shareOrCopy(navigator, data);

  status.textContent = result.message; // role="status" announces it to screen readers
  linkBox.hidden = result.outcome !== "link";
  if (result.outcome === "link") {
    linkInput.value = data.url;
    linkInput.select(); // preselected, so Ctrl+C or Cmd+C works at once
  }
});
