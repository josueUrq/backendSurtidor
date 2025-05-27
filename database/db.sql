SELECT * FROM public.bitacora
ORDER BY id ASC 

CREATE TABLE rol (
id UUID DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
nombre VARCHAR(40) NOT NULL UNIQUE
);
CREATE TABLE permiso (
id UUID DEFAULT gen_random_uuid() PRIMARY KEY NOT NULL,
nombre VARCHAR(40) NOT NULL UNIQUE,
descripcion VARCHAR(100)
);
CREATE TABLE permiso_rol (
id_permiso UUID NOT NULL,
id_rol UUID NOT NULL,
PRIMARY KEY (id_permiso, id_rol),
FOREIGN KEY (id_permiso) REFERENCES permiso(id) ON DELETE CASCADE ON
UPDATE CASCADE,
FOREIGN KEY (id_rol) REFERENCES rol(id) ON DELETE CASCADE ON UPDATE
CASCADE
);
CREATE TABLE empresa (
id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
direccion VARCHAR(40) NOT NULL,
nombre VARCHAR(40) NOT NULL,
logo_url TEXT,
telefono VARCHAR(20),
nombre_propietario VARCHAR(40) NOT NULL,
fecha DATE NOT NULL,
correo VARCHAR(30) NOT NULL,
nit VARCHAR(20) NOT NULL
);

CREATE TABLE descuento (
id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
nombre VARCHAR(40) NOT NULL,
descripcion VARCHAR(100) NOT NULL,
porcentaje DECIMAL(5) NOT NULL,
esta_activo BOOLEAN NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE sucursal (
id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
nombre VARCHAR(40) NOT NULL UNIQUE,
direccion VARCHAR(40) NOT NULL,
telefono VARCHAR(20),
correo VARCHAR(30) NOT NULL,
esta_suspendido BOOLEAN NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
id_empresa UUID,
FOREIGN KEY (id_empresa) REFERENCES empresa(id) ON DELETE CASCADE
ON UPDATE CASCADE
);
CREATE TABLE usuario (
id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
ci VARCHAR(40) NOT NULL UNIQUE,
nombre VARCHAR(40) NOT NULL,
telefono VARCHAR(20) NOT NULL,
sexo CHAR(1) NOT NULL,
correo TEXT NOT NULL UNIQUE,
domicilio VARCHAR(40) NOT NULL,
contraseña TEXT NOT NULL,
id_sucursal UUID,
id_rol UUID NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (id_sucursal) REFERENCES sucursal(id) ON DELETE CASCADE ON
UPDATE CASCADE,
FOREIGN KEY (id_rol) REFERENCES rol(id) ON DELETE CASCADE ON UPDATE
CASCADE
);
CREATE TABLE permiso_usuario (
  id_usuario UUID REFERENCES usuario(id),
  id_permiso UUID REFERENCES permiso(id),
  PRIMARY KEY (id_usuario, id_permiso)
);
CREATE TABLE registro_asistencia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_usuario UUID NOT NULL,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  hora_entrada TIMESTAMP NOT NULL,
  hora_salida TIMESTAMP,
  tiempo_trabajado INTERVAL,
  FOREIGN KEY (id_usuario) REFERENCES usuario(id) ON DELETE CASCADE
);
SELECT * FROM registro_asistencia;

CREATE TABLE dispensador (
id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
ubicacion VARCHAR(40) NOT NULL,
capacidad_maxima INT NOT NULL,
estado VARCHAR(15) NOT NULL,
id_sucursal UUID NOT NULL,
FOREIGN KEY (id_sucursal) REFERENCES sucursal(id) ON DELETE CASCADE ON
UPDATE CASCADE
);

CREATE TABLE categoria (
id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
nombre VARCHAR(40) NOT NULL,
descripcion VARCHAR(100),
imagen_url TEXT
);

CREATE TABLE tanque (
id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
nombre VARCHAR(40) NOT NULL,
descripcion VARCHAR(100) NOT NULL,
capacidad_max INT NOT NULL,
esta_activo BOOLEAN NOT NULL,
fecha_instalacion DATE NOT NULL,
ultima_revision DATE NOT NULL,
stock DECIMAL(7, 2) NOT NULL,
id_sucursal UUID NOT NULL,
FOREIGN KEY (id_sucursal) REFERENCES sucursal(id) ON DELETE CASCADE ON
UPDATE CASCADE
);
CREATE TABLE proveedor (
id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
nombre VARCHAR(40) NOT NULL,
telefono VARCHAR(20) NOT NULL,
correo VARCHAR(40) NOT NULL,
direccion VARCHAR(40) NOT NULL,
nit VARCHAR(20) NOT NULL,
detalle VARCHAR(100),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



CREATE TABLE producto (
id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
nombre VARCHAR(40) NOT NULL,
stock DECIMAL(7, 2) NOT NULL,
stock_minimo DECIMAL(7, 2) NOT NULL,
descripcion VARCHAR(100),
unidad_medida VARCHAR(10),
precio_venta DECIMAL(7, 2) NOT NULL,
precio_compra DECIMAL(7, 2) NOT NULL,
iva DECIMAL(7, 2) NOT NULL,
url_image TEXT,
esta_activo BOOLEAN NOT NULL,
id_descuento UUID,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
id_categoria UUID NOT NULL,
id_sucursal UUID NOT NULL,
id_proveedor UUID,
FOREIGN KEY (id_categoria) REFERENCES categoria(id) ON DELETE CASCADE ON
UPDATE CASCADE,
FOREIGN KEY (id_sucursal) REFERENCES sucursal(id) ON DELETE CASCADE ON
UPDATE CASCADE,
FOREIGN KEY (id_proveedor) REFERENCES proveedor(id) ON DELETE CASCADE ON
UPDATE CASCADE,
FOREIGN KEY (id_descuento) REFERENCES descuento(id)
ON DELETE SET NULL
ON UPDATE CASCADE
);
CREATE TABLE nota_de_compra (
id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
codigo VARCHAR(40) NOT NULL,
hora TIME NOT NULL,
monto_total DECIMAL(7) NOT NULL,
moneda VARCHAR(20) NOT NULL,
id_proveedor UUID NOT NULL,
id_sucursal UUID NOT NULL,
id_usuario UUID NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (id_proveedor) REFERENCES proveedor(id) ON DELETE CASCADE ON
UPDATE CASCADE,
FOREIGN KEY (id_sucursal) REFERENCES sucursal(id) ON DELETE CASCADE ON
UPDATE CASCADE,
FOREIGN KEY (id_usuario) REFERENCES usuario(id) ON DELETE CASCADE ON
UPDATE CASCADE
);
CREATE TABLE notificacion_producto (
id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
titulo VARCHAR(30) NOT NULL,
descripcion VARCHAR(100) NOT NULL,
hora TIME NOT NULL,
id_producto UUID NOT NULL,
fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (id_producto) REFERENCES producto(id) ON DELETE CASCADE ON
UPDATE CASCADE
);
CREATE TABLE usuario_notificacion (
id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
visto BOOLEAN NOT NULL,
recordar BOOLEAN NOT NULL,
id_notificacion_producto UUID NOT NULL,
id_usuario UUID NOT NULL,
fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (id_notificacion_producto) REFERENCES notificacion_producto(id) ON
DELETE CASCADE ON UPDATE CASCADE,
FOREIGN KEY (id_usuario) REFERENCES usuario(id) ON DELETE CASCADE ON
UPDATE CASCADE
);
CREATE TABLE manguera (
id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
esta_activo BOOLEAN NOT NULL,
id_dispensador UUID NOT NULL,
FOREIGN KEY (id_dispensador) REFERENCES dispensador(id) ON DELETE CASCADE
ON UPDATE CASCADE
);
CREATE TABLE cliente (
id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
nombre VARCHAR(40) NOT NULL,
nit VARCHAR(20) NOT NULL,
placa VARCHAR(10) NOT NULL UNIQUE,
b_sisa BOOLEAN NOT NULL,
id_sucursal UUID NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (id_sucursal) REFERENCES sucursal(id) ON DELETE CASCADE ON
UPDATE CASCADE
);
CREATE TABLE nota_venta (
id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
codigo VARCHAR(40) NOT NULL,
monto_pagado VARCHAR(100) NOT NULL,
monto_por_cobrar DECIMAL(5) NOT NULL,
monto_cambio VARCHAR(20) NOT NULL,
hora TIME NOT NULL,
id_sucursal UUID NOT NULL,
id_usuario UUID NOT NULL,
id_dispensador UUID,
id_cliente UUID NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (id_sucursal) REFERENCES sucursal(id) ON DELETE CASCADE ON
UPDATE CASCADE,
FOREIGN KEY (id_usuario) REFERENCES usuario(id) ON DELETE CASCADE ON
UPDATE CASCADE,
FOREIGN KEY (id_dispensador) REFERENCES dispensador(id) ON DELETE CASCADE
ON UPDATE CASCADE,
FOREIGN KEY (id_cliente) REFERENCES cliente(id) ON DELETE CASCADE ON
UPDATE CASCADE
);
CREATE TABLE detalle_venta (
id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
cantidad DECIMAL(7, 2) NOT NULL,
precio DECIMAL(7, 2) NOT NULL,
subtotal DECIMAL(7, 2) NOT NULL,
id_nota_venta UUID,
id_producto UUID,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (id_nota_venta) REFERENCES nota_venta(id) ON DELETE CASCADE
ON UPDATE CASCADE,
FOREIGN KEY (id_producto) REFERENCES producto(id) ON DELETE CASCADE ON
UPDATE CASCADE
);
-----------------------------------------INSERTS---------------------------------------------
-- TABLA ROL
INSERT INTO rol (nombre) VALUES 
('administrador'),
('supervisor'),
('empleado');
SELECT * FROM rol;
-- TABLA PERSMISO
INSERT INTO permiso (nombre, descripcion) VALUES 
('ver_dashboard', 'Puede ver el dashboard'),
('gestionar_usuarios', 'Puede crear, editar y eliminar usuarios'),
('gestionar_surtidores', 'Puede gestionar surtidores'),
('gestionar_ventas', 'Puede ver y registrar ventas'),
('gestionar_inventario', 'Puede ver y ajustar inventario'),
('gestionar_proveedores', 'Puede crear, editar y eliminar proveedores'),
('gestionar_compras', 'Puede ver y registrar compras'),
('gestionar_ofertas', 'Puede ver y crear ofertas'),
('gestionar_historial_asistencias', 'Puede ver todo el historico de asistencias'),
('ver_bitacora', 'Puede ver la bitacora');

SELECT * FROM permiso;
-- TABLA PERMISO_ROL
-- Permisos para ADMIN
INSERT INTO permiso_rol (id_permiso, id_rol)
SELECT p.id, r.id FROM permiso p, rol r 
WHERE r.nombre = 'administrador';
-- Permisos para SUPERVISOR (todos menos gestionar_usuarios)
INSERT INTO permiso_rol (id_permiso, id_rol)
SELECT p.id, r.id 
FROM permiso p, rol r 
WHERE r.nombre = 'supervisor' AND p.nombre != 'gestionar_usuarios';
-- Permisos para EMPLEADO (solo dashboard y ventas)
INSERT INTO permiso_rol (id_permiso, id_rol)
SELECT p.id, r.id 
FROM permiso p, rol r 
WHERE r.nombre = 'empleado' AND p.nombre IN ('ver_dashboard', 'gestionar_ventas');
SELECT * FROM permiso_rol;
-- TABLA EMPRESA
INSERT INTO empresa (direccion, nombre, logo_url, telefono, nombre_propietario, fecha,
correo, nit) VALUES
('Av.Cristo Redentor', 'Octano Adm Ofice',
'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTCgV8WpDGa8hFwV8rKlhr0qCbYRPvnEqYmqg&s',
'77616677', 'Maribel Osorio','2025-03-27','AdmOfice@gmail.com', '123456789');
SELECT * FROM empresa;
-- TABLA DESCUENTO
INSERT INTO descuento (nombre, descripcion, porcentaje, esta_activo)
VALUES
('Descuento de Bienvenida', 'Descuento para nuevos clientes', 10, true),
('Descuento de Temporada', 'Descuento por temporada alta',15, true);
SELECT * FROM descuento;
-- TABLA SUCURSAL
INSERT INTO sucursal (nombre, direccion, telefono, correo, esta_suspendido, id_empresa)
VALUES
('Octano Paurito', 'Av.Paurito', '98765432', 'OctPaurito@gmail.com', false,
(SELECT id FROM empresa WHERE nombre = 'Octano Adm Ofice')),
('Octano Sur', 'Av.Bolivia', '77813346', 'OctSuro@gmail.com', false,
(SELECT id FROM empresa WHERE nombre = 'Octano Adm Ofice'));
SELECT * FROM sucursal;
-- TABLA USUARIO
INSERT INTO usuario (ci, nombre, telefono, sexo, correo, domicilio, contraseña, id_sucursal,
id_rol) VALUES
('12448724', 'superUsuario', '65432932', 'M', 'superUsuario@gmail.com', 'santa cruz',
'S12345', (SELECT id FROM sucursal WHERE nombre = 'Octano Paurito'),
(SELECT id FROM rol WHERE nombre = 'administrador'));
SELECT * FROM usuario;
-- TABLA DISPENSADOR
INSERT INTO dispensador ( ubicacion, capacidad_maxima, estado, id_sucursal) VALUES
('Pista 1', 1000, 'Operativo', (SELECT id FROM sucursal WHERE nombre = 'Octano Sur')),
('Pista 2', 1000, 'Mantenimiento', (SELECT id FROM sucursal WHERE nombre = 'Octano Paurito'));
SELECT * FROM dispensador;
-- TABLA CATEGORIA
INSERT INTO categoria (nombre, descripcion, imagen_url) VALUES
('Combustible', 'GNV para vehículos pesados y livianos', 'url_imagen_combustible'),
('Lubricante y aceite', 'Productos para el mantenimiento del motor.', 'url_imagen_aceite'),
('Accesorio', 'Artículos prácticos y decorativos para automóviles', 'url_imagen_accesorio');
SELECT * FROM categoria;
-- TABLA TANQUE
INSERT INTO tanque (nombre, descripcion, capacidad_max, esta_activo,
fecha_instalacion, ultima_revision, stock, id_sucursal) VALUES
('Tanque 1', 'Tanque de gas Regular', 7000, true,
'2024-02-01', '2024-10-09', 6000, (SELECT id FROM sucursal WHERE nombre = 'Octano Paurito')),
('Tanque 2', 'Tanque de gas Regular', 7000, true, 
'2024-01-15', '2024-09-01', 7000, (SELECT id FROM sucursal WHERE nombre = 'Octano Sur'));
SELECT * FROM tanque;
-- TABLA PROVEEDOR
INSERT INTO proveedor (nombre, telefono, correo, direccion, nit, detalle) VALUES
('Proveedor A', '987654321', 'prov1@gmail.com', 'Calle Comercial 123',
'1234567890', 'Proveedor de gas'),
('Proveedor B', '123123123', 'prov2@gmail.com', 'Calle 222',
'0987654321', 'Proveedor de gas');
SELECT * FROM proveedor;
SELECT * FROM sucursal;
-- TABLA PRODUCTO
INSERT INTO producto (nombre, stock, stock_minimo, descripcion,unidad_medida, precio_venta,
precio_compra, iva, url_image, esta_activo, id_categoria, id_sucursal, id_proveedor, id_descuento)
VALUES
('GNV', 8000, 1000, 'GNV en almacen','m^3', 1.66, 1.0, 13.0,
'url_imagen_gas', true, (SELECT id FROM categoria WHERE nombre =
'Combustible'), (SELECT id FROM sucursal WHERE nombre = 'Octano Paurito'),
(SELECT id FROM proveedor WHERE nombre = 'Proveedor A'),
(SELECT id FROM descuento WHERE nombre = 'Descuento de Bienvenida'));
SELECT * FROM producto;
-- TABLA NOTA_DE_COMPRA
INSERT INTO nota_de_compra (codigo, hora, monto_total, moneda,
id_proveedor, id_sucursal, id_usuario) VALUES
('NC123', '11:00:30', 2000, 'USD', (Select id from
proveedor where nombre = 'Proveedor A'), (SELECT id FROM sucursal WHERE nombre =
'Octano Paurito'), (SELECT id FROM usuario WHERE ci = '12448724'));
SELECT * FROM nota_de_compra;

-- TABLA NOTIFICACION_PRODUCTO
INSERT INTO notificacion_producto (titulo, descripcion, fecha, hora, id_producto)
VALUES
('Reabastece tu GNV', 'GNV con stock minimo','2025-03-01','12:42:30',
(Select id from producto where nombre = 'GNV'));
SELECT * FROM notificacion_producto;
-- TABLA USUARIO_NOTIFICACION
INSERT INTO usuario_notificacion (visto, recordar, id_notificacion_producto, id_usuario)
VALUES
(false, true, (Select id from notificacion_producto where titulo = 'Reabastece tu GNV'),
(SELECT id FROM usuario WHERE ci ='12448724'));
SELECT * FROM usuario_notificacion;
-- TABLA MANGUERA
INSERT INTO manguera (esta_activo, id_dispensador) VALUES
(true, (Select id from dispensador where ubicacion = 'Pista 1'));
SELECT * FROM manguera;

-- TABLA CLIENTE
INSERT INTO cliente (nombre, nit, placa,b_sisa, cantidad_mensual_vendida, ultima_fecha,
id_sucursal) VALUES
('Juan Carlos Perez', '1234567890', 'ABC123',true, '200', '2025-02-13',(SELECT id FROM sucursal
WHERE nombre = 'Octano Paurito')),
('Juana Mariscal Torrez', '0987654321', 'DEF456',true, '100', '2025-02-17',(SELECT id FROM
sucursal WHERE nombre = 'Octano Sur'));
SELECT * FROM cliente;

-- TABLA NOTA_VENTA
INSERT INTO nota_venta (codigo, monto_pagado, monto_por_cobrar, monto_cambio,
hora,id_sucursal, id_usuario, id_dispensador, id_cliente) VALUES
('NV001', '200', 0, '0','16:46:42', (SELECT id FROM sucursal WHERE nombre =
'Octano Paurito'), (SELECT id FROM usuario WHERE ci = '12448724'), (Select id from
dispensador where ubicacion = 'Pista 1'), (Select id from cliente where placa = 'ABC123'));
SELECT * FROM nota_venta;

-- TABLA DETALLE_VENTA
INSERT INTO detalle_venta (cantidad, precio, subtotal, id_nota_venta, id_producto) VALUES
(100, 1.66, 166, (Select id from nota_venta where codigo = 'NV001'), (Select id from producto
where nombre = 'GNV')),
(80, 1.66, 132.8, (Select id from nota_venta where codigo = 'NV001'), (Select id from producto
where nombre = 'GNV'));
SELECT * FROM detalle_venta;

CREATE TABLE  vehiculos (
    id SERIAL PRIMARY KEY,
    placa VARCHAR(10) UNIQUE NOT NULL,
    propietario VARCHAR(100),
    modelo VARCHAR(50),
    marca VARCHAR(50),
    anio INTEGERs
);


INSERT INTO vehiculos (placa, propietario, modelo, marca, anio) VALUES
('ABC123', 'Juan Pérez', 'Hilux', 'Toyota', 2018),
('ZXC456', 'María López', 'Creta', 'Hyundai', 2020)