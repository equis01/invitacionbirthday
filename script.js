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

// Función para manejar el envío del formulario
document.querySelector('form[name="form"]').addEventListener('submit', function(event) {
    event.preventDefault();

    // Obtener los valores de los campos del formulario
    const name = document.getElementById('name-3b9a').value;
    const guests = document.getElementById('guests-3b9a').value;  // Suponiendo que el campo es para invitados

    // Crear los datos para enviar en el cuerpo de la solicitud POST
    const data = new FormData();
    data.append('name', name);
    data.append('guests', guests);

    // Realizar la solicitud POST
    fetch('https://script.google.com/macros/s/AKfycbxind0liyG4eIJraAonRXYcwPenNto95FcQRrLOLWEMVevGHw-24CgPDv-vBQ4ziBDzvw/exec', {
        method: 'POST',
        body: data
    })
    .then(response => response.text())
    .then(data => {
        // Mostrar un mensaje de éxito
        alert('¡Gracias, ' + name + '! Has confirmado ' + guests + ' invitado(s).');
        // Limpiar los campos del formulario
        document.querySelector('form[name="form"]').reset();
    })
    .catch(error => {
        console.error('Error al enviar los datos:', error);
        alert('Hubo un error al enviar tus datos. Intenta nuevamente.');
    });
});
