-- Script de inicialización para PostgreSQL en Docker
-- Este script se ejecutará la primera vez que se inicie el contenedor (cuando /var/lib/postgresql/data está vacío)

CREATE DATABASE identitydb;
CREATE DATABASE academicdb;
CREATE DATABASE socioeconomic_db;

-- (Opcional) Asignar privilegios si fuese necesario, pero al usar el usuario postgres por defecto,
-- ya tiene todos los privilegios sobre estas bases de datos.
