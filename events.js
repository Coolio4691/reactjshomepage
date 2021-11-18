document.onmousemove = async e => {
    if(!pageContainer) return;
    
    pageContainer.pages[pageContainer.positionOffset].page.style.backgroundPosition = e.pageX * lookSpeed * -1 / 6 + 'px ' + e.pageY * lookSpeed * -1 / 6 + 'px ';
}

document.addEventListener("wheel", e => {
    changePage(e.deltaY, "move")
})

document.addEventListener("keydown", e => {
    if(e.key == "PageDown") {
        e.preventDefault()

        changePage(1, "move")
    }
    else if(e.key == "PageUp") {
        e.preventDefault()

        changePage(-1, "move")
    }

    if(e.key == "Home") {
        e.preventDefault()

        changePage(0, "set")
    }
    else if(e.key == "End") {
        e.preventDefault()

        changePage(pageContainer.pages.length - 1, "set")
    }

    console.log(e)
})

document.addEventListener("click", e => {
    if(document.getElementById("weather").classList.contains("mvDown")) {
        var a = e.target;
        var found = false
        while (a) {
            if(a.id == "weather") {
                found = true;
                break
            }
            a = a.parentNode;
        }

        if(!found) {
            document.getElementById("weather").classList.remove("mvDown");
            document.getElementById("weatherBox").style.pointerEvents = "none";
        }
    }
    if(e.target.id == "weatherText") {
        if(document.getElementById("weather").classList.contains("mvDown")) {
            document.getElementById("weather").classList.remove("mvDown");
            document.getElementById("weatherBox").style.pointerEvents = "none";
        }
        else {
            document.getElementById("weather").classList.add("mvDown");
            document.getElementById("weatherBox").style.pointerEvents = "auto";
        }
    }

});