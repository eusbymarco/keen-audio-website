function readCookie(name) {
  return document.cookie.split("; ").find((item) => item.startsWith(`${name}=`))?.split("=")[1];
}

document.querySelector("#login-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const message = document.querySelector("#form-message");
  const button = form.querySelector("button");
  message.textContent = "";
  button.disabled = true;

  try {
    const response = await fetch("/admin/login", { method: "POST", headers: { "Content-Type": "application/json", "X-CSRF-Token": decodeURIComponent(readCookie("keen_admin_csrf") || "") }, body: JSON.stringify(Object.fromEntries(new FormData(form))), credentials: "same-origin" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Unable to sign in.");
    window.location.assign(data.redirect);
  } catch (error) {
    message.textContent = error.message;
    button.disabled = false;
  }
});