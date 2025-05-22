// JavaScript for Navigation
function navigate(page) {
    window.location.href = page;
}

// Highlight Active Page
function setActivePage() {
    let currentPage = window.location.pathname.split("/").pop();
    let links = document.querySelectorAll(".nav-item .nav-link");
    links.forEach(link => {
        if (link.getAttribute("onclick").includes(currentPage)) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }
    });
}

document.addEventListener("DOMContentLoaded", setActivePage);
