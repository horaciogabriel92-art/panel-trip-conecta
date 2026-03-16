# SOP-032: Prueba Estrés de PDFs y Storage

## Objetivo
El sistema de CARMEN B2B no solo guarda datos en la nube (Supabase), sino que descarga y archiva documentos físicos (Vouchers, Boletos) en el disco duro del Servidor VPS (Hetzner). El QA debe probar que la "Tubería Local" (Coolify Volumes) hacia el disco `/data/trip-conecta/uploads` esté perfectamente montada y no genere errores 404 al dueño el primer día de uso.

## Requisitos Previos
- [ ] Haber completado exitosamente la Auditoría de Interfaz (SOP-031).
- [ ] Mismo Usuario Admin de prueba de `Agencia X` activo.
- [ ] Tener a la mano un documento PDF ligero "Dummy" en tu escritorio (`test-voucher.pdf`).

## 🛠️ Instrucciones de Prueba (Quality Assurance)

### 1. El Test de Almacenamiento Ciego VPS
La meta es asegurarnos que Multer (Express Middleware) está dejando los archivos donde debe.

1. Entra a CARMEN B2B B2B (la URL limpia de `Agencia X`) logueado como su Dueño (Admin).
2. Ve a cualquier "Venta Confirmada" (Ej. La que creaste en el SOP-031 para "Pepe Prueba").
3. Haz clic en la opción de **"Subir Comprobante / Voucher"**.
4. Sube tu archivo `test-voucher.pdf`.
5. Recibirás un mensaje de "Éxito" del Frontend.

### 2. El Test de Recuadro de Muerte 404
El error más común de los Dockers en Coolify es guardar un archivo dentro de sí mismo y borrarlo en el siguiente reinicio.

1. **La Recuperación Instantánea:** Dentro de esa misma vista de la Venta (Como Vendedor Independiente o Admin), haz clic en "Descargar Voucher: test-voucher.pdf".
   - ¿Descarga correctamente y puedes leerlo en tu PC? 🟢 Pasa el test 1.
2. **La Destrucción Simulada:** Reinicia tu backend para comprobar la persistencia.
   - En tu panel Coolify, busca la aplicación de Backend (`api.tripconecta...`).
   - Haz clic en **Reiniciar (Restart)**. El Docker se destruirá y renacerá.
3. **La Recuperación Absoluta:** Vuelve a loguearte en la Web CARMEN B2B como el Vendedor que le vendió a "Pepe Prueba".
4. Dirígete a Historial de Compras -> Descarga de Nuevo "test-voucher.pdf".
   - ¿El PDF descargado no manda 404 (Archivo No Encontrado) o pesa 0 Bytes? 🟢 ¡La conexión de Volumen en `/data` del Host de Hetzner Funciona Perfectamente!
   - Tienes un producto robusto y el cliente ya puede guardar documentación internacional aquí sin miedo a perderla.

### 3. Eliminar el Rastros de Prueba
Es fundamental dejar el sistema limpio antes de la Llamada de Entrega (Handover).

1. Ingresa a la Base de la Venta en el Panel de Administrador.
2. Busca la opción (si existe) para eliminar el Voucher de prueba.
3. Puedes hacer Limpieza DB directa desde Supabase:
```sql
DELETE FROM documentos_viaje WHERE nombre_archivo = 'test-voucher.pdf';
```

---

## 🏁 Finalización de Tarea en Asana
*   En la Tarea, anota "Storage Persistente OK (Volumenes VPS confirmados)".
*   Marca este SOP como Completado ☑️.
*   Pasa a la [SOP-041: Llamada de Presentación y Demo Admin](./SOP-041-Demo-Admin.md).
