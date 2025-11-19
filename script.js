  // ========== INICIALIZACIÓN DEL MAPA ==========

  // Coordenadas del centro del mapa (Lima, Perú)
  var centroUNMSM = [-12.057210, -77.084432];

  // Inicializar el mapa
  var map = L.map('map', {
    center: centroUNMSM,        // Centro del mapa
    zoom: 16,                   // Nivel de zoom (16 = detallado)
    maxBounds: [                // Límites del mapa (evita scroll infinito)
      [ -12.061894, -77.088230 ],
      [ -12.050848, -77.078837 ]
    ],
    maxBoundsViscosity: 1.0     // Rigidez de los límites
  });

  // Añadir capa de mapa de OpenStreetMap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

// ========= MOSTRAR LA UBICACIÓN EN TIEMPO REAL =========

const URL_GET = 'https://backend-production-79bd.up.railway.app/ultima';
let marcadorGPS = null;

// Actualiza el marcador en el mapa y centra la vista
function actualizarMarcador(lat, lng, timestamp) {
  if (!marcadorGPS) {
    marcadorGPS = L.marker([lat, lng]).addTo(map);
  } else {
    marcadorGPS.setLatLng([lat, lng]);
  }
  marcadorGPS.bindPopup(`Lat: ${lat.toFixed(4)}<br>Lng: ${lng.toFixed(4)}<br>Hora: ${timestamp}`).openPopup();
  map.setView([lat, lng], 16);
}

// Consulta la última ubicación cada 3 segundos
function pedirUbicacion() {
  fetch(URL_GET)
    .then(res => res.json())
    .then(data => {
      if ('latitud' in data && 'longitud' in data) {
        actualizarMarcador(
          parseFloat(data.latitud),
          parseFloat(data.longitud),
          data.timestamp
        );
      }
    })
    .catch(() => {
      // Si ocurre algún error, puede mostrar mensaje o ignorar
    });
}

// Ejecuta el pedido al iniciar y luego periódicamente
setInterval(pedirUbicacion, 3000);
pedirUbicacion();

  // ========== CONTROL DE ESTADO DEL SERVICIO ==========
  // Cambia 'true' a 'false' para mostrar el servicio como inactivo
  const isServiceActive = true;

  // Obtener el elemento del badge de estado
  const statusBadge = document.getElementById('statusBadge');

  // Si el servicio no está activo, cambiar su apariencia
  if (!isServiceActive) {
    statusBadge.classList.remove('active');      // Quitar clase verde
    statusBadge.classList.add('inactive');       // Agregar clase roja
    statusBadge.textContent = 'No Activo';       // Cambiar texto
  }