var stage, timeCircle, tickCircle, dragCircle, arm, output;

function init() {
	stage = new createjs.Stage("canvas");
	stage.enableMouseOver();
	stage.enableDOMEvents(true);

	points = new Array();
	lines = new Array();

	var endPoint = new Point(400, 200);

	points.push(endPoint);
	endDot = new createjs.Shape();
	endDot.graphics.beginFill("#CCC").drawCircle(0, 0, 5);
	endDot.x = endPoint.x;
	endDot.y = endPoint.y;
	stage.addChild(endDot);

	for (i = 1; i < 100; i++) {
		points.push(new Point(400 + (5 * i), 200 + Math.sin(i*0.1)*20));
		line = new createjs.Shape();
		line.graphics.beginStroke("#F00")
			.setStrokeStyle(10, "round")
			.moveTo(points[i - 1].x, points[i - 1].y)
			.lineTo(points[i].x, points[i].y);
		line.alpha = 0;
		lines.push(line);
		stage.addChild(line);
		//stage.addChild(lines[i]);
		stage.update();
	}

	var btn1 = stage.addChild(new Button("Hello!", "#F00"));
	btn1.x = 20;
	btn1.y = 20;

	var pause = new Button("Pause", "#FF0");

	var btnPause = stage.addChild(pause);
	btnPause.x = btn1.x + 100;
	btnPause.y = btn1.y;

	var btn2 = stage.addChild(new Button("Goodbye!", "#0F0"));
	btn2.x = 20;
	btn2.y = btn1.y + 50;

	var btn3 = stage.addChild(new Button("Hello again!!", "#0FF"));
	btn3.x = 20;
	btn3.y = btn2.y + 50;
	
	timeCircle = new createjs.Shape();
	timeCircle.graphics.beginFill("red").drawCircle(-40, 220, 40);
	stage.addChild(timeCircle);

	tickCircle = new createjs.Shape();
	tickCircle.graphics.beginFill("blue").drawCircle(-40, 320, 40);
	stage.addChild(tickCircle);

	dragCircle = new createjs.Shape();
	dragCircle.graphics.beginFill("red").drawRect(0, 0, 8, 40);
	dragCircle.x = 300;
	dragCircle.y = 100;
	stage.addChild(dragCircle);

	arm = new createjs.Shape();
	arm.graphics.beginFill("black").drawRect(-2, -2, 100, 4)
		.beginFill("blue").drawCircle(100, 0, 8);
	arm.x = 280;
	arm.y = 100;
	stage.addChild(arm);

	createjs.Ticker.addEventListener("tick", stage);
	createjs.Ticker.addEventListener("tick", tick);
	dragCircle.addEventListener("pressmove", drag);
	createjs.Ticker.setFPS(30);

	output = stage.addChild(new createjs.Text("", "14px monospace", "#000"));
	output.lineHeight = 15;
	output.textBaseline = "top";
	output.x = 10;
	output.y = stage.canvas.height - output.lineHeight * 3 - 10;

	var text = new createjs.Text("Hello World", "bold 86px Arial", "#FF7700");
	text.y = 300;
	text.alpha = 0.5;
	var hit = new createjs.Shape();
	hit.graphics.beginFill("#000").drawRect(0, 0, text.getMeasuredWidth(), text.getMeasuredHeight());
	text.hitArea = hit;
	text.on("mouseover", handleInteraction);
	text.on("mouseout", handleInteraction);
	stage.addChild(text);
	stage.update();

	timeCircle.mouseEnabled = false;
	timeCircle.on("click", function() {
		alert("Clicked the time circle!");
	});

	tickCircle.on("mouseover", function() {
		alert("Hovered over tick circle!");
	});

	tickCircle.on("mouseout", function() {
		alert("Mouse is gone now");
	});
}

Point = function(x, y) {
	this.x = x;
	this.y = y;
}

Button = function(label, color) {
	this.initialize(label, color);
}

p = Button.prototype = new createjs.Container();

p.label;
p.background;
p.count = 0;

p.Container_initialize = p.initialize;
p.initialize = function(label, color) {
	this.Container_initialize();

	this.label = label;
	if (!color) {
		color = "#CCC";
	}

	var text = new createjs.Text(label, "20px Arial", "#000");
	text.textBaseline = "top";
	text.textAlign = "center";

	var width = text.getMeasuredWidth() + 30;
	var height = text.getMeasuredHeight() + 20;

	this.background = new createjs.Shape();
	this.background.graphics.beginFill(color).drawRoundRect(0, 0, width, height, 10);

	text.x = width/2;
	text.y = 10;

	this.addChild(this.background, text);
	this.on("click", this.handleClick);
	this.on("tick", this.handleTick);

	this.mouseChildren = false;
}

p.handleClick = function(event) {
	var target = event.target;
	if (target.label === "Pause")
	{
		var paused = !createjs.Ticker.getPaused();
		createjs.Ticker.setPaused(paused);
	} else
	{
		alert("You clicked on a button: " + target.label);
	}
}

p.handleTick = function(event) {
	p.alpha = Math.cos(p.count++*0.1)*0.4+0.6;
}

tick = function(event) {
	if (!createjs.Ticker.getPaused())
	{
		timeCircle.x += (event.delta) / 1000 * 100;
		if ((timeCircle.x - 80) > stage.canvas.width)
		{
			timeCircle.x = -40;
		}
	}

	tickCircle.x += 5;
	if ((tickCircle.x - 80) > stage.canvas.width)
	{
		tickCircle.x = -40;
	}

	arm.rotation += 5;

	dragCircle.alpha = 1;
	timeCircle.alpha = 1;

	var pt = arm.localToLocal(100, 0, dragCircle);
	if (dragCircle.hitTest(pt.x, pt.y)) {
		dragCircle.alpha = .5;
	}
	pt = arm.localToLocal(100, 0, timeCircle);
	if (timeCircle.hitTest(pt.x, pt.y)) {
		timeCircle.alpha = .5;
	}

	stage.update(event);
}

handleInteraction = function(event) {
	event.target.alpha = (event.type === "mouseover") ? 1 : 0.5;
}

drag = function(event) {
	if (300 <= event.stageX && event.stageX < 400) {
		// if the current spot is less than new spot
		if (dragCircle.x < event.stageX) {
			for (i = dragCircle.x; i <= event.stageX; i++) {
				lines[i-300].alpha = 1;
				endDot.x = points[i - 300].x + 5;
			}
		} else {
			for (i = dragCircle.x; i >= event.stageX; i--) {
				lines[i-300].alpha = 0;
				endDot.x = points[i - 300].x + 5;
			}
		}
	  dragCircle.x = event.stageX;
	  stage.update(event);
	}
}

window.Button = Button;
