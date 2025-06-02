// scripts/index.js

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

function openGoogleCalendar() {
  const title = 'XV Años de Ximena Vázquez';
  const startDate = '20250719T170000';
  const endDate = '20250719T233000';
  const location = 'Salón Ébano, Querétaro';
  const description = '¡Te esperamos para celebrar los XV años de Ximena Vázquez!';

  const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    title
  )}&dates=${startDate}/${endDate}&details=${encodeURIComponent(
    description
  )}&location=${encodeURIComponent(location)}&sf=true&output=xml`;

  window.open(url, '_blank');
}

function openMaps() {
  const locationQuery = 'Salón Ébano, Querétaro';
  const encodedLocation = encodeURIComponent(locationQuery);
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);

  if (isMobile) {
    const wazeUrl = `waze://?q=${encodedLocation}`;
    const googleMapsMobileUrl = `https://maps.google.com/?q=${encodedLocation}`;
    window.location.href = wazeUrl;
    setTimeout(() => {
      if (!document.hidden) {
        window.open(googleMapsMobileUrl, '_blank');
      }
    }, 500);
  } else {
    const googleMapsDesktopUrl = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
    window.open(googleMapsDesktopUrl, '_blank');
  }
}

document.getElementById('formConfirm').addEventListener('submit', e => {
  e.preventDefault();

  const name = document.getElementById('inputName').value.trim();
  const guests = parseInt(document.getElementById('inputGuests').value.trim(), 10);

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

  modalConfirm.hide();

  localStorage.setItem('confirmado', 'true');
  localStorage.setItem('nombre', name);
  localStorage.setItem('invitados', guests);

  showWelcomeModal(name, guests);
});

function showWelcomeModal(name, guests) {
  document.getElementById('welcomeName').textContent = `¡Hola de nuevo, ${name}!`;
  modalWelcome.show();

  document.getElementById('btnGoToInvitation').onclick = () => {
    window.location.href = `details?id=${encodeURIComponent(name)}_${guests}`;
  };
}

window.addEventListener('load', () => {
  if (localStorage.getItem('confirmado') === 'true') {
    const name = localStorage.getItem('nombre') || 'Invitado';
    const guests = localStorage.getItem('invitados') || '1';
    showWelcomeModal(name, guests);
  }
});
