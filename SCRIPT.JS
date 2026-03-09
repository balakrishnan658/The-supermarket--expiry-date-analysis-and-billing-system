function showToast(message, color = "#323232") {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.style.backgroundColor = color;
  toast.style.display = "block";

  setTimeout(() => {
    toast.style.display = "none";
  }, 3000);
}// ===== LOGIN / SIGNUP =====
function signup() {
    const user = document.getElementById("username").value;
    const pass = document.getElementById("password").value;
  
    if (user && pass) {
      localStorage.setItem("user_" + user, pass);
      showToast("✅ Signup successful!");
    } else {
      showToast("⚠️ Please enter both fields");
    }
  }


  
  function login() {
    const user = document.getElementById("username").value;
    const pass = document.getElementById("password").value;
    const storedPass = localStorage.getItem("user_" + user);
  
    if (pass === storedPass) {
      showToast("Login successful!");
      window.location.href = "dashboard.html";
      
    } else {
      showToast("❌ Invalid credentials");
    }
  }

  
  
  
  
  // ===== DASHBOARD LOGIC =====
  function showSection(section) {
    document.getElementById("section-add").style.display = "none";
    document.getElementById("section-view").style.display = "none";
    document.getElementById("section-billing").style.display = "none";
    document.getElementById("section-summary").style.display = "none";
  
    document.getElementById("section-" + section).style.display = "block";
  
    if (section === "view") displayProducts();
    if (section === "billing") displayBilling();
    if (section === "summary") displaySummary();
  }
  
  // Add Product
  function addProduct() {
    const name = document.getElementById("add-name").value;
    const id = document.getElementById("add-id").value;
    const price = parseFloat(document.getElementById("add-price").value);
    const qty = parseInt(document.getElementById("add-qty").value);
    const expiry = document.getElementById("add-expiry").value;
  
    if (!name ||!id|| !price || !qty || !expiry) {
      showToast("Please fill all product fields");
      return;
    }
  
    const product = { name,id, price, qty, expiry };
    const products = JSON.parse(localStorage.getItem("products")) || [];
    products.push(product);
    localStorage.setItem("products", JSON.stringify(products));
    showToast("Product added!");
  
    checkExpiry(product);
  
    document.querySelectorAll("#add-name,#add-id, #add-price, #add-qty, #add-expiry").forEach(input => input.value = "");
  }
  
  
  // Edit Product 
 
function editProduct(index) {
  const products = JSON.parse(localStorage.getItem("products")) || [];
  const product = products[index];

  
  const name = prompt("Edit product name:", product.name);
  const id = parseInt(prompt("Edit id:", product.id));
  const price = parseFloat(prompt("Edit price:", product.price));
  const qty = parseInt(prompt("Edit quantity:", product.qty));
  const expiry = prompt("Edit expiry date (YYYY-MM-DD):", product.expiry);

  if ( !name ||isNaN(id) || isNaN(price) || isNaN(qty) || !expiry) {
    showToast("Invalid input. Edit cancelled.");
    return;
  }

  products[index] = {name, id , price, qty, expiry };
  localStorage.setItem("products", JSON.stringify(products));
  displayProducts();
  showToast("Product updated!");
}




  
  // Delete Product
  function deleteProduct(index) {
    const products = JSON.parse(localStorage.getItem("products"));
    products.splice(index, 1);
    localStorage.setItem("products", JSON.stringify(products));
    displayProducts(); // Refresh the list
    showToast(" product deleted")
  }
  
  // Display product
    
    function displayProducts() {
      const list = document.getElementById("product-list");
      if (!list) return;
    
      const products = JSON.parse(localStorage.getItem("products")) || [];
      list.innerHTML = "";
    
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normalize time
    
      products.forEach((product, index) => {
        const expiryDate = new Date(product.expiry);
        expiryDate.setHours(0, 0, 0, 0);
    
        const timeDiff = expiryDate - today;
        const daysUntilExpiry = timeDiff / (1000 * 60 * 60 * 24);
    
        let status = "OK";
        let color = "green";
    
        if (expiryDate < today) {
          status = "Expired";
          color = "red";
        } else if (daysUntilExpiry <= 7) {
          status = "Expiring Soon";
          color = "#ffcc00"; // Bright yellow for visibility
        }
       
    
        const row = document.createElement("tr");
        row.innerHTML = `
           <td>${product.id}</td>
           <td>${product.name}</td>
          <td>₹${product.price}</td>
          <td>${product.qty}</td>
          <td>${product.expiry}</td>
          <td style="background-color:${color}; font-weight:bold;">${status}</td>
          <td>
            <button onclick="editProduct(${index})">✏️</button>
            <button onclick="deleteProduct(${index})">🗑️</button>
          </td>
        `;
        list.appendChild(row);
      });
    }
    
    
 // Billing Section
 let billedItems = [];
function searchProduct() {
  const searchTerm = document.getElementById("search-box").value.toLowerCase();
  const resultsList = document.getElementById("search-results");
  const products = JSON.parse(localStorage.getItem("products")) || [];
  resultsList.innerHTML = "";

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm) ||
    p.id.toString().toLowerCase().includes(searchTerm) // check id match too
  );

  if (filteredProducts.length === 0) {
    resultsList.innerHTML = "<li>No matching products found.</li>";
    return;
  }

  filteredProducts.forEach((product, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${product.name} (ID: ${product.id}) - ₹${product.price} <br/>
      Quantity: <input type="number" id="qty-${index}" min="1" value="1" style="width:60px;" />
      <button onclick='billProduct(${JSON.stringify(product)}, ${index})'>🧾 Bill</button>
    `;
    resultsList.appendChild(li);
  });
}
function billProduct(product, index) {
  const qtyInput = document.getElementById(`qty-${index}`);
  const quantity = parseInt(qtyInput.value) || 1;
  const total = product.price * quantity;


  // Add to billed items
  billedItems.push({
    name: product.name,
    price: product.price,
    quantity: quantity,
    total: total
  });

  // Rebuild bill section
  const billingSection = document.getElementById("billing-section");
  billingSection.innerHTML = "";

  let grandTotal = 0;

  billedItems.forEach(item => {
    const itemLine = document.createElement("p");
    itemLine.textContent = `${item.name} - ₹${item.price} x ${item.quantity} = ₹${item.total}`;
    billingSection.appendChild(itemLine);
    grandTotal += item.total;
  });

  const totalLine = document.createElement("p");
  totalLine.innerHTML = `<strong>Total: ₹${grandTotal}</strong>`;
  billingSection.appendChild(totalLine);
}

function clearBill() {
  billedItems = [];
  document.getElementById("billing-section").innerHTML = "";
}

  // Expiry Alert
  function checkExpiry(item) {
    const expiryDate = new Date(item.expiry);
    const today = new Date();
    const diffDays = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
  
    if (diffDays <= 7 && diffDays >= 0) {
      showToast(`⚠️ Alert: ${item.name} expires in ${diffDays} day(s)!`);
    }
  }
  
  // Dashboard Summary
  function displaySummary() {
    const products = JSON.parse(localStorage.getItem("products")) || [];
    const totalProducts = products.length;
    let totalValue = 0;
    let  soonExpiring  = 0;
  
    products.forEach(p => {
      totalValue += p.price * p.qty;
      const expiryDate = new Date(p.expiry);
      const today = new Date();
      const diffDays = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
      if (diffDays <= 30&& diffDays >= 0) soonExpiring++;
    });
    
    document.getElementById("total-products").textContent = totalProducts;
    document.getElementById("inventory-value").textContent = totalValue;
    document.getElementById("soon-expiring").textContent = soonExpiring;
  }
 
  
  
  // Logout Functionality
  function logout() {
    showToast("You have been logged out.");
    window.location.href = "index.html";
  }
  
  // Dark Mode Toggle
  function DarkMode() {
    document.body.classList.toggle("dark");
  }
  
  // Product Search Filter
  
  function filterProducts() {
  const searchTerm = document.getElementById("search").value.toLowerCase();
  const products = JSON.parse(localStorage.getItem("products")) || [];

  const filteredProducts = products.filter(p =>
    p.id.toString().toLowerCase().includes(searchTerm) ||
    p.name.toLowerCase().includes(searchTerm)
  );

  const list = document.getElementById("product-list");
  list.innerHTML = "";

  filteredProducts.forEach((product, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${product.id} - ${product.name} - ₹${product.price} x ${product.qty} (Expires: ${product.expiry})
      <button onclick="deleteProduct(${index})">🗑 Delete</button>
      <button onclick="editProduct(${index})">🖊 Edit</button>
    `;
    list.appendChild(li);
  });
}


 //csv 
function exportCSV() {
    const products = JSON.parse(localStorage.getItem("products")) || [];
    const rows = [["Name", "Price", "Qty", "Expiry"]];
    products.forEach(p => rows.push([p.name, p.price, p.qty, p.expiry]));
  
    let csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "products.csv");
    document.body.appendChild(link);
    link.click();
  }
  
  