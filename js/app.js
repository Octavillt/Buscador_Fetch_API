function iniciarApp() {

    // Obteniendo referencia del elemento en el que mostraremos el resultado (las recetas).
    const resultado = document.querySelector('#resultado');

    // Obteniendo referencia del dropdown que contendrá las categorías de comidas.
    const selectCategorias = document.querySelector('#categorias');

    // Si el elemento selectCategorias existe (es decir, estamos en una página que tiene este elemento),
    // entonces se le agrega un event listener para cuando su valor cambie.
    if (selectCategorias) {
        // Cuando el usuario cambie la categoría seleccionada, llamaremos a la función 'seleccionarCategoria'.
        selectCategorias.addEventListener('change', seleccionarCategoria);

        // Además, al cargar la aplicación, queremos obtener y mostrar todas las categorías disponibles.
        obtenerCategorias();
    }

    // Obteniendo referencia del contenedor que mostrará las recetas favoritas.
    const favoritosDiv = document.querySelector('.favoritos');

    // Si estamos en una página que tiene el div de favoritos, queremos obtener y mostrar las recetas favoritas.
    if (favoritosDiv) {
        obtenerFavoritos();
    }

    // Creando una nueva instancia del modal usando la biblioteca de Bootstrap.
    // Nos permitirá mostrar detalles de la receta en una ventana emergente/modal.
    const modal = new bootstrap.Modal('#modal', {});

    // Función que se comunica con la API para obtener una lista de todas las categorías de comida disponibles.
    function obtenerCategorias() {
        const url = 'https://www.themealdb.com/api/json/v1/1/categories.php';

        // Usamos 'fetch' para hacer una solicitud HTTP a la URL dada.
        fetch(url)
            // Una vez que recibimos la respuesta, la convertimos de un string JSON a un objeto JavaScript.
            .then(respuesta => respuesta.json())
            // Luego, tomamos las categorías del objeto resultado y las pasamos a la función 'msotrarCategorias'.
            .then(resultado => msotrarCategorias(resultado.categories));
    }

    // Función que muestra las categorías recibidas en el dropdown (elemento 'select').
    function msotrarCategorias(categorias = []) {
        categorias.forEach(categoria => {
            // Extraemos el nombre de la categoría del objeto 'categoria'.
            const { strCategory } = categoria;

            // Creamos un nuevo elemento 'option' que se añadirá al dropdown.
            const option = document.createElement('OPTION');
            option.value = strCategory; // El valor del 'option' será el nombre de la categoría.
            option.textContent = strCategory; // El texto visible será también el nombre de la categoría.

            // Añadimos el elemento 'option' al dropdown de categorías.
            selectCategorias.appendChild(option);
        });
    }

    // Función que se activa cuando el usuario cambia la categoría seleccionada en el dropdown.
    function seleccionarCategoria(e) {
        // Obtenemos el nombre de la categoría seleccionada del evento.
        const categoria = e.target.value;

        // Construimos la URL para obtener recetas basadas en la categoría seleccionada.
        const url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${categoria}`;

        // Hacemos una solicitud a la API para obtener recetas de la categoría seleccionada.
        fetch(url)
            .then(respuesta => respuesta.json())
            // Una vez que tengamos las recetas, las pasamos a la función 'mostrarRecetas' para mostrarlas en la página.
            .then(resultado => mostrarRecetas(resultado.meals));
    }
    // Función encargada de mostrar recetas en la interfaz del usuario.
    function mostrarRecetas(recetas = []) {
        // Antes de agregar nuevos elementos al contenedor de resultados, es importante asegurarse de que esté vacío.
        limpiarHtml(resultado);

        // Creamos un encabezado para mostrar el estado de los resultados.
        const heading = document.createElement('H2');
        heading.classList.add('text-center', 'text-black', 'my-5');
        heading.textContent = recetas.length ? 'Resultados' : 'No Hay Resultados'; // Si no hay recetas, muestra "No Hay Resultados".

        // Añadimos el encabezado al contenedor de resultados.
        resultado.appendChild(heading);

        // Recorremos el array de recetas para mostrar cada una de ellas.
        recetas.forEach(receta => {
            // Desestructuramos la receta para obtener solo las propiedades que necesitamos.
            const { idMeal, strMeal, strMealThumb } = receta;

            // Creamos un contenedor para cada receta. Este contenedor será una columna en un diseño de tres columnas.
            const recetaContenedor = document.createElement('DIV');
            recetaContenedor.classList.add('col-md-4');

            // Creamos la tarjeta donde se mostrará la información de la receta.
            const recetaCard = document.createElement('DIV');
            recetaCard.classList.add('card', 'mb-4');

            // Creamos la imagen de la receta y configuramos sus atributos.
            const recetaImagen = document.createElement('IMG');
            recetaImagen.classList.add('card-img-top');
            recetaImagen.alt = `Imagen de la receta ${strMeal ?? receta.titulo}`; // Usamos la coalescencia nula para una posible alternativa.
            recetaImagen.src = strMealThumb ?? receta.img;

            // Creamos el cuerpo de la tarjeta donde se mostrará el título de la receta y el botón.
            const recetaCardBody = document.createElement('DIV');
            recetaCardBody.classList.add('card-body');

            // Creamos el título de la receta.
            const recetaHeading = document.createElement('H3');
            recetaHeading.classList.add('card-title', 'mb-3');
            recetaHeading.textContent = strMeal ?? receta.titulo; // Usamos la coalescencia nula nuevamente como medida de precaución.

            // Creamos el botón que permitirá al usuario ver más detalles de la receta.
            const recetaButton = document.createElement('BUTTON');
            recetaButton.classList.add('btn', 'btn-danger', 'w-100');
            recetaButton.textContent = 'Ver Receta';

            // Cuando el usuario haga clic en el botón, se llamará a la función 'seleccionarReceta'.
            recetaButton.onclick = function () {
                seleccionarReceta(idMeal ?? receta.id);  // Usamos la coalescencia nula nuevamente como medida de precaución.
            }

            // Ahora, ensamblamos todos los elementos creados en la estructura correcta.
            recetaCardBody.appendChild(recetaHeading);
            recetaCardBody.appendChild(recetaButton);

            recetaCard.appendChild(recetaImagen);
            recetaCard.appendChild(recetaCardBody)

            recetaContenedor.appendChild(recetaCard);
            resultado.appendChild(recetaContenedor); // Finalmente, añadimos la tarjeta completa al contenedor de resultados.
        });
    }
    /*
    Esta función es responsable de obtener y mostrar los detalles de una receta específica.
    Se activa cuando un usuario selecciona una receta en la interfaz, y se espera que muestre
    estos detalles en un modal (una ventana emergente).
    */
    function seleccionarReceta(id) {
        // Construimos la URL para consultar la API. Esta URL se basa en un endpoint específico 
        // de la API de "themealdb" que permite obtener detalles de una receta por su ID.
        const url = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`;

        // Usamos la función 'fetch' para hacer una solicitud HTTP a la API.
        fetch(url)
            // Una vez que la solicitud es completada, convertimos la respuesta en un objeto JSON.
            .then(respuesta => respuesta.json())
            // Después de tener el objeto JSON, tomamos la primera receta (que es la que coincide con el ID)
            // y la pasamos a otra función llamada 'mostrarRecetaModal' que se encargará de mostrarla en el modal.
            .then(resultado => mostrarRecetaModal(resultado.meals[0]));
    }

    /*
    Esta función se encarga de mostrar una receta específica en un modal (ventana emergente)
    de Bootstrap, presentando la imagen, instrucciones, ingredientes y opciones para guardar o eliminar 
    la receta de los favoritos.
    */
    function mostrarRecetaModal(receta) {
        // Usamos desestructuración para obtener las propiedades que necesitamos de la receta.
        const { idMeal, strInstructions, strMeal, strMealThumb } = receta;

        // Obtenemos los elementos del modal donde se mostrará la receta.
        const modalTitle = document.querySelector('.modal .modal-title');
        const modalBody = document.querySelector('.modal .modal-body');

        // Configuramos el título y contenido principal del modal.
        modalTitle.textContent = strMeal;
        modalBody.innerHTML = `
        <img class="img-fluid" src="${strMealThumb}" alt="receta ${strMeal}" />
        <h3 class="my-3">Instrucciones</h3>
        <p>${strInstructions}</p>
        <h3 class="my-3">Ingredientes y Cantidades</h3>
    `;

        // Creamos una lista para mostrar los ingredientes y sus cantidades.
        const listGroup = document.createElement('UL');
        listGroup.classList.add('list-group');

        // Iteramos hasta 20 veces (el máximo de ingredientes que considera la API)
        for (let i = 1; i <= 20; i++) {
            // Verificamos si existe el ingrediente en el objeto.
            if (receta[`strIngredient${i}`]) {
                const ingrediente = receta[`strIngredient${i}`];
                const cantidad = receta[`strMeasure${i}`];
                const ingredienteLi = document.createElement('LI');
                
                ingredienteLi.classList.add('list-group-item');
                ingredienteLi.textContent = `${ingrediente} - ${cantidad}`
                listGroup.appendChild(ingredienteLi);
            }
        }
        modalBody.appendChild(listGroup);

        const modalFooter = document.querySelector('.modal-footer');
        limpiarHtml(modalFooter);  // Limpiamos el contenido anterior del pie de página del modal.

        // Creación de botones para el pie de página del modal.
        const btnFavorito = document.createElement('BUTTON');
        btnFavorito.classList.add('btn', 'btn-danger', 'col');
        btnFavorito.textContent = existeStorage(idMeal) ? 'Eliminar Favorito' : 'Guardar Favorito';

        // Función que se activa al hacer clic en el botón. Decide si guarda o elimina la receta de favoritos.
        btnFavorito.onclick = function () {
            // Si la receta ya está en favoritos, la eliminamos.
            if (existeStorage(idMeal)) {
                eliminarFavorito(idMeal);
                btnFavorito.textContent = 'Guardar Favorito';
                mostrarToast('Eliminado Correctamente...');
                return;
            }
            // Si no está en favoritos, la agregamos.
            agregarFavorito({
                id: idMeal,
                titulo: strMeal,
                img: strMealThumb
            });
            btnFavorito.textContent = 'Eliminar Favorito';
            mostrarToast('Agregado Correctamente!!');
        }

        const btnCerrarModal = document.createElement('BUTTON');
        btnCerrarModal.classList.add('btn', 'btn-secondary', 'col');
        btnCerrarModal.textContent = 'Cerrar';
        btnCerrarModal.onclick = function () {
            modal.hide();  // Ocultamos el modal.
        }

        // Añadimos los botones al pie de página del modal.
        modalFooter.appendChild(btnFavorito);
        modalFooter.appendChild(btnCerrarModal);

        // Finalmente, mostramos el modal con todo el contenido.
        modal.show();
    }

    // Aquí comenzamos con un grupo de funciones relacionadas con el almacenamiento de recetas favoritas en localStorage.
    // localStorage es una interfaz web que permite almacenar datos clave-valor en un navegador web.

    // Función para añadir una receta a la lista de favoritos.
    function agregarFavorito(receta) {
        // Obtenemos los favoritos actuales de localStorage y los parseamos a un arreglo (si no hay nada, se toma un arreglo vacío).
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];

        // Agregamos la nueva receta a la lista de favoritos y guardamos el arreglo actualizado en localStorage.
        localStorage.setItem('favoritos', JSON.stringify([...favoritos, receta]));
    }

    // Función para eliminar una receta de la lista de favoritos.
    function eliminarFavorito(id) {
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        // Filtramos el arreglo de favoritos para eliminar la receta con el ID especificado.
        const nuevosFavoritos = favoritos.filter(favorito => favorito.id !== id);

        // Guardamos el nuevo arreglo sin la receta eliminada en localStorage.
        localStorage.setItem('favoritos', JSON.stringify(nuevosFavoritos));
    }

    // Función para verificar si una receta ya se encuentra en la lista de favoritos.
    function existeStorage(id) {
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        // Usamos el método "some" para verificar si al menos un elemento cumple con la condición especificada.
        return favoritos.some(favorito => favorito.id === id);
    }

    // Función para mostrar notificaciones (conocidas como toasts) en la interfaz.
    function mostrarToast(mensaje) {
        // Obtenemos el elemento del toast y su cuerpo.
        const toastDiv = document.querySelector('#toast');
        const toastBody = document.querySelector('.toast-body');

        // Creamos una nueva instancia del toast (ventana emergente) usando Bootstrap.
        const toast = new bootstrap.Toast(toastDiv);
        toastBody.textContent = mensaje;  // Configuramos el mensaje del toast.

        // Mostramos el toast en la interfaz.
        toast.show();
    }

    // Función para obtener y mostrar las recetas favoritas desde localStorage.
    function obtenerFavoritos() {
        const favoritos = JSON.parse(localStorage.getItem('favoritos')) ?? [];
        if (favoritos.length) {
            // Si hay favoritos, los mostramos usando la función "mostrarRecetas".
            mostrarRecetas(favoritos);
            return;
        }
        // Si no hay favoritos, mostramos un mensaje en la interfaz.
        const noFavoritos = document.createElement('P');
        noFavoritos.textContent = 'No hay favoritos aún';
        noFavoritos.classList.add('fs-4', 'text-center', 'font-bold', 'mt-5');
        favoritosDiv.appendChild(noFavoritos);
    }

    // Función para limpiar el contenido de un elemento del DOM. Útil para evitar duplicar contenido al insertar.
    function limpiarHtml(selector) {
        // Mientras el elemento tenga hijos, se van eliminando uno por uno.
        while (selector.firstChild) {
            selector.removeChild(selector.firstChild);
        }
    }

}
// Finalmente, un event listener que espera a que el contenido del DOM esté completamente cargado para iniciar la aplicación.
document.addEventListener('DOMContentLoaded', iniciarApp);
