// index.js

const modalConfirmEl = document.getElementById('modalConfirm');
const modalWelcomeEl = document.getElementById('modalWelcome');
const bellaAlertEl = document.getElementById('bellaAlert');

const modalConfirm = new bootstrap.Modal(modalConfirmEl);
const modalWelcome = new bootstrap.Modal(modalWelcomeEl);

document.getElementById('btnOpenConfirm').addEventListener('click', () => {
  modalConfirm.show();
});

function showBellaAlert() {
  bellaAlertEl.classList.add('show');
}

function hideBellaAlert() {
  bellaAlertEl.classList.remove('show');
}

document.getElementById('bellaAlertCloseBtn').addEventListener('click', () => {
  hideBellaAlert();
});

function showWelcomeModal(name, guests) {
  document.getElementById('welcomeName').textContent = `¡Hola de nuevo, ${name}!`;
  const modalParagraph = document.getElementById('welcomeMessage');
  modalParagraph.textContent = 'Parece que ya confirmaste tu asistencia. ¿Quieres ir directamente a tu invitación?';

  const btnGo = document.getElementById('btnGoToInvitation');
  btnGo.textContent = 'Sí, ir a mi invitación';
  btnGo.onclick = () => {
    window.location.href = `details?id=${encodeURIComponent(name)}_${guests}`;
  };

  modalWelcome.show();
}

// Función para obtener IP pública
async function getPublicIP() {
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const data = await res.json();
    return data.ip || 'Desconocida';
  } catch {
    return 'Desconocida';
  }
}

document.getElementById('formConfirm').addEventListener('submit', async e => {
  e.preventDefault();

  const name = document.getElementById('inputName').value.trim();
  const guests = parseInt(document.getElementById('inputGuests').value.trim(), 10);
  const btnEnviar = e.target.querySelector('button[type="submit"]');

  if (name.length < 6) {
    alert('Por favor, escribe un nombre válido de al menos 6 caracteres.');
    return;
  }
  if (isNaN(guests) || guests < 1) {
    alert('Número de invitados inválido. Debe ser al menos 1.');
    return;
  }
  if (guests > 7) {
    showBellaAlert();
    return;
  }

  btnEnviar.textContent = 'Confirmando...';
  btnEnviar.disabled = true;

  const ipAddress = await getPublicIP();

  const formData = new URLSearchParams();
  formData.append('name', name);
  formData.append('guests', guests);
  formData.append('ipAddress', ipAddress);

  try {
    const response = await fetch('https://script.google.com/macros/s/AKfycbzi7BUjSiEbfXyfssR5aE0fWhelrQfZoPjfBuuQuPjun7IarvlWEYIDFe8GBH1K2_nJ/exec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      body: formData.toString(),
    });

    const result = await response.json();

    if (result.status === 'success') {
      modalConfirm.hide();
      localStorage.setItem('confirmado', 'true');
      localStorage.setItem('nombre', name);
      localStorage.setItem('invitados', guests);

      alert(result.message);
      window.location.href = result.redirect;
    } else {
      alert(result.message || 'Error desconocido al enviar la confirmación.');
    }
  } catch (error) {
    console.error('Error al conectar con el servidor:', error);

    localStorage.setItem('confirmado', 'true');
    localStorage.setItem('nombre', name);
    localStorage.setItem('invitados', guests);

    document.getElementById('welcomeName').textContent = `¡Hola de nuevo, ${name}!`;
    const modalParagraph = document.getElementById('welcomeMessage');
    modalParagraph.textContent = 'Tu confirmación fue registrada localmente. Puedes ver tu invitación dando clic abajo.';

    const btnGo = document.getElementById('btnGoToInvitation');
    btnGo.textContent = 'Ver mi invitación';
    btnGo.onclick = () => {
      window.location.href = `details?id=${encodeURIComponent(name)}_${guests}`;
    };

    modalConfirm.hide();
    modalWelcome.show();
  } finally {
    btnEnviar.textContent = 'Enviar';
    btnEnviar.disabled = false;
  }
});

window.addEventListener('load', () => {
  if (localStorage.getItem('confirmado') === 'true') {
    const name = localStorage.getItem('nombre') || 'Invitado';
    const guests = localStorage.getItem('invitados') || '1';
    showWelcomeModal(name, guests);
  }
});
