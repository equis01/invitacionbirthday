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
document.getElementById('rsvpForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const name = document.getElementById('name').value;
    const guests = document.getElementById('guests').value;
    
    // Crear la URL de la solicitud GET con los parámetros
    const url = `https://script.google.com/macros/s/AKfycbzpTdaRyBfZnMomVnduX2kNJjhDpbuLTsqi-48CF1A7zI6AZjg7Mlu5YLBeKi4dXR_1Hg/exec?name=${encodeURIComponent(name)}&guests=${encodeURIComponent(guests)}`;
    
    // Realizar la solicitud GET
    fetch(url)
        .then(response => response.text())
        .then(data => {
            alert(`¡Gracias, ${name}! Has confirmado ${guests} invitado(s).`);
            closeModal(); // Cerrar el modal si el envío fue exitoso
        })
        .catch(error => {
            console.error('Error al enviar los datos:', error);
            alert('Hubo un error al enviar tus datos. Intenta nuevamente.');
        });
});
