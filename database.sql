DROP DATABASE IF EXISTS Medico;
CREATE DATABASE IF NOT EXISTS Medico;
USE Medico;

CREATE TABLE Direccion(
    idDireccion INT AUTO_INCREMENT,
    calle VARCHAR(50),
    inte INT,
    exte INT,
    colonia VARCHAR(50),
    municipio VARCHAR(50),
    estado VARCHAR(50),
    cp VARCHAR(50),
    PRIMARY KEY (idDireccion)
)ENGINE=InnoDB;

CREATE TABLE DatosPersonales(
    idDp INT AUTO_INCREMENT,
    nombre VARCHAR(50),
    app VARCHAR(50),
    apm VARCHAR(50),
    PRIMARY KEY(idDp)
)ENGINE=InnoDB;

CREATE TABLE Direcciones(
    idDp INT,
    idDireccion INT,
    FOREIGN KEY (idDireccion) REFERENCES Direccion(idDireccion),
    FOREIGN KEY(idDp) REFERENCES DatosPersonales(idDp)
)ENGINE=InnoDB;

CREATE TABLE Contacto(
    idContacto INT AUTO_INCREMENT,
    telefonoFijo VARCHAR(50),
    celular VARCHAR(50),
    email VARCHAR(50),
    PRIMARY KEY(idContacto)
)ENGINE=InnoDB;

CREATE TABLE Roles(
    idRol INT AUTO_INCREMENT,
    nombre VARCHAR(50),
    PRIMARY KEY(idRol)
)ENGINE=InnoDB;

CREATE TABLE Usuario(
    idUsuario INT AUTO_INCREMENT,
    contrasena VARCHAR(50),
    idDp INT,
    idContacto INT,
    idRol INT,
    PRIMARY KEY(idUsuario)
)ENGINE=InnoDB;

CREATE TABLE EquipoMedico(
    idEquipoMedico INT AUTO_INCREMENT,
    nombre VARCHAR(50),
    estado VARCHAR(50),
    costo  NUMERIC(5,2),
    idVendedor  INT,
    descripcion  VARCHAR(50),
    PRIMARY KEY(idEquipoMedico),
    FOREIGN KEY(idVendedor) REFERENCES Usuario(idUsuario)
)ENGINE=InnoDB;

CREATE TABLE CompraVenta(
    idCompraVenta INT AUTO_INCREMENT,
    idEquipoMedico INT,
    idComprador INT,
    PRIMARY KEY(idCompraVenta),
    FOREIGN KEY(idEquipoMedico) REFERENCES EquipoMedico(idEquipoMedico),
    FOREIGN KEY(idComprador) REFERENCES Usuario(idUsuario)
)ENGINE=InnoDB;

CREATE TABLE ListaDonaciones(
    idDonacion INT AUTO_INCREMENT,
    idEquipoMedico INT,
    idCompra INT,
    PRIMARY KEY(idDonacion),
    FOREIGN KEY(idEquipoMedico) REFERENCES EquipoMedico(idEquipoMedico),
    FOREIGN KEY(idCompra) REFERENCES CompraVenta(idCompraVenta)
)ENGINE=InnoDB;

CREATE TABLE DonacionAsignada(
    idAsignacion INT AUTO_INCREMENT,
    idDonacion INT,
    idSolicitante INT,
    PRIMARY KEY(idAsignacion),
    FOREIGN KEY(idDonacion) REFERENCES ListaDonaciones(idDonacion),
    FOREIGN KEY(idSolicitante) REFERENCES Usuario(idUsuario)
)ENGINE=InnoDB;
