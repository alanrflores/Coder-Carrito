//Guardo los id del html -- para poder manipularlos en js.
const cards = document.getElementById("cards");
const items = document.getElementById("items");
const footer = document.getElementById("footer");
const templateCarrito = document.getElementById("template-carrito").content;
const templateFooter = document.getElementById("template-footer").content;
const templateCard= document.getElementById("template-card").content;
//Utilizamos el .content para acceder al elemento template-card

const fragment = document.createDocumentFragment();
//Creamos un fragment, memoria volatil, se disuelve. Por eso no se genera ese REFLOW 
//1 -FRAGMENT PARA TODO LO QUE QUERRAMOS HACER-
//EJECUTAR EL FetchData en el HTML//
//AddEvenListener - va a esperar a que se LEA todo nuestro HTML y luego va a ejecute nuestras funciónes//
//DOMContentLoaded - se dispara cuando nuestro documento HTML ha sido cargado y parseado//
//Variable carrito para que sea una coleccion de objetos--
let carrito = {};
//La coleccion de objetos no va a estar vacia, una vez que se carga el sitio web (DOMContentloaded),
//que leemos los productos (fetchData) podemos hacer la pregunta de LocalStorage con IF.
// Eventos
// El evento DOMContentLoaded es disparado cuando el documento HTML ha sido completamente cargado y parseado
document.addEventListener("DOMContentLoaded", ()=>{
    fetchData();
 //.getItem() interfaz de storage, cuando se le pasa un nombre clave,devolvera el valor de esa clave.
 //JSON.parse-- analiza una cadena JSON. construyendo el valor u objeto Javascript descrito por la cadena.
//'carrito' es la llave.(Key) si existiera, nosotros en carrito= que es nuestra coleccion de objetos
 //Llenamos con esa informacion que viene del localStorage.
    if(localStorage.getItem('carrito')){
carrito =JSON.parse(localStorage.getItem('carrito'))
    }
});
//En cards se detecta un click, se utiliza el (e) para capturar ese mismo elemento que queremos modificar//
cards.addEventListener("click", e => {
    addCarrito(e);
});

items.addEventListener("click", e => {
    btnAccion(e);
});





// Traer productos
const fetchData = async () => {
    try{
       const res = await fetch('api.json');
       const data = await res.json();
       pintarCards(data);
    }
    catch (error){
     console.log(error);
    }
}
//Utilizo el forEach para recorrer esa api que esta en formato JSON//
//Devuelve un duplicado del nodo en el que este metodo es llamado
//Utilizo appendChild - para agregar un nuevo nodo al final de la lista de un elemento hijo de un elemento padre especificado
//Pintar productos
const pintarCards = data => {
 data.forEach(item => {
    const clone = templateCard.cloneNode(true);
    clone.querySelector('h5').textContent = item.title;
    clone.querySelector('p').textContent = item.precio;
    clone.querySelector('img').setAttribute("src", item.thumbnailUrl);
    clone.querySelector('button').dataset.id = item.id;

    fragment.appendChild(clone);
  })
  cards.appendChild(fragment);
}
//addCarrito captura la e , utilizo el e.target para la delegacion del evento
//addCarrito es el evento que creamos en cards, nosotros lo ejecutamos cuando presionamos el click,
//y mandamos todo ese elemento padre a setCarrito.
//Agregar al carrito
const addCarrito = e => {
// console.log(e.target);
// console.log(e.target.classList.contains("btn-dark"));
//Preuntamos si el elemento que le estamos haciendo click,
//contiene la clase que nosotros le pasamos dentro del parentesis(devuelve un valor booleano) que es TRUE.
//Ejecutamos una accion con if (que es agregar la info al carrito)
    
    if(e.target.classList.contains("btn-dark")){
      setCarrito(e.target.parentElement);
    }
//stopPropagation es para detener cualquier otro evento que se podia generar en nuestros cards.
//Por que se heredan los eventos del contenedor padre.
    e.stopPropagation();
}
//Funcion para manipular nuestro objeto de carro--Este objeto son todos los elementos seleccionados
//Apreto el boton comprar voy a selecc. todos los elementos,esos mismos los voy a empujar a esta funcion.
//Captura esos elementos de addCarrito
const setCarrito = item => {;
  const producto = {
      id: item.querySelector('button').dataset.id,
      title: item.querySelector('h5').textContent,
      precio: item.querySelector('p').textContent,
      cantidad: 1
  };
  //hasOwnProperty(prop) devuelve un valor booleano indicando si el objeto tiene la propiedad especificada
  //si esto existe , quiero decir que el producto(item) se duplique para aumentar la cantidad
  //solo accedemos al item(elemento) que se esta repitiendo y ahi le aumentamos la cantidad.
  //carrito es nuestra colecc. de objetos, una vez que accedemos, es solamente a la cantidad y le aumentamos 1
  if(carrito.hasOwnProperty(producto.id)){
   producto.cantidad = carrito[producto.id].cantidad + 1 
   
  }
  //Tengo el objeto item creado, lo al carrito. su propiedad [] indexeado
  carrito[producto.id] = { ...producto };
  pintarCarrito();
  //[item.id] Creo el INDEX con esto, si no existe lo crea igual pero si existe  lo va a sobreescribir--
  //{...item}-Copia de item, ... Spread Operation con eso estamos adquiriendo una copia de informacion de item.
}
//Pintamos carrito
const pintarCarrito = () => {
//Recorro el objeto carrito con un forEach, pero antes de eso tengo que hacer Object.values
//Por que antes estamos trabajando con un objeto y no se puede modificar un obj o no se puede ocupar
//las funciones de los Arrays, utilizando .values la podemos ocupar.
//Con innerHTML -- Limpiariamos nuestro HTML y partiria vacio.(se reinicia)
items.innerHTML = "";
Object.values(carrito).forEach(producto => {
    templateCarrito.querySelector('th').textContent = producto.id;
    //Utilizo querySelectorAll ya que hay mas de 1 etiquetas "td" y es un ARRAYS ,los ubico por su indice.
    templateCarrito.querySelectorAll('td')[0].textContent = producto.title;
    templateCarrito.querySelectorAll('td')[1].textContent = producto.cantidad;
    //Botones
    templateCarrito.querySelector('.btn-info').dataset.id = producto.id;
    templateCarrito.querySelector('.btn-danger').dataset.id = producto.id;
    //Cada vez que se aumente la cantidad, lo multiplicamos por su precio. Asi nos da el TOTAL.
    templateCarrito.querySelector('span').textContent = producto.cantidad * producto.precio;


    const clone = templateCarrito.cloneNode(true);
    fragment.appendChild(clone);
})    
//Fuera del forEach 
    items.appendChild(fragment);

    pintarFooter();

    localStorage.setItem('carrito', JSON.stringify(carrito));
}
//Pintamos footer
const pintarFooter = () => {
footer.innerHTML = "";
//object.keys devuelve una matriz de los nombres de propiedad enumerables propios de un objeto determinado.
//Decimos que en el if-- si lo que tiene carrito y sus elementos es igual a 0 devolveme lo de abajo.
if(Object.keys(carrito).length === 0){
    footer.innerHTML = `
    <th scope="row" colspan="5">Carrito vacío - comience a comprar!</th>
 `
//Si no estuviera el return seguiria haciendo la operacion de abajo, con el mismo se sale de la funcion.
// Y no lo va a seguir leyendo.
 return;
}
//Carrito -- es una coleccion de objetos no podemos utilizar todas las funcionalidades del arrays --
//En cambio utilizando object.values si podemos.
//Reduce -- toma una funcion de flecha, y nosotros vamos a recorrer dentro de nuestra coleccion de obj.
//Vamos a usar un acumulador (acc) que vaya por cada iteracion acumulando lo que nosotros hagamos como suma
//Acumulamos la cantidad y asi seguir la 2da vuelta y etc.
//pero para hacer la suma necesitamos acceder a la cantidad.
//lo que vamos a devolver es un numero por eso ponemos 0
//Sumar cantidad y sumar totales
const nCantidad = Object.values(carrito).reduce((acc, {cantidad})=> acc + cantidad,0);
const nPrecio = Object.values(carrito).reduce((acc, {cantidad, precio})=> acc + cantidad * precio,0);

//Accedemos al DOM
templateFooter.querySelectorAll('td')[0].textContent = nCantidad;
templateFooter.querySelector('span').textContent = nPrecio;

const clone = templateFooter.cloneNode(true);
fragment.appendChild(clone);
//Como esto no es un ciclo lo agregamos aca
footer.appendChild(fragment);

//Botones
const btnVaciar = document.getElementById('vaciar-carrito')
btnVaciar.addEventListener('click', () =>{
    carrito = {};
    pintarCarrito();
});

const btnFinalizar = document.getElementById("finalizarCompra")
btnFinalizar.addEventListener('click', () =>{
   
    Swal.fire(
        'Good job!',
        'You clicked the button!',
        'success'
      )
});

};
//Botones
const btnAccion = e => {
    //Acccion de aumentar
    if(e.target.classList.contains('btn-info')){
        //accedemos a dataset
    const producto = carrito[e.target.dataset.id]
    producto.cantidad++;
    carrito[e.target.dataset.id] = { ...producto };
    pintarCarrito();
    }

    if(e.target.classList.contains('btn-danger')){
    const producto = carrito[e.target.dataset.id]
    producto.cantidad--;
    pintarCarrito();
    if(producto.cantidad === 0){
        delete carrito[e.target.dataset.id];
    }
}
   e.stopPropagation();
};
