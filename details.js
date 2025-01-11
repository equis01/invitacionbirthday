// Obtener los parámetros de la URL
const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');

if (id) {
  const qrText = decodeURIComponent(id);
  QRCode.toDataURL(qrText, { errorCorrectionLevel: 'H', color: { dark: '#000000', light: '#00000000' } }, function (error, url) {
    if (error) {
      console.error(error);
      document.getElementById('qrCode').innerText = 'Error generando el QR';
    } else {
      const imgElement = document.createElement('img');
      imgElement.src = url;
      document.getElementById('qrCode').appendChild(imgElement);
    }
  });
} else {
  document.getElementById('qrCode').innerText = 'No se encontró el parámetro "id"';
}

// Cuenta regresiva
const eventDate = new Date("July 19, 2025 17:00:00").getTime();
const countdownElement = document.getElementById("countdown");

const countdownInterval = setInterval(function() {
  const now = new Date().getTime();
  const distance = eventDate - now;

  if (distance < 0) {
    clearInterval(countdownInterval);
    countdownElement.innerHTML = "¡Es hora del evento!";
  } else {
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    countdownElement.innerHTML = `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }
}, 1000);

// Función para abrir el modal de transferencia
document.getElementById("transferButton").addEventListener("click", function() {
  document.getElementById("transferModal").style.display = "block";
});

// Función para cerrar el modal de transferencia
document.getElementById("closeModal").addEventListener("click", function() {
  document.getElementById("transferModal").style.display = "none";
});

// Cerrar el modal si el usuario hace clic fuera de la ventana del modal
window.addEventListener("click", function(event) {
  if (event.target === document.getElementById("transferModal")) {
    document.getElementById("transferModal").style.display = "none";
  }
});