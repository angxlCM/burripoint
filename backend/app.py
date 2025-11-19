from flask import Flask, request, jsonify

app = Flask(__name__)
# Variable global para la última ubicación
ubicacion = {"latitud": None, "longitud": None, "timestamp": None}

# Endpoint para recibir la ubicación del celular del vehículo
@app.route('/update', methods=['POST'])
def update():
    global ubicacion
    data = request.get_json()
    ubicacion.update(data)
    return 'OK'

# Endpoint para que cualquier visitante vea la última ubicación
@app.route('/ubicacion', methods=['GET'])
def get_ubicacion():
    return jsonify(ubicacion)

if __name__ == '__main__':
    app.run()
