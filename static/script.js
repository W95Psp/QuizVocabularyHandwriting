var listZone;
$(function(){
	listZone = {};
	var list = $('.drawZone');
	for(var i in list){
		listZone[list[i].id] = new drawableArea(list[i]);
		listZone[list[i].id].white();
	}
});

var app = angular.module('app', []);

function saveData(){
	localStorage.setItem('VOC', JSON.stringify(SC.voc));
};

	var randomStuff = new Array();
var SC;
app.controller('ctrl', function($scope) {
	$scope.mode = false;
	$scope.modes = ['édition', 'quizz'];
	SC = $scope;
	$scope.correction = false;

	var VOC = localStorage.getItem('VOC') || '[]';
	
	$scope.voc = JSON.parse(VOC);

	$scope.motATraduire = ['', ''];
	$scope.add = function(){
		$scope.save();
		if($scope.currentDef!=-1){
			listZone['guess'].white();
			listZone['trad'].white();
		}
		$scope.voc.push([
				listZone['guess'].getBase64(),
				listZone['trad'].getBase64()
			]);
		$scope.currentDef = $scope.voc.length - 1;
	};

	function resetRandomStuff(){
		for(var i in $scope.voc)
			randomStuff.push(i);
		randomStuff.sort(function(){return 1-Math.random();});
	};
	resetRandomStuff();


	$scope.loadRandom = function(){
		$scope.motATraduire = $scope.voc[randomStuff.pop()];
		listZone['askGuess'].setBase64($scope.motATraduire[0]);
		listZone['askTrad'].white();
	};
	$scope.save = function(){
		$scope.voc[$scope.currentDef] = [
				listZone['guess'].getBase64(),
				listZone['trad'].getBase64(), {

				}
			];
		resetRandomStuff();
		saveData();
	};
	$scope.correct = function(){
		$scope.reponseUser = listZone['askTrad'].getBase64();
		$scope.correction = true;
	};
	$scope.del = function(){
		$scope.voc.splice($scope.currentDef, 1);
		$scope.currentDef--;
		if($scope.voc[$scope.currentDef])
			$scope.load($scope.voc[$scope.currentDef]);
		saveData();
	};
	$scope.currentDef = -1;
	$scope.load = function(word){
		listZone['guess'].setBase64(word[0]);
		listZone['trad'].setBase64(word[1]);
	}
	$scope.good = function(word){
		$scope.correction = false;
		$scope.loadRandom();
	}
	$scope.bad = function(word){
		$scope.correction = false;
		$scope.loadRandom();
	}
});


function drawableArea(div, readonly){
	var This = this;
	if($(div).attr('data-readonly')=='true')
		readonly = true;
	this.readonly = readonly==true;
	this.tool = 'Stylo';
	var id = div.id+'>canvas';
	var w = $(div).attr('data-width');
	var h = $(div).attr('data-height');
	$(div).append('<canvas width="'+w+'" height="'+h+'" canvas></canvas><div class="controls"><button class="clear">Clear</button><button class="gomme">Stylo</button></div>');
	$('#'+ div.id + " > .controls > button.clear").click(function(){
		This.clearCanvas();
	});
	$('#'+ div.id + " > .controls > button.gomme").click(function(){
		if($(this).text()=='Stylo'){
			$(this).text(This.tool = 'Gomme');
		}else{
			$(this).text(This.tool = 'Stylo');
		}
	});


	this.id = id;
	this.canvas = $('#'+id)[0];
	this.context = this.canvas.getContext('2d');
	this.context.lineJoin = 'round';
	this.context.lineWidth = 0.9;
	this.context.fillStyle = 'white';

	this.currentLine = new Array();
	this.oldX = -1;
	this.oldY = -1;
	var NO_MOVE = false;

	$('#'+id).on('mousedown', function(event) {
		if(This.readonly)
			return;
		NO_MOVE = true;
		var parentOffset = $(this).offset();
		This.oldX = event.pageX - parentOffset.left;
		This.oldY = event.pageY - parentOffset.top;
	});
	$('#'+id).on('mouseup', function(event) {
		if(This.readonly)
			return;
		if(NO_MOVE){
			var l = 1;
			if(This.tool=='Gomme'){
				l = 2;
				This.context.clearRect(This.oldX-l, This.oldY-l, 2*l, 2*l);
			}else{
				This.context.fillStyle = 'black';
				This.context.fillRect(This.oldX-l, This.oldY-l, 2*l, 2*l);
			}
		}
		This.oldX = -1;
		This.oldY = -1;
	});
	$('#'+id).mousemove(function(event) {
		if(This.readonly)
			return;
		if(This.oldX==-1)
			return;
		NO_MOVE = false;
		var parentOffset = $(this).offset();
		var X = event.pageX - parentOffset.left;
		var Y = event.pageY - parentOffset.top;
		if(This.tool=='Gomme')
			This.context.clearRect(X-4, Y-4, 8, 8);
		else
			This.drawLine([[This.oldX, This.oldY], [X, Y]], This.context);
		This.oldX = X;
		This.oldY = Y;
	});
};
drawableArea.prototype.drawLine = function(line, ctx){
	ctx.beginPath();
	var point0 = line.pop();
	ctx.moveTo(point0[0], point0[1]);
	old = point0;
	while(line.length){
		var point = line.pop();
		var midPoint = drawableArea.midPointBtw(old, point);
		ctx.quadraticCurveTo(old[0], old[1], point[0], point[1]);
		old = point;
	}
	ctx.closePath();
	ctx.stroke();
};
drawableArea.prototype.getBase64 = function() {
	return this.canvas.toDataURL();
};
drawableArea.prototype.setBase64 = function(b64) {
	this.clearCanvas(100);//No effect
	var myImage = new Image();
	myImage.src = b64;
	this.context.drawImage(myImage, 0, 0);
};
drawableArea.prototype.clearCanvas = function(effect) {
	this.context.fillStyle = 'rgba(255, 255, 255, 0.20)';
	this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
	var This = this;
	var newEffect = (effect || 0)+1;
	if(!effect || effect<20)
		setTimeout(function(){
			This.clearCanvas(newEffect)
		}, 20);
	else
		this.white();
};
drawableArea.prototype.white = function(effect) {
	this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
};
drawableArea.midPointBtw = function(p1, p2) {
	  return [p1[0] + (p2[0] - p1[0]) / 2, p1[1] + (p2[1] - p1[1])/2];
};	