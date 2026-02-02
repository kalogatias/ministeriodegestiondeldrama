document.addEventListener('DOMContentLoaded', function() {
    // Actualizar año dinámicamente en todos los elementos con clase 'current-year'
    document.querySelectorAll('.current-year').forEach(function(el) {
        el.textContent = new Date().getFullYear();
    });

    // Mostrar campo de otra categoría si se selecciona "Otro"
    const categoriaDrama = document.getElementById('categoriaDrama');
    const otraCategoriaContainer = document.getElementById('otraCategoriaContainer');
    
    if(categoriaDrama && otraCategoriaContainer) {
        categoriaDrama.addEventListener('change', function() {
            if(this.value === 'Otro') {
                otraCategoriaContainer.style.display = 'block';
            } else {
                otraCategoriaContainer.style.display = 'none';
            }
        });
    }
    
    // Mostrar valor seleccionado del slider
    const nivelDrama = document.getElementById('nivelDrama');
    const nivelDramaValue = document.getElementById('nivelDramaValue');
    
    if(nivelDrama && nivelDramaValue) {
        nivelDrama.addEventListener('input', function() {
            nivelDramaValue.textContent = this.value;
        });
    }
    
    // Manejar envío del formulario
    const submitButton = document.getElementById('submitButton');
    const dramaForm = document.getElementById('dramaForm');
    
    if(submitButton && dramaForm) {
        submitButton.addEventListener('click', function() {
            if(dramaForm.checkValidity()) {
                generarPDF();
            } else {
                // Trigger de validación nativa del navegador
                dramaForm.reportValidity();
            }
        });
    }
});

// Función para generar un ID único para el trámite
function generarIDTramite() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    return `MGD-${year}${month}${day}-${randomNum}`;
}

// Función para obtener la fecha actual en formato legible
function obtenerFechaActual() {
    const date = new Date();
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('es-ES', options);
}

// Función para obtener valores de los checkboxes seleccionados
function obtenerValoresCheckbox(name) {
    const checkboxes = document.querySelectorAll(`input[name="${name}"]:checked`);
    const valores = Array.from(checkboxes).map(cb => cb.value);
    return valores.join(', ');
}

// Función para dibujar un sello circular con texto
function dibujarSello(doc, texto, colorHex, rotacion, x, y, radio) {
    // Convertir color hex a RGB
    const r = parseInt(colorHex.slice(1, 3), 16);
    const g = parseInt(colorHex.slice(3, 5), 16);
    const b = parseInt(colorHex.slice(5, 7), 16);
    
    // Guardar el estado actual
    doc.saveGraphicsState();
    
    // Configurar color para el círculo
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(1);
    
    // Dibujar círculo exterior
    doc.circle(x + radio, y + radio, radio, 'S');
    
    // Dibujar círculo interior
    doc.circle(x + radio, y + radio, radio - 5, 'S');
    
    // Configurar color y fuente para el texto
    doc.setTextColor(r, g, b);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    
    // Calcular la posición central del texto
    const centroX = x + radio;
    const centroY = y + radio;
    
    // Aplicar rotación
    // doc.translate(centroX, centroY);
    // doc.rotate(rotacion);
    
    // Dibujar texto centrado
    doc.text(texto, centroX, centroY, { align: 'center', baseline: 'middle', angle: rotacion });
    
    // Restaurar transformaciones
    // doc.rotate(-rotacion);
    // doc.translate(-centroX, -centroY);
    
    // Restaurar estado gráfico
    doc.restoreGraphicsState();
}

// Función para insertar una imagen PNG en el PDF
function insertarImagen(doc, urlImagen, x, y, ancho, alto, rotacion = 0, opacidad = 1.0) {
    return new Promise((resolve, reject) => {
        // Crear un elemento imagen
        const imagen = new Image();
        imagen.crossOrigin = 'Anonymous'; // Para permitir imágenes de otros dominios
        
        // Configurar el evento onload
        imagen.onload = function() {
            try {
                // Guardar el estado actual del documento
                doc.saveGraphicsState();
                
                // Configurar opacidad si es necesario
                if (opacidad < 1.0) {
                    doc.setGState(new doc.GState({ opacity: opacidad }));
                }
                
                // Calcular el centro de la imagen para la rotación
                const centroX = x + ancho / 2;
                const centroY = y + alto / 2;
                
                // Aplicar rotación si es necesario
                if (rotacion !== 0) {
                    doc.translate(centroX, centroY);
                    doc.rotate(rotacion);
                    doc.translate(-centroX, -centroY);
                }
                
                // Añadir la imagen al PDF
                doc.addImage(imagen, 'PNG', x, y, ancho, alto);
                
                // Restaurar el estado del documento
                doc.restoreGraphicsState();
                
                resolve();
            } catch (error) {
                console.error('Error al añadir la imagen al PDF:', error);
                reject(error);
            }
        };
        
        // Configurar el evento onerror
        imagen.onerror = function() {
            console.error('Error al cargar la imagen:', urlImagen);
            reject(new Error('No se pudo cargar la imagen'));
        };
        
        // Iniciar la carga de la imagen
        imagen.src = urlImagen;
    });
}

// Función para dibujar una marca de agua
function dibujarMarcaAgua(doc, texto, colorHex, rotacion, x, y, tamaño) {
    // Convertir color hex a RGB
    const r = parseInt(colorHex.slice(1, 3), 16);
    const g = parseInt(colorHex.slice(3, 5), 16);
    const b = parseInt(colorHex.slice(5, 7), 16);
    
    // Guardar estado y configurar opacidad
    doc.saveGraphicsState();
    doc.setGState(new doc.GState({ opacity: 0.1 }));
    
    // Configurar color y fuente
    doc.setTextColor(r, g, b);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(tamaño);
    
    // Calcular posición central
    const centroX = x + tamaño/2;
    const centroY = y + tamaño/2;
    
    // Aplicar rotación
    // doc.ctx.translate(centroX, centroY);
    // doc.ctx.rotate(rotacion);
    
    // Dibujar texto
    doc.text(texto, centroX, centroY, { align: 'center', baseline: 'middle', angle: rotacion });
    
    // Restaurar transformaciones
    // doc.ctx.rotate(-rotacion);
    // doc.ctx.translate(-centroX, -centroY);
    
    // Restaurar estado
    doc.restoreGraphicsState();
}

// Función principal para generar el PDF
async function generarPDF() {
    // Importamos los módulos de jsPDF
    const { jsPDF } = window.jspdf;
    
    // Obtenemos los valores del formulario
    const nombreCompleto = document.getElementById('nombreCompleto').value;
    const fechaDrama = document.getElementById('fechaDrama').value;
    let categoriaDrama = document.getElementById('categoriaDrama').value;
    
    if(categoriaDrama === 'Otro') {
        categoriaDrama = document.getElementById('otraCategoria').value || 'Otra categoría';
    }
    
    const nivelDrama = document.getElementById('nivelDrama').value;
    const descripcionDrama = document.getElementById('descripcionDrama').value;
    const personasInvolucradas = document.getElementById('personasInvolucradas').value;
    const intentos = obtenerValoresCheckbox('intentos');
    const expectativas = document.getElementById('expectativas').value;
    
    // Generamos ID único y fecha actual
    const idTramite = generarIDTramite();
    const fechaActual = obtenerFechaActual();
    
    // Creamos el PDF
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });
    
    // Ajustamos fuentes
    doc.setFont('times', 'normal');
    
    // Encabezado
    doc.setFontSize(22);
    doc.setTextColor(26, 60, 94); // Color primario
    doc.text('MINISTERIO DE GESTIÓN DEL DRAMA', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('COMPROBANTE OFICIAL DE TRÁMITE', 105, 30, { align: 'center' });
    
    // ID y fecha
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`ID de Trámite: ${idTramite}`, 20, 45);
    doc.text(`Fecha de Registro: ${fechaActual}`, 20, 52);
    
    // Marco decorativo
    doc.setDrawColor(26, 60, 94);
    doc.setLineWidth(0.5);
    doc.rect(15, 38, 180, 20);
    
    // Datos del formulario
    doc.setFontSize(14);
    doc.setTextColor(26, 60, 94);
    doc.text('DATOS DEL DRAMA REPORTADO', 105, 70, { align: 'center' });
    
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    
    // Tabla de datos
    const camposYValores = [
        ['Nombre del afectado/a:', nombreCompleto],
        ['Fecha del drama:', new Date(fechaDrama).toLocaleDateString('es-ES')],
        ['Categoría:', categoriaDrama],
        ['Nivel de dramatismo:', `${nivelDrama}/10`],
        ['Personas involucradas:', personasInvolucradas || 'No especificadas'],
        ['Intentos previos de resolución:', intentos || 'Ninguno'],
        ['Expectativas:', expectativas]
    ];
    
    let posY = 80;
    const espaciadoLinea = 8;
    
    camposYValores.forEach(([campo, valor]) => {
        doc.setFont('times', 'bold');
        doc.text(campo, 20, posY);
        doc.setFont('times', 'normal');
        doc.text(valor, 80, posY);
        posY += espaciadoLinea;
    });
    
    // Descripción del drama
    posY += 5;
    doc.setFont('times', 'bold');
    doc.text('Descripción del drama:', 20, posY);
    posY += 7;
    
    // Añadir texto de descripción con saltos de línea automáticos
    const textLines = doc.splitTextToSize(descripcionDrama, 170);
    doc.setFont('times', 'normal');
    doc.text(textLines, 20, posY);
    
    // Actualizar posición Y después del texto
    // posY += textLines.length * 7 + 15;
    posY += textLines.length * 4;
    
    // Añadir marca de agua grande en el fondo
    dibujarMarcaAgua(doc, 'MINISTERIO DE DRAMA', '#888888', 45, 110, 180, 50);
    
    // Añadir sellos
    // dibujarSello(doc, 'INGRESADO', '#a12929', 0, 20, posY, 25);
    // dibujarSello(doc, 'ARCHIVADO', '#1a3c5e', -30, 75, posY, 25);
    // dibujarSello(doc, 'EN PROCESO', '#556B2F', 30, 130, posY, 25);

    // Añadir imagenes de sellos
    
    try {
        // Ejemplo: insertar una imagen de sello personalizado
        await insertarImagen( doc, 'img/sello-ingresado.png', 20, posY, 40, 40, 0, 1.0);
        await insertarImagen( doc, 'img/sello-archivado.png', 75, posY, 40, 40, 0, 1.0);
        await insertarImagen( doc, 'img/sello-noInsistir.png', 45, posY+10, 40, 40, 0, 1.0);
        
    } catch (error) {
        console.error('Error al insertar imágenes:', error);
    }
    
      
    // Signature de aprobación
    posY += 40;
    doc.line(120, posY, 180, posY);
    doc.text('Firma del Burócrata de Turno', 150, posY + 5, { align: 'center' });
    
    // Pie de página
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Este documento es parte de una iniciativa artística y no tiene validez legal.', 105, 255, { align: 'center' });
    doc.text(`© ${new Date().getFullYear()} Ministerio de Gestión del Drama`, 105, 260, { align: 'center' });
    
    // Añadir nota sobre el drama en letra pequeña
    doc.setFontSize(8);
    doc.text('Nota: Su drama ha sido oficialmente procesado por la burocracia. Esto no significa que', 105, 270, { align: 'center' });
    doc.text('se resolverá, pero al menos ha sido adecuadamente registrado en nuestro sistema.', 105, 275, { align: 'center' });
    
    // Guardar PDF
    doc.save(`Tramite-Drama-${idTramite}.pdf`);

    // Registrar evento de generación de PDF en Goatcounter
    if (window.goatcounter && window.goatcounter.count) {
        window.goatcounter.count({ path: 'pdf-generado', event: true });
    }

    // Mostrar mensaje de éxito
    alert('Su trámite ha sido procesado correctamente. El comprobante se está descargando.');
}