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

// Interceptar el envío del formulario
document.getElementById('confirmationForm').addEventListener('submit', function (event) {
    // Obtener los valores de los campos del formulario
    const name = document.getElementById('name').value.trim();
    const guests = document.getElementById('guests').value.trim();

    // Validar los campos
    if (!name || !guests) {
        alert('Por favor, llena todos los campos antes de continuar.');
        event.preventDefault();
        return;
    }

    // Generar el enlace personalizado con encodeURIComponent
    const encodedId = encodeURIComponent(`${name}_${guests}`);
    const customUrl = `https://ximenav.digital/details?id=${encodedId}`;

    // Actualizar el valor del campo oculto '_next'
    document.getElementById('_next').value = customUrl;

    // Confirmación visual (puedes eliminar este bloque si no es necesario)
    console.log(`Redirigiendo a: ${customUrl}`);
});
