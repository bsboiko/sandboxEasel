var stage, timeCircle, tickCircle, dragRect, arm, output;

function init() {
	// setup the stage
	stage = new createjs.Stage("canvas");

	// enable mouse events, specifically mouseover, mouseout, rollover, rollout
	stage.enableMouseOver();
	stage.enableDOMEvents(true);

	// arrays to hold points for a line, and the line segments as well
	points = new Array();
	lines = new Array();

	// this marks the end of the line
	var endPoint = new Point(400, 200);

	// line is empty, so it begins at the end. Poetic huh?
	// don't forget to make the dot as well
	points.push(endPoint);
	
	// set up the point coordinate system as well as line segments
	for (i = 1; i < 100; i++) {
		// points have constant x, by five. y is sine curve
		points.push(new Point(400 + (5 * i), 200 + Math.sin(i*0.1)*20));
		line = new createjs.Shape();
		line.graphics.beginStroke("#F00")
			.setStrokeStyle(10, "round")
			.moveTo(points[i - 1].x, points[i - 1].y)
			.lineTo(points[i].x, points[i].y);
		line.alpha = 0;
		lines.push(line);
		stage.addChild(line);
		stage.update();
	}

  endDot = new createjs.Shape();
	endDot.graphics.beginFill("#CCC").drawCircle(0, 0, 5);
	endDot.x = endPoint.x;
	endDot.y = endPoint.y;
	stage.addChild(endDot);

	// first button. Nothing special
	var btn1 = stage.addChild(new Button("Hello!", "#F00"));
	btn1.x = 20;
	btn1.y = 20;

	// This is the pause button for timeCircle. Slightly special in what it does
	var pause = new Button("Pause", "#FF0");
	var btnPause = stage.addChild(pause);
	btnPause.x = btn1.x + 100;
	btnPause.y = btn1.y;

	// second button
	var btn2 = stage.addChild(new Button("Goodbye!", "#0F0"));
	btn2.x = 20;
	btn2.y = btn1.y + 50;

	// third button
	var btn3 = stage.addChild(new Button("Hello again!!", "#0FF"));
	btn3.x = 20;
	btn3.y = btn2.y + 50;
	
	// time based animation circle. Frame Rate independent
	timeCircle = new createjs.Shape();
	timeCircle.graphics.beginFill("red").drawCircle(-40, 220, 40);
	stage.addChild(timeCircle);

	// tick based animation circle. Depends on FPS
	tickCircle = new createjs.Shape();
	tickCircle.graphics.beginFill("blue").drawCircle(-40, 320, 40);
	stage.addChild(tickCircle);

	// This a draggable item. Used as scroller for the line
	dragRect = new createjs.Shape();
	dragRect.graphics.beginFill("red").drawRect(0, 0, 8, 40);
	dragRect.x = 300;
	dragRect.y = 100;
	stage.addChild(dragRect);

	// arm which rotates with a circle at the end
	arm = new createjs.Shape();
	arm.graphics.beginFill("black").drawRect(-2, -2, 100, 4)
		.beginFill("blue").drawCircle(100, 0, 8);
	arm.x = 280;
	arm.y = 100;
	stage.addChild(arm);

	// tick event listeners
	createjs.Ticker.addEventListener("tick", stage);
	createjs.Ticker.addEventListener("tick", tick);
	createjs.Ticker.setFPS(30);

	// drag event listener
	dragRect.addEventListener("pressmove", drag);
	
	output = stage.addChild(new createjs.Text("", "14px monospace", "#000"));
	output.lineHeight = 15;
	output.textBaseline = "top";
	output.x = 10;
	output.y = stage.canvas.height - output.lineHeight * 3 - 10;

	// Hello World text sitting at the bottom. Use a hitarea
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

	// prevents mouse events for the time circle
	timeCircle.mouseEnabled = false;

	// click event for timeCircle
	timeCircle.on("click", function() {
		alert("Clicked the time circle!");
	});

	// mouseover event for tickCircle
	tickCircle.on("mouseover", function() {
		alert("Hovered over tick circle!");
	});

	// mouseout event for tickCircle
	tickCircle.on("mouseout", function() {
		alert("Mouse is gone now");
	});
}

// Point class. has x and y coordinate
Point = function(x, y) {
	this.x = x;
	this.y = y;
}


// Button class
Button = function(label, color) {
	this.initialize(label, color);
}


// Button prototype is createjs' Container. Set up inheritance
p = Button.prototype = new createjs.Container();

p.label;
p.background;
p.count = 0;

// save parent's initialize
p.Container_initialize = p.initialize;
p.initialize = function(label, color) {
	// call the parent init
	this.Container_initialize();

	// label and color set
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

// click event for a button
p.handleClick = function(event) {
	var target = event.target;
	// Pause button
	if (target.label === "Pause")
	{
		// pause the ticker, or resume it
		var paused = !createjs.Ticker.getPaused();
		createjs.Ticker.setPaused(paused);
	} else
	{	
		// other buttons are alerts
		alert("You clicked on a button: " + target.label);
	}
}

// tick event
p.handleTick = function(event) {
	// buttons change alpha using a sine curve
	p.alpha = Math.cos(p.count++*0.1)*0.4+0.6;
}

// tick function
tick = function(event) {
	// if not paused
	if (!createjs.Ticker.getPaused())
	{
		// move time circle
		timeCircle.x += (event.delta) / 1000 * 100;
		if ((timeCircle.x - 80) > stage.canvas.width)
		{
			timeCircle.x = -40;
		}
	}

	// always move the tickCircle
	tickCircle.x += 5;
	if ((tickCircle.x - 80) > stage.canvas.width)
	{
		tickCircle.x = -40;
	}

	// rotate the arm constantly
	arm.rotation += 5;

	// these are visible by default
	dragRect.alpha = 1;
	timeCircle.alpha = 1;

	// use localToLocal to get the circle's coordinates aligned with dragRect
	var pt = arm.localToLocal(100, 0, dragRect);
	if (dragRect.hitTest(pt.x, pt.y)) {
		dragRect.alpha = .5;
	}
	pt = arm.localToLocal(100, 0, timeCircle);
	if (timeCircle.hitTest(pt.x, pt.y)) {
		timeCircle.alpha = .5;
	}

	// update
	stage.update(event);
}

// mouseover event on text
handleInteraction = function(event) {
	event.target.alpha = (event.type === "mouseover") ? 1 : 0.5;
}

// dragging dragRect
drag = function(event) {
	// only from 300 to 400
	if (300 <= event.stageX && event.stageX < 400) {
		// if the current spot is less than new spot
		if (dragRect.x < event.stageX) {
			for (i = dragRect.x; i <= event.stageX; i++) {
				lines[i-300].alpha = 1;
				endDot.x = points[i - 300].x + 5;
        endDot.y = points[i - 300].y;
			}
		} else {
			for (i = dragRect.x; i >= event.stageX; i--) {
				lines[i-300].alpha = 0;
				endDot.x = points[i - 300].x + 5;
        endDot.y = points[i - 300].y;
			}
		}
		// only update the x coordinate
		dragRect.x = event.stageX;
		stage.update(event);
	}
}

window.Button = Button;

document.body.onload = init();

