import json
import os
import numpy as np
import cv2
import dlib
from IPython.display import Image, display
import matplotlib.pyplot as plt
import sys
# Obtén la ruta al directorio actual en el que se encuentra el script
current_dir = os.path.dirname(__file__)

# Construye la ruta al archivo utilizando una ruta relativa
file_path = os.path.join(current_dir, "datos.json")

# Leer los datos desde el archivo JSON
with open(file_path, 'rb') as archivo:
    datos = json.load(archivo)

# Asegurarse de que los datos sean un arreglo
if not isinstance(datos, list):
    datos = []
# Ahora puedes trabajar con los datos como un arreglo en Python
rows = []
pixel = []
columns = []
for i in range(len(datos)):
    pixel.append(datos[i])
    if(len(pixel) == 4 ):
        columns.append(pixel)
        pixel = []
    if (len(columns) == 150):
        rows.append(columns)
        columns = []

input_image = cv2.cvtColor(np.array(rows,dtype = np.uint8),cv2.COLOR_RGB2BGR)


# Cargar el detector de rostros y el predictor facial de dlib
detector = dlib.get_frontal_face_detector()
predictor = dlib.shape_predictor(os.path.join(current_dir,'shape_predictor_68_face_landmarks.dat'))


# Convertir la imagen a escala de grises
gray = cv2.cvtColor(input_image, cv2.COLOR_BGR2GRAY)

# Detectar rostros en la imagen
faces = detector(gray)

# Verificar si se detectaron rostros
if len(faces) > 0:
    for face in faces:
        # Obtener los puntos de detección de los 68 landmarks
        landmarks = predictor(gray, face)

        # Crear un vector de características de los landmarks
        features = []
        for point in landmarks.parts():
            features.append([point.x, point.y])

        # Convertir la lista de características en un arreglo NumPy
        features = np.array(features)

        # Dibujar los puntos de detección en la imagen
        for (x, y) in features:
            cv2.circle(input_image, (x, y), 2, (0, 255, 0), -1)  # Dibuja un círculo en cada landmark

        

        # Imprimir el vector de características
        print(features)
else:
    print("No se encontraron rostros en la imagen.")