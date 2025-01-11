// Reproductor de audio
function PlayAudio() {
    document.getElementById("audioInstrumental").play();
}

// Función para abrir el modal
function openModal() {
    const modal = document.getElementById('modal');
    modal.style.display = 'flex';
}

// Función para cerrar el modal
function closeModal() {
    const modal = document.getElementById('modal');
    modal.style.display = 'none';
}

// Manejar el envío del formulario
document.getElementById('rsvpForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const name = document.getElementById('name').value;
    const guests = document.getElementById('guests').value;

    // URL de la Web App de Google Apps Script
    const url = 'https://script.google.com/macros/s/AKfycbz6o00hvqPlDYTRsWhaU-T4fcC8gDiParr_PvnpDFTiF4wlCCveusHkmhDGoVeI7vDt8w/exec'; 

    // Crear los parámetros que se enviarán
    const params = {
        name: name,
        guests: guests
    };

    // Enviar los datos usando fetch
    fetch(url + `?name=${encodeURIComponent(params.name)}&guests=${encodeURIComponent(params.guests)}`, {
        method: 'GET'
    })
    .then(response => response.text())
    .then(data => {
        // Mostrar mensaje de éxito
        alert(`¡Gracias, ${name}! Has confirmado ${guests} invitado(s).`);
        closeModal();
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Hubo un error al enviar tus datos. Intenta nuevamente.');
    });
});
