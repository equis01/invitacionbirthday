// scripts/index.js

// Reproductor de audio
function PlayAudio() {
    document.getElementById("audioInstrumental").play();
}

// Función para abrir el modal de confirmación
function openModal() {
    const modal = document.getElementById('modal');
    modal.style.display = 'flex';
    getPublicIP();
}

// Función para cerrar el modal de confirmación
function closeModal() {
    const modal = document.getElementById('modal');
    modal.style.display = 'none';
}

// Función para obtener la IP pública
async function getPublicIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        document.getElementById('ipAddress').value = data.ip;
        console.log('IP Pública detectada:', data.ip);
    } catch (error) {
        console.error('No se pudo obtener la IP pública:', error);
        document.getElementById('ipAddress').value = 'Desconocida';
    }
}

// NUEVA FUNCIÓN: Mostrar alerta de error personalizada con modal de Bella
function showErrorModal(message) {
    const errorModal = new bootstrap.Modal(document.getElementById('errorAlertModal'));
    document.getElementById('errorModalMessage').textContent = message;
    errorModal.show();
}

// Interceptar el envío del formulario
document.getElementById('confirmationForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const name = document.getElementById('name').value.trim();
    const guests = parseInt(document.getElementById('guests').value.trim(), 10);
    const ipAddress = document.getElementById('ipAddress').value;
    
    const submitButton = event.submitter; // Obtener el botón que disparó el submit
    const originalButtonText = submitButton.textContent;

    // Bloquear el botón y cambiar texto
    submitButton.disabled = true;
    submitButton.textContent = 'Enviando...';

    if (!name || isNaN(guests) || !ipAddress || ipAddress === 'Desconocida') {
        showErrorModal('Por favor, llena todos los campos correctamente y asegúrate de que tu IP se haya detectado.');
        submitButton.disabled = false; // Habilitar el botón si hay un error de validación local
        submitButton.textContent = originalButtonText;
        return;
    }

    if (guests > 7) {
        showAngryBelleAlert(); // Esto ya usa un modal, así que no se necesita showErrorModal aquí
        submitButton.disabled = false; // Habilitar el botón
        submitButton.textContent = originalButtonText;
        return;
    }

    // Usar la URL de tu Apps Script
    const googleAppsScriptURL = 'https://script.google.com/macros/s/AKfycbxR9l-gnsEKMK8Hu-FR41IlXZIoOgo72VjpE1o5bxTzbSpcfIxqNm-Bra99eGOUWQKr/exec';
    const form = event.target;
    const formData = new FormData(form);

    formData.append('ipAddress', ipAddress);

    try {
        const response = await fetch(googleAppsScriptURL, {
            method: 'POST',
            body: formData
        });
        const data = await response.json();

        if (data.status === 'success' && data.redirect) {
            localStorage.setItem('ximena_xv_ip', ipAddress);
            localStorage.setItem('ximena_xv_name', name);
            localStorage.setItem('ximena_xv_guests', guests);

            // alert(data.message || `Gracias, ${name}. ¡Tu asistencia ha sido confirmada!`); // Eliminar alert nativo
            showErrorModal(data.message || `Gracias, ${name}. ¡Tu asistencia ha sido confirmada!`); // Usar modal para éxito también
            // Redirigir después de que el usuario cierre el modal de éxito, si lo prefieres
            // O directamente como estaba antes si el mensaje es solo informativo antes de la redirección
            window.location.href = data.redirect;
        } else if (data.status === 'error') {
            showErrorModal(data.message); // Usar modal para errores de Apps Script
        } else {
            showErrorModal('Hubo un error al confirmar tu asistencia. Intenta de nuevo.');
            console.error('Error de servidor:', data);
        }
    } catch (error) {
        console.error('Error de red o CORS:', error);
        showErrorModal('No se pudo confirmar la asistencia. Revisa tu conexión.'); // Usar modal para errores de red
    } finally {
        // Habilitar el botón y restaurar texto, siempre
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
    }
});

// Alerta personalizada de Bella enojada (ya es un modal)
function showAngryBelleAlert() {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'belle-alert';
    alertDiv.innerHTML = `
        <img src="https://raw.githubusercontent.com/equis01/ximenav.digital/refs/heads/main/media/bella_enojada.png" alt="Bestia enojada" class="belle-img">
        <p>¡Oh no! Parece que son demasiados invitados. Por favor, ingresa un número de 7 personas o menos.</p>
        <button class="close-belle-alert">Entendido</button>
    `;
    document.body.appendChild(alertDiv);

    setTimeout(() => {
        alertDiv.style.opacity = '1';
        alertDiv.style.transform = 'translate(-50%, -50%) scale(1)';
    }, 10);

    alertDiv.querySelector('.close-belle-alert').addEventListener('click', () => {
        alertDiv.style.opacity = '0';
        alertDiv.style.transform = 'translate(-50%, -50%) scale(0.8)';
        setTimeout(() => {
            alertDiv.remove();
        }, 300);
    });
}

// Lógica de "Hola de nuevo" con modal de Bootstrap (ya es un modal)
document.addEventListener('DOMContentLoaded', async () => {
    await getPublicIP(); 

    const savedIP = localStorage.getItem('ximena_xv_ip');
    const currentIP = document.getElementById('ipAddress').value;
    const savedName = localStorage.getItem('ximena_xv_name');
    const savedGuests = localStorage.getItem('ximena_xv_guests');

    if (savedIP && currentIP && savedIP === currentIP && savedName) {
        document.getElementById('modalGuestName').textContent = savedName;

        const welcomeBackModal = new bootstrap.Modal(document.getElementById('welcomeBackModal'));
        welcomeBackModal.show();

        document.getElementById('goToInvitationBtn').addEventListener('click', () => {
            window.location.href = `details?id=${encodeURIComponent(savedName)}_${savedGuests}`;
        });
    }

    // --- NUEVAS FUNCIONALIDADES ---

    // 1. Redireccionar a calendario al hacer clic en fecha/hora
    const eventDateTimeClickable = document.getElementById('eventDateTimeClickable');
    if (eventDateTimeClickable) {
        eventDateTimeClickable.addEventListener('click', () => {
            const title = "XV Años de Ximena Vázquez";
            const startDate = "20250719T170000"; // 19 de Julio de 2025, 5:00 PM (17:00)
            const endDate = "20250719T233000";   // 19 de Julio de 2025, 11:30 PM (23:30)
            const location = "Salón Ébano, Querétaro";
            const description = "¡Te esperamos para celebrar los XV años de Ximena Vázquez!";

            const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}&sf=true&output=xml`;
            
            window.open(googleCalendarUrl, '_blank');
        });
    }

    // 2. Redireccionar a mapas al hacer clic en ubicación
    const eventLocationClickable = document.getElementById('eventLocationClickable');
    if (eventLocationClickable) {
        eventLocationClickable.addEventListener('click', () => {
            const locationQuery = "Salón Ébano, Querétaro";
            const encodedLocation = encodeURIComponent(locationQuery);
            
            const isMobile = /Mobi|Android/i.test(navigator.userAgent);

            if (isMobile) {
                const wazeUrl = `waze://?q=${encodedLocation}`;
                const googleMapsMobileUrl = `https://maps.google.com/?q=${encodedLocation}`; // URL directa para Maps en móvil

                // Intentar abrir Waze. Si falla, abrir Google Maps.
                window.location.href = wazeUrl; 
                setTimeout(() => { 
                    if (!document.hidden) { 
                        window.open(googleMapsMobileUrl, '_blank');
                    }
                }, 500); 
            } else {
                // Para escritorio, abrir Google Maps directamente
                const googleMapsDesktopUrl = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`; // URL de búsqueda con API
                window.open(googleMapsDesktopUrl, '_blank');
            }
        });
    }
});
