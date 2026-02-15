document.getElementById("bookingForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const vehicleType = document.getElementById("vehicleType").value;
  const vehicleModel = document.getElementById("vehicleModel").value.trim();
  const date = document.getElementById("date").value;
  const time = document.getElementById("time").value;
  const service = document.querySelector("input[name='service']:checked")?.value || "(no service)";

  // Set your admin WhatsApp number here (international format). The script
  // will strip spaces and non-digits automatically. Example Kenya: '2547XXXXXXXX'
  let adminNumber = "254768 102 133";

  // Remove any non-digit characters (spaces, +, dashes)
  adminNumber = adminNumber.replace(/\D/g, "");

  if (!adminNumber || !/^\d{8,15}$/.test(adminNumber)) {
    alert("Please set a valid admin WhatsApp number in booking.js (digits only, e.g. 2547XXXXXXXX).");
    return;
  }

  const message = `New booking:%0aName: ${name || '(no name)'}%0aPhone: ${phone}%0aVehicle Type: ${vehicleType || '(not specified)'}%0aVehicle Model: ${vehicleModel || '(not specified)'}%0aService: ${service}%0aDate: ${date || '(none)'} ${time || ''}`;
  const waUrl = `https://wa.me/${adminNumber}?text=${message}`;

  // Open WhatsApp (Web or mobile) with prefilled message so client sends it to you.
  window.open(waUrl, "_blank");
  alert("WhatsApp opened — please send the message to complete the booking.");
});
