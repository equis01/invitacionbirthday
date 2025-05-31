// scripts/index.js

// Reproductor de audio
function PlayAudio() {
  const audio = document.getElementById("audioInstrumental");
  if (audio) audio.play().catch(() => {}); // evitar error si autoplay bloqueado
}

// Función para generar un token aleatorio simple
function generateUserToken(length = 20) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

// Función para obtener IP pública o token fallback
async function getPublicIP() {
  const ipField = document.getElementById("ipAddress");
  const storedTokenKey = "ximena_xv_token";

  async function fetchIP(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    if (!data.ip) throw new Error("No IP in response");
    return data.ip;
  }

  try {
    // Primer intento: api.ipify.org
    const ip = await fetchIP("https://api.ipify.org?format=json");
    ipField.value = ip;
    console.log("IP Pública detectada (api.ipify.org):", ip);
  } catch (err1) {
    console.warn("Fallo api.ipify.org:", err1);
    try {
      // Segundo intento: api64.ipify.org
      const ip = await fetchIP("https://api64.ipify.org?format=json");
      ipField.value = ip;
      console.log("IP Pública detectada (api64.ipify.org):", ip);
    } catch (err2) {
      console.warn("Fallo api64.ipify.org:", err2);
      // Fallback: token único
      let token = localStorage.getItem(storedTokenKey);
      if (!token) {
        token = generateUserToken();
        localStorage.setItem(storedTokenKey, token);
      }
      ipField.value = token;
      console.log("Token asignado en lugar de IP:", token);
    }
  }
}

// Función para abrir el modal de confirmación con Bootstrap 5
function openModal() {
  getPublicIP();
  const modalElement = document.getElementById("modal");
  if (modalElement) {
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
  }
}

// Función para cerrar el modal de confirmación
function closeModal() {
  const modalElement = document.getElementById("modal");
  if (modalElement) {
    const modal = bootstrap.Modal.getInstance(modalElement);
    if (modal) modal.hide();
  }
}

// Función para mostrar modal de error o éxito
function showErrorModal(message) {
  const errorModalElement = document.getElementById("errorAlertModal");
  if (!errorModalElement) return;

  document.getElementById("errorModalMessage").textContent = message;
  const errorModal = new bootstrap.Modal(errorModalElement);
  errorModal.show();
}

// Alerta personalizada de Bella enojada (modal custom)
function showAngryBelleAlert() {
  const alertDiv = document.createElement("div");
  alertDiv.className = "belle-alert";
  alertDiv.innerHTML = `
    <img src="https://raw.githubusercontent.com/equis01/ximenav.digital/refs/heads/main/media/bella_enojada.png" alt="Bella enojada" class="belle-img">
    <p>¡Oh no! Parece que son demasiados invitados. Por favor, ingresa un número de 7 personas o menos.</p>
    <button class="close-belle-alert btn btn-secondary">Entendido</button>
  `;
  document.body.appendChild(alertDiv);

  setTimeout(() => {
    alertDiv.style.opacity = "1";
    alertDiv.style.transform = "translate(-50%, -50%) scale(1)";
  }, 10);

  alertDiv.querySelector(".close-belle-alert").addEventListener("click", () => {
    alertDiv.style.opacity = "0";
    alertDiv.style.transform = "translate(-50%, -50%) scale(0.8)";
    setTimeout(() => {
      alertDiv.remove();
    }, 300);
  });
}

// Manejo del envío del formulario
document.getElementById("confirmationForm").addEventListener("submit", async function (event) {
  event.preventDefault();

  const name = document.getElementById("name").value.trim();
  const guests = parseInt(document.getElementById("guests").value.trim(), 10);
  const ipAddress = document.getElementById("ipAddress").value;

  const submitButton = event.submitter;
  const originalButtonText = submitButton.textContent;

  // Bloquear el botón y cambiar texto
  submitButton.disabled = true;
  submitButton.textContent = "Enviando...";

  if (!name || isNaN(guests) || !ipAddress || ipAddress === "Desconocida") {
    showErrorModal("Por favor, llena todos los campos correctamente y asegúrate de que tu IP se haya detectado.");
    submitButton.disabled = false;
    submitButton.textContent = originalButtonText;
    return;
  }

  if (guests > 7) {
    showAngryBelleAlert();
    submitButton.disabled = false;
    submitButton.textContent = originalButtonText;
    return;
  }

  const googleAppsScriptURL =
    "https://script.google.com/macros/s/AKfycbxR9l-gnsEKMK8Hu-FR41IlXZIoOgo72VjpE1o5bxTzbSpcfIxqNm-Bra99eGOUWQKr/exec";
  const form = event.target;
  const formData = new FormData(form);

  formData.append("ipAddress", ipAddress);

  try {
    const response = await fetch(googleAppsScriptURL, {
      method: "POST",
      body: formData,
    });
    const data = await response.json();

    if (data.status === "success" && data.redirect) {
      localStorage.setItem("ximena_xv_ip", ipAddress);
      localStorage.setItem("ximena_xv_name", name);
      localStorage.setItem("ximena_xv_guests", guests);

      showErrorModal(data.message || `Gracias, ${name}. ¡Tu asistencia ha sido confirmada!`);
      window.location.href = data.redirect;
    } else if (data.status === "error") {
      showErrorModal(data.message);
    } else {
      showErrorModal("Hubo un error al confirmar tu asistencia. Intenta de nuevo.");
      console.error("Error de servidor:", data);
    }
  } catch (error) {
    console.error("Error de red o CORS:", error);
    showErrorModal("No se pudo confirmar la asistencia. Revisa tu conexión.");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = originalButtonText;
  }
});

// Lógica "Hola de nuevo" con modal de Bootstrap
document.addEventListener("DOMContentLoaded", async () => {
  await getPublicIP();

  const savedIP = localStorage.getItem("ximena_xv_ip");
  const currentIP = document.getElementById("ipAddress").value;
  const savedName = localStorage.getItem("ximena_xv_name");
  const savedGuests = localStorage.getItem("ximena_xv_guests");

  if (savedIP && currentIP && savedIP === currentIP && savedName) {
    document.getElementById("modalGuestName").textContent = savedName;

    const welcomeBackModalElement = document.getElementById("welcomeBackModal");
    if (welcomeBackModalElement) {
      const welcomeBackModal = new bootstrap.Modal(welcomeBackModalElement);
      welcomeBackModal.show();

      document.getElementById("goToInvitationBtn").addEventListener("click", () => {
        window.location.href = `details?id=${encodeURIComponent(savedName)}_${savedGuests}`;
      });
    }
  }

  // Redireccionar calendario
  const eventDateTimeClickable = document.getElementById("eventDateTimeClickable");
  if (eventDateTimeClickable) {
    eventDateTimeClickable.addEventListener("click", () => {
      const title = "XV Años de Ximena Vázquez";
      const startDate = "20250719T170000";
      const endDate = "20250719T233000";
      const location = "Salón Ébano, Querétaro";
      const description = "¡Te esperamos para celebrar los XV años de Ximena Vázquez!";

      const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
        title
      )}&dates=${startDate}/${endDate}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(
        location
      )}&sf=true&output=xml`;

      window.open(googleCalendarUrl, "_blank");
    });
  }

  // Redireccionar ubicación
  const eventLocationClickable = document.getElementById("eventLocationClickable");
  if (eventLocationClickable) {
    eventLocationClickable.addEventListener("click", () => {
      const locationQuery = "Salón Ébano, Querétaro";
      const encodedLocation = encodeURIComponent(locationQuery);

      const isMobile = /Mobi|Android/i.test(navigator.userAgent);

      if (isMobile) {
        const wazeUrl = `waze://?q=${encodedLocation}`;
        const googleMapsMobileUrl = `https://maps.google.com/?q=${encodedLocation}`;

        window.location.href = wazeUrl;
        setTimeout(() => {
          if (!document.hidden) {
            window.open(googleMapsMobileUrl, "_blank");
          }
        }, 500);
      } else {
        const googleMapsDesktopUrl = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
        window.open(googleMapsDesktopUrl, "_blank");
      }
    });
  }
});
