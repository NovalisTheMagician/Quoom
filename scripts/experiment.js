const TOOLBAR_HEIGHT = 36;
const STATUSBAR_HEIGHT = 16;

let toolbarElement = document.getElementById("toolbar");
let statusbarElement = document.getElementById("statusbar");
let canvasElement = document.getElementById("workarea");

let modeElement = document.getElementById("editmode");
let gridsizeElement = document.getElementById("gridsize");
let zoomlevelElement = document.getElementById("zoomlevel");
let zoomstepElement = document.getElementById("zoomstep");
let vpcenterxElement = document.getElementById("vpcenterx");
let vpcenteryElement = document.getElementById("vpcentery");
let mousexElement = document.getElementById("mousex");
let mouseyElement = document.getElementById("mousey");

let windowWidth = window.innerWidth;
let windowHeight = window.innerHeight;

let editor = new Editor(canvasElement);

resizeElements();

window.onkeydown = function(ev) {
	ev.preventDefault();
	
	editor.onKeyDown(ev);
	
	updateStatusbarValues();
	
	return false;
}

window.onkeyup = function(ev) {
	ev.preventDefault();
	
	editor.onKeyUp(ev);
	
	updateStatusbarValues();
	
	return false;
}

canvasElement.onmousedown = function(ev) {
	ev.preventDefault();
	
	editor.onMouseDown(ev);
	
	updateStatusbarValues();
}

canvasElement.onmouseup = function(ev) {
	ev.preventDefault();
	
	editor.onMouseUp(ev);
	
	updateStatusbarValues();
}

let oldMousePos = { x: 0, y: 0};
canvasElement.onmousemove = function(ev) {
	ev.preventDefault();
	
	let mousePos = { x: ev.clientX, y: ev.clientY};
	
	let mouseDelta = { x: mousePos.x - oldMousePos.x, y: mousePos.y - oldMousePos.y};
	ev.delta = mouseDelta;
	
	editor.onMouseMove(ev);
	
	oldMousePos.x = mousePos.x;
	oldMousePos.y = mousePos.y;
	
	updateStatusbarValues();
}

canvasElement.onmousewheel = function(ev) {
	ev.preventDefault();
	
	editor.onMouseWheel(ev);
	
	updateStatusbarValues();
}

function updateStatusbarValues() {
	modeElement.innerHTML = editor.getEditMode();
	
	gridsizeElement.innerHTML = editor.getGridSize();
	
	zoomlevelElement.innerHTML = editor.getZoom().toFixed(1);
	zoomstepElement.innerHTML = editor.getZoomStep().toFixed(1);
	
	let viewportCenter = editor.viewportCenter;
	
	vpcenterxElement.innerHTML = viewportCenter.x.toFixed(1);
	vpcenteryElement.innerHTML = viewportCenter.y.toFixed(1);
	
	mousexElement.innerHTML = editor.getMousePos().x.toFixed(1);
	mouseyElement.innerHTML = editor.getMousePos().y.toFixed(1);
}

function resizeElements() {
	toolbarElement.style.width = windowWidth + "px";
	toolbarElement.style.height = TOOLBAR_HEIGHT + "px";
	
	let workWidth = windowWidth;
	let workHeight = windowHeight - TOOLBAR_HEIGHT - STATUSBAR_HEIGHT;
	canvasElement.style.width = workWidth + "px";
	canvasElement.style.height = workHeight + "px";
	canvasElement.style.top = TOOLBAR_HEIGHT + "px";
	canvasElement.width = workWidth;
	canvasElement.height = workHeight;
	
	statusbarElement.style.width = windowWidth + "px";
	statusbarElement.style.height = STATUSBAR_HEIGHT + "px";
	
	editor.onResize(canvasElement.width, canvasElement.height);
	
	updateStatusbarValues();
}

window.onresize = function() {
	windowWidth = window.innerWidth;
	windowHeight = window.innerHeight;
	
	resizeElements();
}