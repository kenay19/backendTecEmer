import subprocess

# Comando para instalar requerimientos desde requirements.txt
comando_instalacion = "pip install -r requirements.txt"

# Ejecutar el comando
subprocess.run(comando_instalacion, shell=True)