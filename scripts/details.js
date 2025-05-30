// scripts/details.js
// Reproductor de audio (mantener aquí también si quieres que funcione de forma independiente)
function PlayAudio() {
    document.getElementById("audioInstrumental").play();
}

// Función para abrir el modal del formulario de correo
function openEmailFormModal() {
    const modal = document.getElementById('emailFormModal');
    modal.style.display = 'flex';
}

// Función para cerrar el modal del formulario de correo
function closeModal() { // Esta es para el modal de confirmación, si aún lo usas en details.html
    const modal = document.getElementById('modal');
    if (modal) modal.style.display = 'none';
}

function closeEmailFormModal() {
    const modal = document.getElementById('emailFormModal');
    modal.style.display = 'none';
}

// NUEVA FUNCIÓN: Mostrar alerta de error/éxito personalizada con modal de Bella
function showDetailsAlertModal(message) {
    const errorModal = new bootstrap.Modal(document.getElementById('detailsAlertModal'));
    document.getElementById('detailsModalMessage').textContent = message;
    errorModal.show();
}


// Script principal para lógica de details.html
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    const currentInvitationUrl = window.location.href; // La URL completa de esta página de detalles

    if (id) {
        const parts = id.split('_');
        const guestName = decodeURIComponent(parts[0]);
        const guestCount = parts[1];

        document.getElementById('guestName').innerText = `Gracias, ${guestName}`; // Mensaje de agradecimiento
        document.getElementById('guestCount').innerText = `${guestCount} personas`;

        const qrText = id; // El ID completo (nombre_invitados) es lo que se codifica
        QRCode.toDataURL(qrText, {
            errorCorrectionLevel: 'H',
            color: { dark: '#000000', light: '#00000000' }
        }, function (error, url) {
            if (error) {
                console.error(error);
                document.getElementById('qrCode').innerText = 'Error generando el QR';
            } else {
                const imgElement = document.createElement('img');
                imgElement.src = url;
                imgElement.style.maxWidth = '150px'; // Ajusta el tamaño del QR
                imgElement.style.height = 'auto';
                document.getElementById('qrCode').appendChild(imgElement);
            }
        });
    } else {
        document.getElementById('guestName').innerText = 'Bienvenido/a'; // Mensaje genérico
        document.getElementById('guestCount').innerText = 'Por favor, confirma tu asistencia.';
        document.getElementById('qrCode').innerText = ''; // No QR sin ID
    }

    // Botón WhatsApp
    const whatsappShareBtn = document.getElementById('whatsappShareBtn');
    if (whatsappShareBtn) {
        const whatsappText = encodeURIComponent(`¡Hola! Estás invitado/a a los XV Años de Ximena Vázquez. Aquí puedes ver tu invitación personal: ${currentInvitationUrl}`);
        whatsappShareBtn.href = `https://api.whatsapp.com/send?text=${whatsappText}`;
    }

    // Botón Enviar por Correo: Abre el modal del formulario
    const emailShareBtn = document.getElementById('emailShareBtn');
    if (emailShareBtn) {
        emailShareBtn.addEventListener('click', function(event) {
            event.preventDefault();
            openEmailFormModal(); // Abre el modal con el formulario de correo
        });
    }

    // Manejo del formulario de envío de correo en el modal
    const sendEmailForm = document.getElementById('sendEmailForm');
    if (sendEmailForm) {
        sendEmailForm.addEventListener('submit', async function(event) {
            event.preventDefault();

            const recipientEmail = document.getElementById('recipientEmail').value.trim();
            if (!recipientEmail) {
                showDetailsAlertModal('Por favor, ingresa un correo electrónico.'); // Usar modal para validación
                return;
            }

            const submitButton = sendEmailForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent; // Guarda el texto original
            
            // 1. Deshabilitar el botón y cambiar texto
            submitButton.disabled = true;
            submitButton.textContent = 'Enviando...';

            // <<-- ¡IMPORTANTE! URL de tu App Script para sendInvitationEmail -->>
            const gasEmailServiceUrl = 'https://script.google.com/macros/s/AKfycbwp9LrVrAimP32_buI3VwYpAGwBvI9cbS7_iEiP6dMB25IKClU6XPpCgGQZAkCsRYAxmw/exec';
            
            try {
                const response = await fetch(gasEmailServiceUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        recipient: recipientEmail,
                        link: currentInvitationUrl
                    }).toString()
                });
                const data = await response.json();
                if (data.status === 'success') {
                    showDetailsAlertModal('Invitación enviada por correo exitosamente.'); // Usar modal para éxito
                    document.getElementById('recipientEmail').value = ''; // Limpiar campo
                } else {
                    showDetailsAlertModal('Error al enviar la invitación por correo: ' + data.message); // Usar modal para error
                    console.error('Error de GAS al enviar correo:', data.message);
                }
            } catch (error) {
                console.error('Error de red o CORS al enviar correo:', error);
                showDetailsAlertModal('No se pudo enviar el correo. Revisa tu conexión.'); // Usar modal para error de red
            } finally {
                // 2. Habilitar el botón y restaurar texto
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            }
        });
    }

    // Botón Descargar Invitación (captura encabezado, Ceremonia, Recepción y QR)
    const downloadInvitationBtn = document.getElementById('downloadInvitationBtn');
    if (downloadInvitationBtn) {
        downloadInvitationBtn.addEventListener('click', function(event) {
            event.preventDefault();
            alert('Generando la invitación para descargar... ¡Esto puede tardar unos segundos!');

            // 1. Identify the specific sections to capture
            const mainHeaderSection = document.querySelector('.container.contenedor > .row > .contenedor-central > .col-12.caja-bordes.text-center');

            let ceremonyReceptionSection = null;
            const allDirectionRows = document.querySelectorAll('.row.direccion');
            for (const row of allDirectionRows) {
                if (row.querySelector('.subtitulo') && row.querySelector('.subtitulo').textContent.includes('CEREMONIA')) {
                    ceremonyReceptionSection = row;
                    break;
                }
            }
            
            let qrCodeSection = null;
            for (const row of allDirectionRows) {
                if (row.querySelector('#qrCode')) {
                    qrCodeSection = row;
                    break;
                }
            }

            // 2. Create a temporary container to hold the cloned content
            const tempCaptureDiv = document.createElement('div');
            tempCaptureDiv.style.position = 'absolute';
            tempCaptureDiv.style.left = '-9999px';
            tempCaptureDiv.style.top = '-9999px';
            tempCaptureDiv.style.width = '600px';
            tempCaptureDiv.style.minHeight = '800px';
            tempCaptureDiv.style.background = 'rgba(255, 255, 255, 0.95)';
            tempCaptureDiv.style.borderRadius = '15px';
            tempCaptureDiv.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.3)';
            tempCaptureDiv.style.padding = '30px';
            tempCaptureDiv.style.textAlign = 'center';
            tempCaptureDiv.style.fontFamily = "'Lora', serif";
            tempCaptureDiv.style.color = '#333';

            const styleElement = document.createElement('style');
            styleElement.textContent = `
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Lora:ital,wght@0,400;0,700;1,400&display=swap');
                @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap');
                body {
                    font-family: 'Lora', serif;
                    background: none;
                }
                .contenedor-central {
                    background: rgba(255, 255, 255, 0.95);
                    border-radius: 15px;
                    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
                    padding: 30px;
                    text-align: center;
                    margin-bottom: 50px;
                }
                .caja-bordes {
                    border: 2px solid #FFD700;
                    padding: 20px;
                    border-radius: 10px;
                }
                .titulo-ka {
                    font-family: 'Playfair Display', serif;
                    color: #4A148C;
                    font-size: 2.2rem;
                }
                .subtitulo {
                    font-size: 1.2rem;
                    font-weight: bold;
                    color: #8D6E63;
                    text-transform: uppercase;
                }
                .btn-general {
                    background: #4A148C;
                    color: #FFD700;
                    border: 2px solid #FFD700;
                    border-radius: 8px;
                    padding: 12px 25px;
                    text-decoration: none;
                    display: inline-block;
                    margin-top: 15px;
                }
                .text-mini {
                    font-size: 0.9rem;
                    color: #777;
                }
                .titulo-quince {
                    font-family: 'Dancing Script', cursive;
                    color: #4A148C;
                    font-size: 2.5rem;
                    margin-top: 5px;
                    margin-bottom: 5px;
                    line-height: 1.2;
                }
                .numero-grande {
                    font-family: 'Playfair Display', serif;
                    font-size: 5rem;
                    color: #FFD700;
                    line-height: 1;
                    display: block;
                    margin-top: 0;
                    margin-bottom: 0;
                    padding: 0;
                }
                .nombre-quince {
                    font-family: 'Dancing Script', cursive;
                    font-size: 3rem;
                    color: #4A148C;
                    margin-top: 20px;
                }
                img { max-width: 100%; height: auto; }
            `;
            tempCaptureDiv.appendChild(styleElement);
            document.body.appendChild(tempCaptureDiv);

            if (mainHeaderSection) {
                const clonedHeader = mainHeaderSection.cloneNode(true);
                clonedHeader.style.borderBottom = '';
                const tituloQuinceElements = clonedHeader.querySelectorAll('.titulo-quince');
                tituloQuinceElements.forEach(el => {
                    el.style.marginBottom = '5px';
                    el.style.marginTop = '5px';
                    el.style.lineHeight = '1.2';
                });
                const numeroGrandeElement = clonedHeader.querySelector('.numero-grande');
                if (numeroGrandeElement) {
                    numeroGrandeElement.style.marginTop = '0px';
                    numeroGrandeElement.style.marginBottom = '0px';
                    numeroGrandeElement.style.padding = '0px';
                }
                tempCaptureDiv.appendChild(clonedHeader);
            }

            const spaceDiv1 = document.createElement('div');
            spaceDiv1.style.height = '50px';
            tempCaptureDiv.appendChild(spaceDiv1);

            if (ceremonyReceptionSection) {
                const clonedCeremonyReception = ceremonyReceptionSection.cloneNode(true);
                const mapButtons = clonedCeremonyReception.querySelectorAll('.btn-general');
                mapButtons.forEach(button => button.remove());
                tempCaptureDiv.appendChild(clonedCeremonyReception);
            }

            const spaceDiv2 = document.createElement('div');
            spaceDiv2.style.height = '50px';
            tempCaptureDiv.appendChild(spaceDiv2);

            if (qrCodeSection) {
                tempCaptureDiv.appendChild(qrCodeSection.cloneNode(true));
            }

            const originalBodyBg = document.body.style.backgroundImage;
            const originalBodyBgColor = document.body.style.backgroundColor;
            document.body.style.backgroundImage = 'none';
            document.body.style.backgroundColor = '#f8f8f8';

            html2canvas(tempCaptureDiv, {
                scale: 2,
                useCORS: true,
                logging: false,
                windowWidth: tempCaptureDiv.offsetWidth,
                windowHeight: tempCaptureDiv.offsetHeight,
            }).then(function(canvas) {
                document.body.style.backgroundImage = originalBodyBg;
                document.body.style.backgroundColor = originalBodyBgColor;

                if (tempCaptureDiv.parentNode) {
                    tempCaptureDiv.remove();
                }

                const link = document.createElement('a');
                const id = urlParams.get('id');
                link.download = `invitacion_ximena_xv_detalles_${id || 'generica'}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
                showDetailsAlertModal('¡Invitación descargada como imagen!');
            }).catch(error => {
                console.error('Error al descargar la invitación:', error);
                showDetailsAlertModal('Hubo un error al intentar descargar la invitación. Asegúrate de que todas las imágenes sean accesibles y de la misma procedencia (si usas CORS).');
                document.body.style.backgroundImage = originalBodyBg;
                document.body.style.backgroundColor = originalBodyBgColor;
                if (tempCaptureDiv.parentNode) {
                    tempCaptureDiv.remove();
                }
            });
        });
    }
});
