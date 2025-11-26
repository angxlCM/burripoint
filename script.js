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


// ========== MARCADORES PERSONALIZADOS EN EL MAPA ==========

// Definir icono personalizado para los paraderos
var icono_personalizado = L.icon({
  iconUrl: 'imagenes/logo_paradero.png',      // Ruta de la imagen del icono
  iconSize: [25, 25],                          // Tamaño del icono
  iconAnchor: [22, 38],                        // Punto del icono que corresponde a la ubicación del marcador
  popupAnchor: [-3, -38]                       // Punto desde el cual se abrirá el popup relativo al icono
});

// NUEVO: Icono para el marcador GPS (ubicación en tiempo real)
var icono_gps = L.icon({
  iconUrl: 'imagenes/logo_gps.png',      // Imagen del icono GPS
  iconSize: [35, 35],                     // Tamaño más grande que los paraderos
  iconAnchor: [17, 35],                   // Centro del icono
  popupAnchor: [-3, -35]                  // Posición del popup
});



// Crear marcador en paradero 1
var puerta_2 = L.marker([-12.059520, -77.079642], {icon: icono_personalizado}).addTo(map);
var ingindustrial = L.marker([-12.060373, -77.080684], {icon: icono_personalizado}).addTo(map);
var ciencias_economicas = L.marker([-12.057740, -77.080077], {icon: icono_personalizado}).addTo(map);
var clinica = L.marker([-12.055418, -77.082340], {icon: icono_personalizado}).addTo(map);
var puerta_7 = L.marker([-12.054127, -77.084543], {icon: icono_personalizado}).addTo(map);
var odontologia = L.marker([-12.054881, -77.086214], {icon: icono_personalizado}).addTo(map);
var biblioteca_zulen = L.marker([-12.056243, -77.085117], {icon: icono_personalizado}).addTo(map);
var coliseo = L.marker([-12.060001, -77.084505], {icon: icono_personalizado}).addTo(map);
var comedor = L.marker([-12.060780, -77.082891], {icon: icono_personalizado}).addTo(map);

// Array con los datos de los marcadores (ubicación y nombre)
const marcadores = [
  { nombre: "Puerta 2", lat: -12.059520, lng: -77.079642 },
  { nombre: "Ciencias Económicas", lat: -12.057740, lng: -77.080077 },
  { nombre: "Clínica", lat: -12.055418, lng: -77.082340 },
  { nombre: "Ingeniería de Sistemas", lat: -12.053762 , lng: -77.085757}, 


  { nombre: "Puerta 7", lat: -12.054127, lng: -77.084543 },
  { nombre: "Odontología", lat: -12.054881, lng: -77.086214 },
  { nombre: "Biblioteca Zulen", lat: -12.056243, lng: -77.085117 },
  { nombre: "Coliseo/gimnasio", lat: -12.060001, lng: -77.084505 },
  { nombre: "Comedor", lat: -12.060780, lng: -77.082891 },
  { nombre: "Ing. Industrial", lat: -12.060373, lng: -77.080684 },
];

// Crear todos los marcadores en un bucle
marcadores.forEach(marcador => {
  const marker = L.marker([marcador.lat, marcador.lng], {icon: icono_personalizado}).addTo(map);
  
  // Añadir tooltip a cada marcador
  marker.bindTooltip(marcador.nombre, {
    permanent: false,
    direction: 'top',
    className: 'custom-tooltip'
  });
});




// ========== MOSTRAR LA UBICACIÓN EN TIEMPO REAL ==========

// URL del backend en Railway que devuelve la última ubicación
const URL_GET = 'https://backend-production-79bd.up.railway.app/ultima';

// Variable para almacenar el marcador del GPS en el mapa
let marcadorGPS = null;

// Variable para controlar si el servicio está activo
let isServiceActive = false;

// Contador de errores consecutivos
let errorCount = 0;
const MAX_ERRORS = 3;

/**
 * Actualiza la posición del marcador GPS en el mapa
 * @param {number} lat - Latitud de la ubicación
 * @param {number} lng - Longitud de la ubicación
 * @param {string} timestamp - Hora de la ubicación
 */
function actualizarMarcador(lat, lng, timestamp) {
  // Si no existe marcador, crear uno nuevo con icono GPS
  if (!marcadorGPS) {
    marcadorGPS = L.marker([lat, lng], {icon: icono_gps}).addTo(map);
  } else {
    // Si existe, actualizar su posición
    marcadorGPS.setLatLng([lat, lng]);
  }
  
  // Centrar el mapa en la nueva ubicación
  map.setView([lat, lng], 16);
  
  // Si recibimos datos, el servicio está activo
  isServiceActive = true;
  errorCount = 0;
  actualizarEstadoServicio();
}

/**
 * Actualiza el badge de estado del servicio en la interfaz
 */
function actualizarEstadoServicio() {
  const statusBadge = document.getElementById('statusBadge');
  
  if (isServiceActive) {
    statusBadge.classList.remove('inactive');
    statusBadge.classList.add('active');
    statusBadge.textContent = 'Activo';
  } else {
    statusBadge.classList.remove('active');
    statusBadge.classList.add('inactive');
    statusBadge.textContent = 'No Activo';
  }
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
          data.timestamp || 'No disponible'
        );
      }
    })
    .catch((error) => {
      // NUEVO: Incrementar contador de errores
      errorCount++;
      console.error('Error al obtener ubicación:', error);
      
      // Si llegamos al máximo de errores, marcar como inactivo
      if (errorCount >= MAX_ERRORS) {
        isServiceActive = false;
        actualizarEstadoServicio();
      }
    });
}

// Ejecutar la solicitud al iniciar la página
pedirUbicacion();

// Ejecutar la solicitud cada 3 segundos (3000 milisegundos)
setInterval(pedirUbicacion, 3000);

// ========== CONTROL DE ESTADO DEL SERVICIO ==========
// Inicializar el estado del servicio
actualizarEstadoServicio();

