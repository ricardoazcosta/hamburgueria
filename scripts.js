const myObserver = new IntersectionObserver((entries) => {});

const elements = document.querySelectorAll(".elements");
elements.forEach((element) => myObserver.observe(element));

const menu = document.getElementById("menu");
const cartBtn = document.getElementById("cart-btn");
const cartModal = document.getElementById("card-modal");
const cartItemsContainer = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const checkoutBtn = document.getElementById("checkout-btn");
const closedModalBtn = document.getElementById("closed-modal-btn");
const cartCount = document.getElementById("cart-count");
const adrresInput = document.getElementById("adrress");
const adrresWarn = document.getElementById("adrress-warn");
const cep = document.getElementById("cep");
const cepWarn = document.getElementById("cep-warn");
const country = document.getElementById("country");
const number = document.getElementById("number");

let cart = [];

cartBtn.addEventListener("click", function () {
  cartModal.style.display = "flex";
  updateCartModal();
});

const hideCartModal = () => {
  cartModal.style.display = "none";
};

cartModal.addEventListener("click", function (event) {
  if (event.target === cartModal) {
    hideCartModal();
  }
});

closedModalBtn.addEventListener("click", hideCartModal);

menu.addEventListener("click", function (event) {
  let parentButton = event.target.closest(".add-to-cart-btn");
  if (parentButton) {
    const name = parentButton.getAttribute("data-name");
    const price = parseFloat(parentButton.getAttribute("data-price"));
    //add no carrinho
    addToCart(name, price);
    Toastify({
      text: `Produto ${name} foi add ao carrinho`,
      duration: 4000,
      close: true,
      gravity: "top", // `top` or `bottom`
      position: "right", // `left`, `center` or `right`
      stopOnFocus: true, // Prevents dismissing of toast on hover
      style: {
        background: "linear-gradient(to right, #00b09b, #228B22)",
      },
    }).showToast();
  }
});

const addToCart = (name, price) => {
  const existingItem = cart.find((item) => item.name === name);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      name,
      price,
      quantity: 1,
    });
  }
  updateCartModal();
};

const updateCartModal = () => {
  cartItemsContainer.innerHTML = "";
  let total = 0;
  cart.forEach((item) => {
    const cartItemElement = document.createElement("div");
    cartItemElement.classList.add(
      "flex",
      "justify-between",
      "mb-4",
      "flex-col"
    );

    cartItemElement.innerHTML = `
    
    <div class='flex items-center justify-between'>
       <div>
         <p class= 'font-medium text-blue-600'>${item.name}</p>
         <p>Qtd: ${item.quantity}</p>
         <p class= ' text-left font-medium mt-2 text-red-500'>R$ ${item.price}</p>
       </div>
         
        <button class='remove-cart-btn flex items-center gap-1 font-medium text-red-500 px-3 py-2 rounded hover:opacity-80' data-name="${item.name}">Remover <i class="fa-solid fa-trash-can "></i></button>
          
    </div>
    
    `;

    total += item.price * item.quantity;

    cartItemsContainer.appendChild(cartItemElement);
  });

  cartTotal.textContent = total.toLocaleString("pt-br", {
    style: "currency",
    currency: "BRL",
  });

  cartCount.innerHTML = cart.length;
};

cartItemsContainer.addEventListener("click", function (event) {
  if (event.target.classList.contains("remove-cart-btn")) {
    const name = event.target.getAttribute("data-name");
    removeItemCart(name);
  }
});

const removeItemCart = (name) => {
  const index = cart.findIndex((item) => item.name === name);
  if (index !== -1) {
    const item = cart[index];
    if (item.quantity > 1) {
      item.quantity -= 1;
      updateCartModal();
      return;
    }
    cart.splice(index, 1);
    updateCartModal();
  }
};

cep.addEventListener("blur", (infoEvent) => {
  const cep = infoEvent.target.value;

  // if (cep !== "") {
  //   cep.classList.remove("border-red-500");
  //   cepWarn.classList.add("hidden");
  //   if (cep === "") {
  //     cepWarn.classList.remove("hidden");
  //     cep.classList.add("border-red-500");
  //   }
  // }
  fetch(`https://viacep.com.br/ws/${cep}/json/`)
    .then((responseToSever) => {
      return responseToSever.json();
    })
    .then((dadosCep) => {
      console.log(dadosCep);
      country.value = dadosCep.bairro;
      adrresInput.value = dadosCep.logradouro;
    });
});

adrresInput.addEventListener("input", function (event) {
  let inputValue = event.target.value;
  if (inputValue !== "") {
    adrresInput.classList.remove("border-red-500");
    adrresWarn.classList.add("hidden");
  }
});

checkoutBtn.addEventListener("click", function () {
  const isOpen = checkRestaurantOpen();
  if (!isOpen) {
    Toastify({
      text: "Restaurante fechado no momento !!!",
      duration: 3000,
      close: true,
      gravity: "top",
      // `top` or `bottom`
      offset: {
        // horizontal axis - can be a number or a string indicating unity. eg: '2em'
        y: 50, // vertical axis - can be a number or a string indicating unity. eg: '2em'
      },
      position: "center", // `left`, `center` or `right`
      stopOnFocus: true, // Prevents dismissing of toast on hover
      style: {
        background: "linear-gradient(to right, #A52A2A, #DC143C)",
      },
    }).showToast();
    return;
  }
  if (cart.length === 0) return;
  if (adrresInput.value === "") {
    adrresWarn.classList.remove("hidden");
    adrresInput.classList.add("border-red-500");

    if (cep.value === "") {
      cepWarn.classList.remove("hidden");
      cep.classList.add("border-red-500");
    }
    return;
  }

  const cartItems = cart
    .map((item) => {
      return ` ${item.name} Quantidade: (${item.quantity}) Preço: R$ ${item.price} |
      `;
    })
    .join("");
  const message = encodeURIComponent(cartItems);
  const phone = ""; //add n° telefone

  window.open(
    `https://wa.me/${phone}?text=${message} Endereço: ${adrresInput.value}`,
    "_blank"
  );
  cart = [];
  updateCartModal();
});

//verificação de horario aberto
checkRestaurantOpen = () => {
  const data = new Date();
  const hora = data.getHours();
  return hora >= 18 && hora < 23;
};

const spanItem = document.getElementById("hours-open");
const isOpen = checkRestaurantOpen();
const openClosed = document.createElement("div");
openClosed.classList.add("flex", "justify-between", "m-px", "flex-col");
const openClosedText = document.createElement("p");
openClosedText.classList.add(
  "text-lg",
  "font-bold",
  "text-center",
  "text-white"
);
openClosedText.textContent = isOpen ? "Aberto" : "Fechado"; //verificação de horario aberto
spanItem.appendChild(openClosed);
openClosed.appendChild(openClosedText);

if (isOpen) {
  spanItem.classList.remove("bg-red-500");

  spanItem.classList.add("bg-green-500");
} else {
  spanItem.classList.remove("bg-green-500");
  spanItem.classList.add("bg-red-500");
}
