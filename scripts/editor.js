var Constants = {
	EditMode: {
		VIEWPORT: 'viewport',
		VERTEX: 'vertex',
		EDGE: 'edge',
		SECTOR: 'sector',
		SECTOR_LIGHT: 'sector_light'
	},
	
	EditingMode: {
		SELECT: 'select',
		ADD: 'add',
		MODIFY: 'modify'
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
	}
};

class Editor {
	constructor(canvasElement) {
		this.ctx = canvasElement.getContext("2d");
		
		this.viewport = { x: 0, y: 0, width: canvasElement.width, height: canvasElement.height};
		
		this.currentEditMode = Constants.EditMode.VERTEX;
		this.previousEditMode = Constants.EditMode.VERTEX;
		
		this.gridSize = Constants.UNITSIZE;
		
		this.mouseDrag = false;
		
		this.zoom = 1.0;
		this.zoomStep = 0.1;
	}
	
	get viewportBounds() {
		return this.viewport;
	}
	
	get viewportCenter() {
		let vpx = this.viewport.x;
		let vpy = this.viewport.y;
		let vpw = this.viewport.width;
		let vph = this.viewport.height;
		
		return { x: vpx + vpw / 2, y: vpy + vph / 2};
	}
	
	set viewportCenter(location) {
		if(location.x === null || location.y === null)
			return;
		
		this.viewport.x = location.x - viewport.width / 2;
		this.viewport.y = location.y - viewport.height / 2;
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
	
	getZoomStep() {
		return this.zoomStep;
	}
	
	moveViewport(deltaPos) {
		if(deltaPos.x === null || deltaPos.y === null)
			return;
		
		this.viewport.x += deltaPos.x;
		this.viewport.y += deltaPos.y;
	}
	
	drawThings() {
		
	}
	
	drawLevel() {
		
	}
	
	drawGrid() {
		let ctx = this.ctx;
		
		let centerx = Util.worldunitToPixel(this.viewportCenter.x);
		let centery = Util.worldunitToPixel(this.viewportCenter.y);
		
		let offsetx = (centerx % this.gridSize);
		let offsety = (centery % this.gridSize);
		
		let width = Util.worldunitToPixel(this.viewport.width);
		let height = Util.worldunitToPixel(this.viewport.height);
		
		ctx.lineWidth = 1;
		
		ctx.fillStyle = '#0048ba';
		ctx.fillRect(0, 0, width, height);
		
		ctx.strokeStyle = '#3399ff';
		ctx.beginPath();
		
		for(let y = 0; y < height; y += this.gridSize) {
			for(let x = 0; x < width; x += this.gridSize) {
				ctx.moveTo(offsetx + x, 0);
				ctx.lineTo(offsetx + x, height);
				
				ctx.moveTo(0, offsety + y);
				ctx.lineTo(width, offsety + y);
			}
		}
		
		ctx.closePath();
		ctx.stroke();
	}
	
	redraw() {
		this.drawGrid();
		this.drawLevel();
		this.drawThings();
	}
	
	onResize(newWidth, newHeight) {
		let worldWidth = Util.pixelToWorldunit(newWidth);
		let worldHeight = Util.pixelToWorldunit(newHeight);
		
		let diff = { w: worldWidth - this.viewport.width, h: worldHeight - this.viewport.height};
		
		this.viewport.width = worldWidth;
		this.viewport.height = worldHeight;
		
		this.viewport.x -= diff.w / 2;
		this.viewport.y -= diff.h / 2;
		
		this.redraw();
	}
	
	onMouseDown(ev) {
		if(ev.button === 0 && this.currentEditMode === Constants.EditMode.VIEWPORT) {
			this.mouseDrag = true;
		}
	}
	
	onMouseUp(ev) {
		if(ev.button === 0) {
			this.mouseDrag = false;
		}
	}
	
	onMouseMove(ev) {
		if(this.mouseDrag) {
			this.moveViewport(ev.delta);
			this.redraw();
		}
	}
	
	onMouseWheel(ev) {
		let delta = ev.wheelDelta > 1 ? 1 : ev.wheelDelta < -1 ? -1 : 0;
		
		if(this.currentEditMode === Constants.EditMode.VIEWPORT) {
			this.zoom += delta * this.zoomStep;
			this.zoom = this.zoom < Constants.MINZOOM ? Constants.MINZOOM : this.zoom > Constants.MAXZOOM ? Constants.MAXZOOM : this.zoom;
			
			this.redraw();
		}
	}
	
	onKeyDown(ev) {
		if(ev.altKey) {
			this.previousEditMode = this.currentEditMode;
			this.currentEditMode = Constants.EditMode.VIEWPORT;
		}
		else if(ev.ctrlKey) {
			
		}
	}
	
	onKeyUp(ev) {
		if(!ev.altKey && this.currentEditMode === Constants.EditMode.VIEWPORT) {
			this.currentEditMode = this.previousEditMode;
		}
	}
	
	onKeyPress(ev) {
		
	}
};
