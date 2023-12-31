const menuItems = [
    { label: "Home", link: "index.html" },
    { label: "Ricerca", link: "ricerca.html" },
    { label: "Scheda Film", link: "scheda-film.html?id_film=502356" },
    { label: "Scheda Attore", link: "scheda-attore.html?id_attore=502356" },
]

var dropdown = "<div></div>"
if(localStorage.getItem('user') != null){
    var user = JSON.parse(localStorage.getItem('user'))
    console.log(localStorage.getItem('user'))
    console.log(user)
    menuItems.push({label: `Preferiti`, link: "preferiti.html"})
    var dropdown = `
        <div class="d-flex text-light">
            <ul class="navbar-nav text-light">
                <li class="nav-item dropdown">
                    <button class="btn dropdown-toggle" data-bs-toggle="dropdown">
                        Benvenuto ${user.name}
                    </button>
                    <ul class="dropdown-menu">
                        <li>
                            <a class="dropdown-item" href="#" onclick="logout()">Logout</a>
                        </li>
                
                    </ul>

                </li>
            </ul>
        </div>
        `;

}





var menuHTML = "";

for (let i = 0; i < menuItems.length; i++) {
    let item = menuItems[i];
    menuHTML += `<li class="nav-item"><a class="nav-link text-light" href="${item.link}">${item.label}</a></li>`;
}
function logout(){
    localStorage.removeItem("user");
    window.location.href = "index.html"
}
const menuElement = document.getElementById('menu');
menuElement.innerHTML = `
<nav class="navbar navbar-expand-md bg-dark ">
        <div class="container-fluid ">
            <a class="navbar-brand text-light" href="#">Movie</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
                aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse text-light" id="navbarNav">
                <ul class="navbar-nav text-light">
                    ${menuHTML}

                </ul>
                ${dropdown}
            </div>
        
           
           
        </div>
    </nav>
`;
 