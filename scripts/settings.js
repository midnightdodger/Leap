let closed = 1;
function menu(){
    let menu = document.getElementById("settings")
    if (closed === 1){
        menu.style.left = "2%"
        closed = 0;
    } else {
        menu.style.left = "-20%"
        closed = 1;
    }
}

