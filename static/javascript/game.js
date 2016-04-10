var Game = function(){
	this.ExtendObjects()
	stage = new createjs.Stage("demoCanvas");
	
	var plane = new Plane();
	stage.addChild(plane);
	
  	createjs.Ticker.setFPS(60);
        createjs.Ticker.addEventListener("tick", stage);
};

Game.prototype.ExtendObjects = function (){
	this.ExtendPlane();
	window.Plane = createjs.promote(this.Plane, "Container");
}



Game.prototype.Plane = function(){
        this.Container_constructor();
}

Game.prototype.ExtendPlane = function(){
	var p = createjs.extend(this.Plane, createjs.Container);
	p.draw = function(){
		this.Container_draw();	
	}
}


