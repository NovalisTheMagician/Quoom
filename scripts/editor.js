var Constants = {
	ToolMode: {
		VIEWPORT: 'VIEWPORT',
		VERTEX: 'VERTEX',
		EDGE: 'EDGE',
		SECTOR: 'SECTOR',
		SECTOR_LIGHT: 'SECLIGHT'
	},
	
	EditMode: {
		Vertex: {
			ADD: 'add',
			MODIFY: 'modify'
		},
		Edge: {
			ADD: 'add',
		},
		Sector: {
		},
		SELECT: 'select',
	},
	
	MINZOOM: 0.1,
	MAXZOOM: 100,
	
	UNITSIZE: 16
};

var Util = {
	pixelToWorldunit: function (pixel) {
		return pixel / Constants.UNITSIZE;
	},
	
	worldunitToPixel: function (worldunit) {
		return Constants.UNITSIZE * worldunit;
	},
	
	toRadians: function (degrees) {
		return degrees * (Math.PI / 180);
	},
	
	toDegrees: function (radians) {
		return radians * (180 / Math.PI);
	},
	
	convertMouseToWorld: function (mouseEvent, viewport) {
		let worldMouseX = Util.pixelToWorldunit(mouseEvent.clientX);
		let worldMouseY = Util.pixelToWorldunit(mouseEvent.clientY);
		
		let vpx = viewport.x;
		let vpy = viewport.y;
		let vpw = viewport.width;
		let vph = viewport.height;
		
		mouseEvent.worldX = worldMouseX - (vpw / 2.0) + (vpx + vpw / 2);
		mouseEvent.worldY = worldMouseY - (vph / 2.0) + (vpy + vph / 2);
	}
};

class Editor {
	constructor(canvasElement) {
		this.ctx = canvasElement.getContext("2d");
		
		this.canvasElement = canvasElement;
		
		let width = Util.pixelToWorldunit(canvasElement.width);
		let height = Util.pixelToWorldunit(canvasElement.height);
		
		this.viewport = { x: -width/2, y: -height/2, width: width, height: height};
		this.origViewport = { x: -width/2, y: -height/2, width: width, height: height};
		
		this.currentToolMode = Constants.ToolMode.VERTEX;
		this.previousToolMode = Constants.ToolMode.VERTEX;
		
		this.currentEditMode = Constants.EditMode.SELECT;
		
		this.gridSize = Constants.UNITSIZE;
		
		this.mousePos = { x: 0, y: 0};
		this.mouseDrag = false;
		
		this.zoom = 1.0;
		this.zoomStep = 0.1;
		
		this.canvasWidth = canvasElement.width;
		this.canvasHeight = canvasElement.height;
		
		this.selections = [];
		
		this.things = [];
		this.vertices = [];
		this.edges = [];
		this.sector = [];
		
		this.pixelOffset = { x: this.canvasWidth / 2, y: this.canvasHeight / 2};
	}
	
	get viewportCenter() {
		let vpx = this.viewport.x;
		let vpy = this.viewport.y;
		let vpw = this.viewport.width;
		let vph = this.viewport.height;
		
		return { x: vpx + vpw / 2.0, y: vpy + vph / 2.0};
	}
	
	set viewportCenter(location) {
		if(location.x === null || location.y === null)
			return;
		
		this.viewport.x = location.x - viewport.width / 2;
		this.viewport.y = location.y - viewport.height / 2;
	}
	
	getToolMode() {
		return this.currentToolMode;
	}
	
	getEditMode() {
		return this.currentEditMode;
	}
	
	getGridSize() {
		return this.gridSize;
	}
	
	getZoom() {
		return this.zoom;
	}
	
	getMousePos() {
		return this.mousePos;
	}
	
	moveViewport(deltaPos) {
		if(deltaPos.x === null || deltaPos.y === null)
			return;
		
		this.viewport.x += Util.pixelToWorldunit(-deltaPos.x);
		this.viewport.y += Util.pixelToWorldunit(-deltaPos.y);
	}
	
	drawHelper() {
		if(this.currentToolMode === Constants.ToolMode.VIEWPORT) {
			let centerPixel = { x: this.canvasWidth / 2,
								y: this.canvasHeight / 2};
			
			this.ctx.lineWidth = 3;
			this.ctx.strokeStyle = '#ffdd00';
			this.ctx.beginPath();
			this.ctx.moveTo(centerPixel.x, centerPixel.y - 10);
			this.ctx.lineTo(centerPixel.x, centerPixel.y + 10);
			this.ctx.moveTo(centerPixel.x - 10, centerPixel.y);
			this.ctx.lineTo(centerPixel.x + 10, centerPixel.y);
			this.ctx.stroke();
		}
	}
	
	drawThings() {
		this.ctx.fillStyle = '#00EF0F';
		this.ctx.beginPath();
		for(let thing of this.things) {
			let radius = 5;
			let x = (Util.worldunitToPixel(thing.x));
			let y = (Util.worldunitToPixel(thing.y));
			
			this.ctx.arc(x, y, raduis, 0, Math.PI, false);
		}
		
		this.ctx.fill;
	}
	
	drawLevel() {
		this.ctx.fillStyle = '#982002';
		for(let vertex of this.vertices) {
			let width = 10;
			let height = 10;
			
			let worldX = vertex.x - this.viewport.x;
			let worldY = vertex.y - this.viewport.y;
			
			let x = (Util.worldunitToPixel(worldX));
			let y = (Util.worldunitToPixel(worldY));
			
			this.ctx.fillRect(x, y, width, height);
		}
	}
	
	drawGrid() {
		let width = Util.worldunitToPixel(this.viewport.width);
		let height = Util.worldunitToPixel(this.viewport.height);
		
		let viewportX = Util.worldunitToPixel(this.viewportCenter.x);
		let viewportY = Util.worldunitToPixel(this.viewportCenter.y);
		
		let offsetX = viewportX % this.gridSize;
		let offsetY = viewportY % this.gridSize;
		
		this.ctx.lineWidth = 1;
		
		this.ctx.fillStyle = '#0048ba';
		this.ctx.fillRect(0, 0, width, height);
		
		this.ctx.strokeStyle = '#1159cb';
		this.ctx.beginPath();
		
		for(let y = -offsetY; y < height; y += this.gridSize) {
			for(let x = -offsetX; x < width; x += this.gridSize) {
				this.ctx.moveTo(x, 0);
				this.ctx.lineTo(x, height);
				
				this.ctx.moveTo(0, y);
				this.ctx.lineTo(width, y);
			}
		}
		
		//this.ctx.closePath();
		this.ctx.stroke();
	}
	
	redraw() {
		this.drawGrid();
		this.drawLevel();
		this.drawThings();
		this.drawHelper();
	}
	
	addVertex(location, snapToGrid) {
		let position = { x: location.x, y: location.y};
		if(snapToGrid) {
			position.x = Math.round(position.x);
			position.y = Math.round(position.y);
		}
		
		this.vertices.push(position);
	}
	
	addEgde() {
		
	}
	
	changeMode(toMode) {
		this.previousToolMode = this.currentToolMode;
		this.currentToolMode = toMode;
		
		this.currentEditMode = Constants.EditMode.SElECT;
	}
	
	onResize(newWidth, newHeight) {
		let worldWidth = Util.pixelToWorldunit(newWidth);
		let worldHeight = Util.pixelToWorldunit(newHeight);
		
		let diff = { w: worldWidth - this.viewport.width, h: worldHeight - this.viewport.height};
		
		this.viewport.width = worldWidth;
		this.viewport.height = worldHeight;
		
		this.viewport.x -= diff.w / 2;
		this.viewport.y -= diff.h / 2;
		
		this.origViewport.x = this.viewport.x;
		this.origViewport.y = this.viewport.y;
		this.origViewport.width = this.viewport.width;
		this.origViewport.height = this.viewport.height;
		
		this.canvasWidth = newWidth;
		this.canvasHeight = newHeight;
		
		this.pixelOffset.x = this.canvasWidth / 2;
		this.pixelOffset.y = this.canvasHeight / 2;
		
		this.redraw();
	}
	
	onMouseDown(ev) {
		Util.convertMouseToWorld(ev, this.viewport);
		
		if(ev.button === 0) {
			if(this.currentToolMode === Constants.ToolMode.VIEWPORT) {
				this.mouseDrag = true;
			}
			else if(this.currentToolMode === Constants.ToolMode.VERTEX) {
				if(this.currentEditMode === Constants.EditMode.Vertex.ADD) {
					this.addVertex({ x: ev.worldX, y: ev.worldY}, ev.shiftKey);
					this.redraw();
				}
			}
		}
	}
	
	onMouseUp(ev) {
		//Util.convertMouseToWorld(ev, this.viewport);
		
		if(ev.button === 0) {
			this.mouseDrag = false;
		}
	}
	
	onMouseMove(ev) {
		Util.convertMouseToWorld(ev, this.viewport);
		
		this.mousePos.x = ev.worldX;
		this.mousePos.y = ev.worldY;
		
		if(this.mouseDrag) {
			this.moveViewport(ev.delta);
			this.redraw();
		}
	}
	
	onMouseWheel(ev) {
		let delta = ev.wheelDelta > 1 ? 1 : ev.wheelDelta < -1 ? -1 : 0;
		
		if(this.currentToolMode === Constants.ToolMode.VIEWPORT) {
			this.zoom += delta * this.zoomStep;
			this.zoom = this.zoom < Constants.MINZOOM ? Constants.MINZOOM : this.zoom > Constants.MAXZOOM ? Constants.MAXZOOM : this.zoom;
			
			this.redraw();
		}
		else if(this.currentToolMode === Constants.ToolMode.SECTOR_LIGHT) {
			
		}
	}
	
	onKeyDown(ev) {
		if(ev.altKey && this.currentToolMode !== Constants.ToolMode.VIEWPORT) {
			this.previousToolMode = this.currentToolMode;
			this.currentToolMode = Constants.ToolMode.VIEWPORT;
			
			this.previousCursor = this.canvasElement.style.cursor;
			this.canvasElement.style.cursor = 'move';
			
			this.redraw();
		}
		else if(ev.ctrlKey && this.currentToolMode !== Constants.ToolMode.VIEWPORT) {
			switch(ev.key) {
				case "v":
				case "V":
					this.changeMode(Constants.ToolMode.VERTEX);
				break;
				
				case "e":
				case "E":
					this.changeMode(Constants.ToolMode.EDGE);
				break;
					
				case "s":
				case "S":
					this.changeMode(Constants.ToolMode.SECTOR);
				break;
					
				case "l":
				case "L":
					this.changeMode(Constants.ToolMode.SECTOR_LIGHT);
				break;
			}
		}
		else {
			switch(this.currentToolMode) {
				case Constants.ToolMode.VERTEX: {
					switch(ev.key) {
						case "s":
						case "S": {
							this.currentEditMode = Constants.EditMode.SELECT;
							this.canvasElement.style.cursor = 'default';
						}
						break;
						
						case "a":
						case "A": {
							this.currentEditMode = Constants.EditMode.Vertex.ADD;
							this.canvasElement.style.cursor = 'cell';
						}
						break;
							
						case "x":
						case "X": {
							if(this.vertexSelect !== null) {
								// delete vertex!
							}
						}
						break;
					}
				}
				break;
					
				case Constants.ToolMode.EDGE: {
						
				}
				break;
					
				case Constants.ToolMode.SECTOR: {
						
				}
				break;
					
				case Constants.ToolMode.SECTOR_LIGHT: {
						
				}
				break;
			}
		}
	}
	
	onKeyUp(ev) {
		if(!ev.altKey && this.currentToolMode === Constants.ToolMode.VIEWPORT) {
			this.currentToolMode = this.previousToolMode;
			
			this.canvasElement.style.cursor = this.previousCursor;
			
			this.redraw();
		}
	}
};
