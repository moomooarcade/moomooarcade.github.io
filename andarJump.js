var mainSceneConfig = {
	key: 'main', 
	init: mainInit,
	preload: mainPreload,
	create: mainCreate,
	update: mainUpdate,
	pack: {
		files: [
			{
				//type: 'image', key: 'mainButton', url: ''
			}
		]
	}
}

var mainScene = new Phaser.Scene(mainSceneConfig);

var selectionSceneConfig = {
	key: 'selection',
	preload: selectionPreload, 
	create: selectionCreate,
	update: selectionUpdate
}

var selectionScene = new Phaser.Scene(selectionSceneConfig);

var gameConfig = {
	type: Phaser.CANVAS, 
	parent: 'gameContent',
	width: 500, 
	height: 350, 
	physics: {
		default: 'arcade', 
		arcade: {
			gravity: {y:300}, 
			debug: false
		}
	}, 
	scene: [selectionSceneConfig, mainSceneConfig]
}

function selectionPreload(){
	this.load.setBaseURL('https://raw.githubusercontent.com/chatterboxn18/chatterboxn18.github.io/master/');
	this.load.image('background', 'andar-bg.png');
	this.load.image('sel-moonbyul', 'andar-selection-moonbyul.png');
	this.load.image('moonbyul', 'andar-moonbyul.png');
	this.load.image('sel-solar', 'andar-selection-solar.png');
	this.load.image('solar', 'andar-solar.png');
	this.load.image('sel-hwasa', 'andar-selection-hwasa.png');
	this.load.image('hwasa', 'andar-hwasa.png');
	this.load.image('sel-wheein', 'andar-selection-wheein.png');
	this.load.image('wheein', 'andar-wheein.png');

	console.log("selection preload");
}

function selectionCreate(){
	var background = this.add.sprite(750,175, "background");
	createButton(this,'moonbyul', 62.5);
	createButton(this,'solar', 187.5);
	createButton(this,'wheein', 312.5);
	createButton(this,'hwasa', 437.5);
	
}

function createButton(scene, name, positionX){
	var image = scene.add.image(positionX, 175, "sel-" + name);
	var button = scene.add.rectangle(positionX, 175, 125, 350).setInteractive();
	button.on('pointerover', () => { image.setTexture(name); image.displayOriginY = 150;});
	button.on('pointerout', () => {image.setTexture('sel-' + name); image.displayOriginY = 175; });
	button.on('pointerup', () => { scene.scene.start('main', {image: name})});
}

function selectionUpdate(){

}

//data variables
var game = new Phaser.Game(gameConfig);
var main;
var name = "";

//game variables
var player;
var level = 0; 
var obstacleSpawned = 0;
var levelTimer;
var timerTime;
var isPaused;
var currentVelocity = 150;

//interactivity variables
var pointer;
var keyPress;
var cursors;

//score variables
var scoreTimer;
var score = 0;
var scoreText;

function mainInit(data){
	name = data.image;
}

function mainPreload(){
	this.load.setBaseURL('https://raw.githubusercontent.com/chatterboxn18/chatterboxn18.github.io/master/')
	this.load.image('background', 'andar-bg.png');
	this.load.image('cabinet', 'andar-cabinet.png');
	this.load.image('open-cabinet', 'andar-cabinet-open.png');
	this.load.image('desk', 'andar-desk.png');
	this.load.image(name, 'andar-' + name + '.png');
	this.load.image('ground', 'andar-ground.png');
	this.load.image('start', 'andar-instructions.png');
	this.load.image('gameover', 'andar-gameover.png');
}

function mainCreate(){
	main = this;
	isPaused = false;
	this.background = this.add.tileSprite(0,0, 1500, 500, "background");
	this.background.setScale(.7);
	this.background.setOrigin(0);
	this.background.setScrollFactor(0,1);
	cursors = this.input.keyboard.createCursorKeys();
	keyPress = this.input.keyboard.addKey('SPACE');
	pointer = this.input.activePointer;

	levelTimer = this.time.addEvent({
		delay: 3000, 
		callback: createObstacle, 
		loop: true
	});
	scoreText = this.add.text(250, 20, "Score: " + score, {fontFamily: 'AGENCYR'}).setOrigin(0.5);
	scoreTimer = this.time.addEvent({
		delay: 2000,
		callback: addScore, 
		loop: true
	});
	createPlayer(this);
	createGround(this);
	pause();
	var instructions = this.add.image(250, 175, "start");
	instructions.setInteractive();
	instructions.on('pointerup', ()=> {
		instructions.destroy();
		var cabinetLifeTimer = main.time.delayedCall(1000, createObstacle);
		unpause();
	});
	
}

function addScore(){
	score += level * 10;
	scoreText.setText("Score: " + score);
}

function createObstacle(){
	if (obstacleSpawned%5 == 0){
		level += 1;
		if (currentVelocity < 250){
			currentVelocity += 10;
		}
		if (levelTimer.delay >2000){
			levelTimer.delay -= 200;
		}
		console.log("Leveled up: " + currentVelocity + " "  + levelTimer.delay);
	}
	var spawnNumber = Phaser.Math.Between(1,level);
	switch (spawnNumber){
		case 1:
			createCabinet();
			break;
		case 2: 
			createDesk();
			break;
		case 3:
			createOpenCabinet();
			break;
		case 4: 
			createDoubleCabinet();
			break;
		case 5:
			createDoubleDesk();
			break;
		default:
			createCabinet();
			break;
	}

	obstacleSpawned++; 
}

function createCabinet(){
	console.log("create Cabinet");
	var cabinet = main.physics.add.sprite(530, 235, 'cabinet');
	cabinet.setScale(.25);
	cabinet.body.allowGravity = false;
	cabinet.body.setVelocityX(-currentVelocity);
	main.physics.add.collider(player, cabinet, touchObject, null, main);
	main.time.delayedCall(5000, destroyObstacle, [cabinet]);
}

function createOpenCabinet(){
	createCabinet();
	var cabinet = main.physics.add.sprite(502, 248, 'open-cabinet');
	cabinet.setScale(.25);
	cabinet.body.allowGravity = false;
	cabinet.body.setVelocityX(-currentVelocity);
	main.physics.add.collider(player, cabinet, touchObject, null, main);
	main.time.delayedCall(5000, destroyObstacle, [cabinet]);
}

function createDoubleCabinet(){
	createCabinet();
	main.time.delayedCall(500, createCabinet);
}

function createDesk(){
	var desk = main.physics.add.sprite(530, 245, 'desk');
	desk.setScale(.25);
	desk.body.allowGravity = false;
	desk.body.setVelocityX(-currentVelocity);
	main.physics.add.collider(player, desk, touchObject, null, main);
	main.time.delayedCall(5000, destroyObstacle, [desk]);
}

function createDoubleDesk(){
	createDesk();
	main.time.delayedCall(400, createDesk);
}

function touchObject(player, object){
	if (player.body.touching.right || player.body.touching.down || player.body.touching.left){
		pause();
		isPaused = true;
		console.log("GameOver");
		gameover();
	}
}

function destroyObstacle(obstacle){
	obstacle.destroy(main);
}

function createPlayer(game){
	player = game.physics.add.sprite(75, 170, name);
	player.setScale(.3);
	player.setCollideWorldBounds(true);
}

function createGround(game){
	var ground = game.physics.add.staticGroup();
	ground.create(250, 310, 'ground');
	game.physics.add.collider(player, ground);
}

function pause(){
	console.log("paused");
	main.physics.pause();
	levelTimer.paused = true;
	scoreTimer.paused = true;
}

function unpause(){
	console.log("unpaused");
	main.physics.resume();
	levelTimer.paused = false;
	scoreTimer.paused = false;
}

function gameover(){
	var gameover = main.add.image(250,175, 'gameover');
	var playagain = main.add.rectangle(165, 243, 148 , 43).setInteractive();
	playagain.on('pointerup', () => {main.scene.start('selection'); score = 0; level = 1;});
	var tweetScore = main.add.rectangle(338, 243, 148, 43).setInteractive();
	var tweet = "I scored: " + score + " in MAMAMOO Andar Jump while streaming 'WANNABE MY SELF' bit.ly/3hoUcfn #MAMAMOO #마마무 @RBW_MAMAMOO pic.twitter.com/TTqpVDR8OC";
	//watchVideo.on('pointerup', () => {window.open('https://youtu.be/sk-qyR224fU');});
	var url = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(tweet);
	tweetScore.on('pointerup', () => {window.open(url, '_bank');});
	var text = main.add.text(250, 165, "Score: " + score, {fontFamily: 'AGENCYR'}).setOrigin(0.5);
	text.style.fontSize = 20;
}

function mainUpdate(){
	if (isPaused)
		return;

	this.background.tilePositionX += 5;

	if (player.body.touching.down){
		if (keyPress.isDown || pointer.isDown){
			player.setVelocityY(-275);
		}
	}
	else if (player.body.touching.down){
		player.setVelocityX(0);
	}
}