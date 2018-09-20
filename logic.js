const socket = io();

function processForm() {
	let code = document.getElementById("pass").value;
	console.log(code);
	socket.emit('code',code);

	document.getElementById("login").style.display="none";
	document.getElementById("cpaper").style.display="";
	document.getElementById("responses").style.display="";

	return false;
}

function sendResponse(id,success) {
	info = {};
	info.success = success;
	info.id = id;
	socket.emit('response',info);
}

function addPaper() {
	let info = {};
	info.title = document.getElementById("title").value;
	document.getElementById("title").value = '';
	let authors = document.getElementById("authors").value;
	let authorsArray = authors.replace(/\s/g, "").split(",");
	info.authors = authorsArray;
	document.getElementById("authors").value = '';
	info.year = parseInt(document.getElementById("year").value);
	document.getElementById("year").value = '';
	info.journal = document.getElementById("journal").value;
	document.getElementById("journal").value = '';
	info.tweet = document.getElementById("tweet").value;
	document.getElementById("tweet").value = '';
	console.log(info);
	socket.emit('addPaper',info);
	document.getElementById("add-paper").style.display='none';

	return false;
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