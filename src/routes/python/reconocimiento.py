import json
import os

print(os.getcwd())
'''
# Leer los datos desde el archivo JSON
with open('/python/datos.json', 'r') as archivo:
    datos = json.load(archivo)

# Asegurarse de que los datos sean un arreglo
if not isinstance(datos, list):
    datos = []

# Ahora puedes trabajar con los datos como un arreglo en Python
print(datos)
'''

