var Game = function() {

    //$(window).on('resize', null, this, this.resize);

    this.ExtendObjects()
    this.stage = new createjs.Stage("demoCanvas");
    this.canvasWidth = this.stage.canvas.width;
    this.canvasHeight = this.stage.canvas.height;
    var plane = new Plane(this);
    this.stage.addChild(plane);

    createjs.Ticker.setFPS(30);
    createjs.Ticker.addEventListener("tick", this.stage);
};

Game.prototype.resize = function(e) {
    var game = e.data;
    var W = game.stage.canvas.width;
    var H = game.stage.canvas.height;
    var canvas = game.stage.canvas;
    var stage = game.stage;

    scaleFactor = Math.min((window.innerWidth - 100) / W, (window.innerHeight - 100) / H);
    // make the canvas conform to the new scaled size.
    canvas.width = W * scaleFactor;
    canvas.height = H * scaleFactor;
    // get the scaled canvas context.
    context = canvas.getContext('2d');

    stage.scaleX = scaleFactor; // scaling the stage  X
    stage.scaleY = scaleFactor; // scaling the stage Y
    var bounds = null;
    for (var i = 0; i < stage.children.length; i++) {
        bouds = stage.children[i].getBounds();
        stage.children[i].x = bounds.x * scaleFactor;
        stage.children[i].y *= bounds.y * scaleFactor;
        stage.children.setBounds(0, 0, bounds.width * scaleFactor, bounds.height.scaleFactor);
    }
}


Game.prototype.ExtendObjects = function() {
    this.ExtendPlane();
    window.Plane = createjs.promote(this.Plane, "Container");
    this.ExtendBadge();
    window.Badge = createjs.promote(this.Badge, "Container");
}

Game.prototype.Badge = function(cell) {
    this.Container_constructor();
    var that = this;
    this.on("pressmove", function(e){this.pressmovehandler(e, that);});

    var that = this;
    var image = new Image();
    image.src = "/images/image1.jpg";
    image.onload = function() {
        var bg = new createjs.Shape();
        that.addChild(bg);
        var minx = Number.MAX_VALUE;
        var miny = Number.MAX_VALUE;
        var maxx = Number.MIN_VALUE;
        var maxy = Number.MIN_VALUE;
        for (var i = 0; i < cell.halfedges.length; i++) {
            if (minx > cell.halfedges[i].getStartpoint().x)
                minx = cell.halfedges[i].getStartpoint().x;
            if (miny > cell.halfedges[i].getStartpoint().y)
                miny = cell.halfedges[i].getStartpoint().y;
            if (maxx < cell.halfedges[i].getStartpoint().x)
                maxx = cell.halfedges[i].getStartpoint().x;
            if (maxy < cell.halfedges[i].getStartpoint().y)
                maxy = cell.halfedges[i].getStartpoint().y;
        }
        var xi = cell.halfedges[cell.halfedges.length - 1].getStartpoint().x - minx;
        var yi = cell.halfedges[cell.halfedges.length - 1].getStartpoint().y - miny;
        var g = bg.graphics.beginStroke('black').beginBitmapFill(image).moveTo(xi, yi)
        for (var j = cell.halfedges.length - 2; j >= 0; j--) {
            xi = cell.halfedges[j].getStartpoint().x;
            yi = cell.halfedges[j].getStartpoint().y;
            g.lineTo(xi - minx, yi - miny);
        }

        that.x = Math.random() * 400;
        that.y = Math.random() * 600;
        var w = maxx - minx;
        var h = maxy - miny;
        that.regX = w /2;
        that.regY = h/2;
        that.setBounds(0,0, w, h);
    }

}

Game.prototype.Plane = function(game) {
    this.Container_constructor();
    var height = game.stage.canvas.height;
    var width = game.stage.canvas.width * 0.5;
    var x = game.stage.canvas.width - width;
    this.points = game.RandomPoints(width, height);
    var voronoi = new Voronoi();
    var bbox = {
        xl: 0,
        xr: width,
        yt: 0,
        yb: height
    };
    var diagram = voronoi.compute(this.points, bbox);
    this.cells = diagram.cells;
    for (var i = 0; i < diagram.cells.length; i++) {
        var badge = new Badge(this.cells[i]);
        game.stage.addChild(badge);
    }
    game.stage.update();

    this.setBounds(0, 0, width, height);
    this.x = x;
    //background
    var bg = new createjs.Shape();
    this.addChild(bg);
    var g = bg.graphics;
    for (var i = 0; i < this.cells.length; i++) {
        for (var j = 0; j < this.cells[i].halfedges.length; j++) {
            var va = this.cells[i].halfedges[j].edge.va;
            var vb = this.cells[i].halfedges[j].edge.vb;
            g.beginStroke('black').moveTo(va.x, va.y).lineTo(vb.x, vb.y);
        }
    }
}



Game.prototype.ExtendBadge = function() {
    var p = createjs.extend(this.Badge, createjs.Container);
    //inserire qua gli override dei metodi
    var stage = this.stage;
    p.pressmovehandler = function(evt, that) {
        // currentTarget will be the container that the event listener was added to:
        that.x = evt.stageX;
        that.y = evt.stageY;
        // make sure to redraw the stage to show the change:
     	stage.update();
    };
}

Game.prototype.ExtendPlane = function() {
    var p = createjs.extend(this.Plane, createjs.Container);
    //inserire qua gli override dei metodi
}


Game.prototype.haltonSequence = function halton(index, base) {
    var result = 0;
    var f = 1 / base;
    var i = index;
    while (i > 0) {
        result = result + f * (i % base);
        i = Math.floor(i / base);
        f = f / base;
    }
    return result;
};

Game.prototype.HaltonPoints = function(w, h) {
    var points_count = Math.floor((Math.random() * 5) + 20);
    var points = [];
    var basex = Math.floor((Math.random() * 2) + 5);
    var basey = Math.floor((Math.random() * 2) + 2);

    for (var i = 0; i < points_count; i++) {
        points.push({
            x: this.haltonSequence(i, basex) * w,
            y: this.haltonSequence(i, basey) * h
        });
    }
    return points;
}


Game.prototype.RandomPoints = function(w, h) {
    var points_count = Math.floor((Math.random() * 5) + 20);
    var points = [];

    for (var i = 0; i < points_count; i++) {
        points.push({
            x: Math.random() * w,
            y: Math.random() * h
        });
    }
    return points;
}