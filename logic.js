const socket = io();

function processForm() {
	let code = document.getElementById("pass").value;
	console.log(code);
	socket.emit('code',code);

	document.getElementById("login-form").style.display="none";
	document.getElementById("cpaper").style.display="";
	document.getElementById("responses").style.display="";

	return false;
}

function addPaper() {
	let title = document.getElementById("title").value;
	document.getElementById("title").value = '';
}


function openModal(id) {
	console.log('Opening: ' + id);
	document.getElementById(id).style.display='block';
}

window.onclick = function(event) { closeCheck(event); }
window.ontouchstart = function(event) {closeCheck(event); }

function closeCheck(event) {
	target = event.target;
	if ((event.target.className == "close") || (event.target.className== "modal-content-big")) {
    	// chain parentElements until you find the modal
    	var parent = event.target.parentElement;
    	while (parent.className!="modal") {
    		parent = parent.parentElement;
    	}
    	parent.style.display = "none";
    }
    if (event.target.className == "modal") {
    	event.target.style.display = "none";
    }
}