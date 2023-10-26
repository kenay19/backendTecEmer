DROP DATABASE IF EXISTS Medico;
CREATE DATABASE IF NOT EXISTS Medico;
USE Medico;

CREATE TABLE VectorCaracteristicas(
    idVector INT AUTO_INCREMENT,
    vector1 VARCHAR(1000) NOT NULL,
    vector2 VARCHAR(1000 ) NOT NULL,
    vector3 VARCHAR(1000 ) NOT NULL,
    PRIMARY KEY(idVector)
)ENGINE = InnoDB;

CREATE TABLE Direccion(
    idDireccion INT AUTO_INCREMENT,
    calle VARCHAR(50) NOT NULL,
    inte INT  NOT NULL,
    exte INT  NOT NULL ,
    colonia VARCHAR(50)  NOT NULL,
    municipio VARCHAR(50)  NOT NULL,
    estado VARCHAR(50)  NOT NULL,
    cp VARCHAR(50)  NOT NULL,
    alt VARCHAR(50) NOT NULL,
    lat   VARCHAR(50) NOT NULL,
    PRIMARY KEY (idDireccion)
)ENGINE=InnoDB;

CREATE TABLE DatosPersonales(
    idDp INT AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL,
    app VARCHAR(50) NOT NULL,
    apm VARCHAR(50) NOT NULL,
    PRIMARY KEY(idDp)
)ENGINE=InnoDB;

CREATE TABLE Direcciones(
    idDp INT  NOT NULL,
    idDireccion INT  NOT NULL,
    FOREIGN KEY (idDireccion) REFERENCES Direccion(idDireccion),
    FOREIGN KEY(idDp) REFERENCES DatosPersonales(idDp)
)ENGINE=InnoDB;

CREATE TABLE Contacto(
    idContacto INT AUTO_INCREMENT,
    telefonoFijo VARCHAR(50),
    celular VARCHAR(50)  NOT NULL,
    email VARCHAR(50)  NOT NULL,
    PRIMARY KEY(idContacto)
)ENGINE=InnoDB;

CREATE TABLE Roles(
    idRol INT AUTO_INCREMENT,
    nombre VARCHAR(50)  NOT NULL,
    PRIMARY KEY(idRol)
)ENGINE=InnoDB;

INSERT INTO Roles(nombre) VALUES('Vendedor'),('Donador'),('Solicitante');

CREATE TABLE Usuario(
    idUsuario INT AUTO_INCREMENT,
    contrasena VARCHAR(50)  NOT NULL,
    idDp INT  NOT NULL,
    idContacto INT  NOT NULL,
    idRol INT  NOT NULL,
    idVector INT NOT NULL,
    PRIMARY KEY(idUsuario),
    FOREIGN KEY(idDp) REFERENCES DatosPersonales(idDP),
    FOREIGN KEY(idContacto) REFERENCES Contacto(idContacto),
    FOREIGN KEY(idRol) REFERENCES Roles(idRol),
    FOREIGN KEY(idVector) REFERENCES VectorCaracteristicas(idVector)
)ENGINE=InnoDB;

CREATE TABLE EquipoMedico(
    idEquipoMedico INT AUTO_INCREMENT,
    nombre VARCHAR(50)  NOT NULL,
    estado VARCHAR(50)  NOT NULL,
    costo  VARCHAR(100)  NOT NULL,
    idVendedor  INT  NOT NULL,
    descripcion  VARCHAR(50),
    PRIMARY KEY(idEquipoMedico),
    FOREIGN KEY(idVendedor) REFERENCES Usuario(idUsuario)
)ENGINE=InnoDB;

CREATE TABLE CompraVenta(
    idCompraVenta INT AUTO_INCREMENT  ,
    idEquipoMedico INT  NOT NULL,
    idComprador INT  NOT NULL,
    PRIMARY KEY(idCompraVenta),
    FOREIGN KEY(idEquipoMedico) REFERENCES EquipoMedico(idEquipoMedico),
    FOREIGN KEY(idComprador) REFERENCES Usuario(idUsuario)
)ENGINE=InnoDB;

CREATE TABLE ListaDonaciones(
    idDonacion INT AUTO_INCREMENT,
    idEquipoMedico INT  NOT NULL,
    idCompra INT  NOT NULL,
    PRIMARY KEY(idDonacion),
    FOREIGN KEY(idEquipoMedico) REFERENCES EquipoMedico(idEquipoMedico),
    FOREIGN KEY(idCompra) REFERENCES CompraVenta(idCompraVenta)
)ENGINE=InnoDB;

CREATE TABLE DonacionAsignada(
    idAsignacion INT AUTO_INCREMENT,
    idDonacion INT  NOT NULL,
    idSolicitante INT  NOT NULL,
    PRIMARY KEY(idAsignacion),
    FOREIGN KEY(idDonacion) REFERENCES ListaDonaciones(idDonacion),
    FOREIGN KEY(idSolicitante) REFERENCES Usuario(idUsuario)
)ENGINE=InnoDB;

CREATE TABLE Imagenes(
    idImagen INT AUTO_INCREMENT,
    ruta VARCHAR(255) NOT NULL,
    PRIMARY KEY(idImagen)
)ENGINE = InnoDB;

CREATE TABLE EM_Imagen(
    idEquipoMedico INT,
    idImagen INT,
    FOREIGN KEY(idImagen) REFERENCES Imagenes(idImagen),
    FOREIGN KEY(idEquipoMedico) REFERENCES EquipoMedico(idEquipoMedico)
)ENGINE=InnoDB;

