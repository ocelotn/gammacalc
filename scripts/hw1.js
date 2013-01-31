//Auth Lara Ortiz de Montellano, 17/1/2012, CNIT133 Assignment 1
//Updated 27/1/2012 for Assignment 2;

function smallify(){
	if (window.innerWidth < 1280 || document.body.clientWidth < 1280 || document.innerHeight < 1024 || document.body.clientWidth < 1024){
		document.getElementsByTagName('body')[0].className+='smaller';
	}
}

function togglesheet(){
	var sheet = document.getElementsByTagName('link')[0];
	
	if (sheet.getAttribute('href') == 'cnit133m.css'){
		sheet.setAttribute('href', 'cnit133mb.css');
		//document.getElementsById('#html5er').setAttribute('src','scripts/html5.js');

	} else {
		sheet.setAttribute('href', 'cnit133m.css');
	}
}
