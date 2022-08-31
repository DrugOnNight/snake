window.onload = function(){
	//Канвас на весь экран
	var width = window.innerWidth;
	var height = window.innerHeight;
	var canvas = document.getElementById('canvas');
	canvas.setAttribute('width', width);
	canvas.setAttribute('height', height);
	//Объявление переменных
	var start = 0;
		dir = 6;
		time = 0;
		timerId = 0;
		snakeElements = [];
		snakeBorderElements = [];
		snakeHead = 0;
		snakeBorderHead = 0;
		snakeTail = 0;
		snakeBorderTail = 0;
		autofollow = false;
		apple = 0;
		saveTail = 0;
		closeDir = 5;
		secondHead = 0;

	//Создание класса с параметрами для gui
	var panelGui = function(){
		this.Score = 0;
		this.CameraAutofollowing = false;
		this.CameraToCenter = function(){
			controls.target = new THREE.Vector3(0,0,0);
		}
		this.CameraToSnakeHead = function(){
			controls.target = new THREE.Vector3(snakeHead.position.x,snakeHead.position.y,snakeHead.position.z);
		}
	};
	//Создание gui интерфейса
	var panel = new panelGui();
	var gui = new dat.GUI();
	var autofollow = gui.add(panel, 'CameraAutofollowing');
	gui.add(panel, 'CameraToCenter');
	gui.add(panel, 'CameraToSnakeHead');
	autofollow.onChange(function(value){
		if(autofollow){
			autofollow = false;
		}else{
			autofollow = true;
		}
	});

	//Создание рендера и сцены
	var renderer = new THREE.WebGLRenderer({canvas: canvas,antialias : true});
	renderer.setClearColor(0x000000);
	var scene = new THREE.Scene();
	//Создание камеры
	var camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
	camera.position.set(50, 50, 50);
	//Соаздание освещения
	var light = new THREE.AmbientLight(0xffffff);
	scene.add(light);

	//Управление мышью

	var controls = new THREE.OrbitControls (camera, renderer.domElement);
	controls.enableKeys = false;
	//Создание игровой площадки
	var geometry = new THREE.BoxGeometry( 20, 20, 20);
	var material = new THREE.LineBasicMaterial({color: 0xff0000});
	var edges = new THREE.EdgesGeometry(geometry);
	var areaEdgesMesh = new THREE.LineSegments(edges, material);
	areaEdgesMesh.position.set(0.5, 0.5, 0.5);
	scene.add(areaEdgesMesh);

	//Создание подсказки 
	var loader = new THREE.TextureLoader();
	geometry = new THREE.PlaneGeometry( 15, 15 );
	material = new THREE.MeshBasicMaterial( {map: loader.load('/img/keyArrow.png'),side: THREE.DoubleSide} );
	var plane = new THREE.Mesh( geometry, material );
	plane.position.set(0,-10,0);
	plane.rotation.set(1.56,0,3.15);
	scene.add( plane );

	function getRandom(min, max){
		return (Math.random() * (max - min) + min);
	}

	function createApple(){
		let geometry = new THREE.SphereGeometry( 0.5, 32, 32);
		let material = new THREE.MeshBasicMaterial({color: 0x0000ff});
		apple = new THREE.Mesh(geometry, material);
		apple.position.set(Math.trunc(getRandom(-10,10)),Math.trunc(getRandom(-10,10)),Math.trunc(getRandom(-10,10)));
		scene.add(apple);
	}

	createSnakeBox(10,10,10);
	createSnakeBox(10,10,9);
	
	secondHead = snakeTail = snakeElements[snakeElements.length-1];
	
	snakeBorderTail = snakeBorderElements[snakeElements.length-1];
	controls.target = new THREE.Vector3(snakeTail.position.x,snakeTail.position.y,snakeTail.position.z);

	//Создание блока змейки
	function createSnakeBox(x,y,z){
		let geometry = new THREE.BoxGeometry( 1, 1, 1);
		let material = new THREE.LineBasicMaterial({color: 0x00ff00});
		let snake = new THREE.Mesh(geometry, material);
		snake.position.set(x,y,z);
		snakeElements.unshift(snake);
		snakeHead = snake;
		scene.add(snake);
		//Контур
		geometry = new THREE.BoxGeometry( 1, 1, 1);
		material = new THREE.LineBasicMaterial({color: 0x000000});
		let edge = new THREE.EdgesGeometry(geometry);
		let border = new THREE.LineSegments(edge, material);
		border.position.set(x,y,z);
		snakeBorderElements.unshift(border);
		snakeBorderHead = border;
		scene.add(border);
	}

	//Нажатие на клавиши
	document.addEventListener('keydown', function(event) {
		//console.log(snakeHead.position);
		let tempDir = 0;
  		if(event.code == 'Enter'){
  			if(start == 0){
 				start = 1;
	 			createApple();
  			}
 		}else if(event.code == 'KeyD'){
 			tempDir = 1;
			if(closeDir != tempDir){
				dir = 1;
			}
 		}else if(event.code == 'KeyA'){
 			tempDir = 2;
			if(closeDir != tempDir){
				dir = 2;
			}
 		}else if(event.code == 'KeyW'){
 			tempDir = 6;
			if(closeDir != tempDir){
				dir = 6;
			}
 		}else if(event.code == 'KeyS'){
 			tempDir = 5;
			if(closeDir != tempDir){
				dir = 5;
			}
 		}else if(event.code == 'KeyR'){
 			tempDir = 3;
			if(closeDir != tempDir){
				dir = 3;
			}
 		}else if(event.code == 'KeyF'){
 			tempDir = 4;
			if(closeDir != tempDir){
				dir = 4;
			}
 		}
	});

	//function boxHere(x,y,z){}

	function calculateCloseDir(){
		let snakeX = snakeHead.position.x;
		let snakeY = snakeHead.position.y;
		let snakeZ = snakeHead.position.z;
		let secondX = secondHead.position.x;
		let secondY = secondHead.position.y;
		let secondZ = secondHead.position.z;
		let d = 0;

		if(snakeX > secondX){
			d = 1;
		}else if(snakeX < secondX){	
			d = 2;
		}else if(snakeZ < secondZ){
			d = 6;
		}else if(snakeZ > secondZ){
			d = 5;
		}else if(snakeY < secondY){
			d = 4;
		}else if(snakeY > secondY){
			d = 3;
		}


		if(d == 6){
			closeDir = 5;
		}else if(d == 5){
			closeDir = 6;
		}else if(d == 4){
			closeDir = 3;	
		}else if(d == 3){
			closeDir = 4;	
		}else if(d == 1){
			closeDir = 2;	
		}else if(d == 2){
			closeDir = 1;	
		}
	} 

	function appleHere(x,y,z){

		if(apple.position.x == x && apple.position.y == y && apple.position.z == z){
			panel.Score += 1;
			scene.remove(apple);
			createApple();
			return 1;
			
		}else{
			return 0;
		}
	}

	timerId = setInterval(function(){
		if(start == 1){
			//saveTail = 0;
			if(saveTail == 0){
				scene.remove(snakeTail);
				scene.remove(snakeBorderTail);	
				snakeElements.splice(snakeElements.length-1, 1);
				snakeBorderElements.splice(snakeBorderElements.length-1, 1);
			}else{
				saveTail = 0;
				}
			if(appleHere(snakeHead.position.x,snakeHead.position.y,snakeHead.position.z)){
				saveTail = 1;
			}

			if(dir == 1){//Вправо
				if(snakeHead.position.x+1 == 11){
					createSnakeBox(-9, snakeHead.position.y, snakeHead.position.z);
				}else{
					createSnakeBox(snakeHead.position.x+1, snakeHead.position.y, snakeHead.position.z);
				}
			}else if(dir == 2){//Влево
				if(snakeHead.position.x-1 == -10){
					createSnakeBox(10, snakeHead.position.y, snakeHead.position.z);
				}else{
					createSnakeBox(snakeHead.position.x-1, snakeHead.position.y, snakeHead.position.z);
				}
			}else if(dir == 3){//Вверх
				if(snakeHead.position.y+1 == 11){
					createSnakeBox(snakeHead.position.x, -9, snakeHead.position.z);
				}else{
					createSnakeBox(snakeHead.position.x, snakeHead.position.y+1, snakeHead.position.z);
				}
			}else if(dir == 4){//Вниз
				if(snakeHead.position.y-1 == -10){
					createSnakeBox(snakeHead.position.x, 10, snakeHead.position.z);
				}else{
					createSnakeBox(snakeHead.position.x, snakeHead.position.y-1, snakeHead.position.z);
				}
			}else if(dir == 5){//Назад
				if(snakeHead.position.z+1 == 11){
					createSnakeBox(snakeHead.position.x, snakeHead.position.y, -9);
				}else{
					createSnakeBox(snakeHead.position.x, snakeHead.position.y, snakeHead.position.z+1);
				}
			}else if(dir == 6){//Вперёд
				if(snakeHead.position.z-1 == -10){
					createSnakeBox(snakeHead.position.x, snakeHead.position.y, 10);
				}else{
					createSnakeBox(snakeHead.position.x, snakeHead.position.y, snakeHead.position.z-1);
				}
			}
			snakeHead = snakeElements[0];
			if(!autofollow){
				controls.target = new THREE.Vector3(snakeHead.position.x,snakeHead.position.y,snakeHead.position.z);
			}
			snakeBorderHead = snakeBorderElements[0];
			snakeTail = snakeElements[snakeElements.length-1];
			snakeBorderTail = snakeBorderElements[snakeBorderElements.length-1];
			secondHead = snakeElements[1];
			calculateCloseDir();
			console.log(closeDir);
			console.log(secondHead.position);
		}
	}, 150);

	//Отрисовка фрагментов
	function loop(){
		console.log('dir:', dir, 'closeDir:', closeDir);
		controls.update();
		renderer.render(scene, camera);	
		requestAnimationFrame(function(){loop();});
	}

	loop();
}