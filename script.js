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

//estilo del mapa (eliminar etiquetas)
L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}{r}.png', {
  minZoom: 0,
  maxZoom: 18,
  attribution: '© <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a>, © <a href="https://www.stamen.com/" target="_blank">Stamen Design</a>, © <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a>, © <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
}).addTo(map);
// ========== MARCADORES PERSONALIZADOS EN EL MAPA ==========

// Definir icono personalizado para los paraderos
var icono_personalizado = L.icon({
  iconUrl: 'imagenes/logo_paradero.png',      // Ruta de la imagen del icono
  iconSize: [25, 25],                          // Tamaño del icono
  iconAnchor: [22, 38],                        // Punto del icono que corresponde a la ubicación del marcador
  popupAnchor: [-3, -38]                       // Punto desde el cual se abrirá el popup relativo al icono
});

// Crear marcador en paradero 1
var puerta_2 = L.marker([-12.059520, -77.079642], {icon: icono_personalizado}).addTo(map);
var ingindustrial = L.marker([-12.060373, -77.080684], {icon: icono_personalizado}).addTo(map);
var ciencias_economicas = L.marker([-12.057740, -77.080077], {icon: icono_personalizado}).addTo(map);
// Añadir popup al marcador
puerta_2.bindTooltip( "Puerta 2", {
  permanent: false,
  direction: 'top',
  className: 'custom-tooltip'  // Clase CSS personalizada para el tooltip
});

ingindustrial.bindTooltip( "Ing. Industrial", {
  permanent: false,
  direction: 'top',
  className: 'custom-tooltip'  // Clase CSS personalizada para el tooltip
});

ciencias_economicas.bindTooltip( "Ciencias Económicas", {
  permanent: false,
  direction: 'top',
  className: 'custom-tooltip'  // Clase CSS personalizada para el tooltip
});


// ========== MOSTRAR LA UBICACIÓN EN TIEMPO REAL ==========

// URL del backend en Railway que devuelve la última ubicación
//const URL_GET = 'https://backend-production-79bd.up.railway.app/ultima';

// Variable para almacenar el marcador del GPS en el mapa
let marcadorGPS = null;

/**
 * Actualiza la posición del marcador en el mapa
 * @param {number} lat - Latitud de la ubicación
 * @param {number} lng - Longitud de la ubicación
 * @param {string} timestamp - Hora de la ubicación
 */
function actualizarMarcador(lat, lng, timestamp) {
  // Si no existe marcador, crear uno nuevo
  if (!marcadorGPS) {
    marcadorGPS = L.marker([lat, lng]).addTo(map);
  } else {
    // Si existe, actualizar su posición
    marcadorGPS.setLatLng([lat, lng]);
  }
  
  // Mostrar información al hacer clic en el marcador
  marcadorGPS.bindPopup(`
    <strong>Ubicación GPS</strong><br>
    Lat: ${lat.toFixed(4)}<br>
    Lng: ${lng.toFixed(4)}<br>
    Hora: ${timestamp}
  `).openPopup();
  
  // Centrar el mapa en la nueva ubicación
  map.setView([lat, lng], 16);
}

/**
 * Consulta la ubicación actual del backend
 * Se ejecuta cada 3 segundos automáticamente
 */
function pedirUbicacion() {
  fetch(URL_GET)
    .then(res => res.json())
    .then(data => {
      // Verificar que los datos contengan latitud y longitud
      if ('latitud' in data && 'longitud' in data) {
        actualizarMarcador(
          parseFloat(data.latitud),
          parseFloat(data.longitud),
          data.timestamp || 'No disponible'  // Usar 'No disponible' si timestamp no existe
        );
      }
    })
    .catch((error) => {
      // Registrar errores en la consola (no muestra al usuario)
      console.error('Error al obtener ubicación:', error);
    });
}

// Ejecutar la solicitud al iniciar la página
pedirUbicacion();

// Ejecutar la solicitud cada 3 segundos (3000 milisegundos)
setInterval(pedirUbicacion, 3000);

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