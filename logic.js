const socket = io();

function processForm() {
	let code = document.getElementById("pass").value;
	console.log(code);
	io.emit('code',code);

	document.getElementById("login-form").style.display="none";
	document.getElementById("cpaper").style.display="";
	document.getElementById("responses").style.display="";

	return false;
}