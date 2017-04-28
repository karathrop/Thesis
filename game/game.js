// Detects webgl
if ( ! Detector.webgl ) {
    Detector.addGetWebGLMessage();
    console.log("webgl");
    document.getElementById( 'container' ).innerHTML = "";
}
var socket;
var countdown = 30;
var wallsBroken = 0;

// Graphics variables
var container, stats;
var camera, controls, scene, renderer;
var textureLoader;
var clock = new THREE.Clock();

// Physics variables
var gravityConstant = -9.8;
var collisionConfiguration;
var dispatcher;
var broadphase;
var solver;
var softBodySolver;
var physicsWorld;
var rigidBodies = [];
var margin = 0.05;
var transformAux1 = new Ammo.btTransform();
var currentScene = 1;
var time = 0;
var wall1 = [];
var wall2 = [];
var ground;

var configuration = [
    {brickMass:1.4, ballMass:1.2, color: 0xFFFFFF, label:"Berlin Wall, Germany"},
    {brickMass:1.9, ballMass:1.3, color: 0xC9C9C9, label:"Sacsayhuamán, Peru"},
    {brickMass:2.5, ballMass:1.3, color: 0xC6C6C6, label:"Israeli West Bank barrier wall"},
    {brickMass:3.5, ballMass:2.3, color: 0xC3C3C3, label:"Hadrian’s Wall, England"},
    {brickMass:4.5, ballMass:3.7, color: 0xFF0000, label:"Ancient walls of Istanbul, Turkey"},
    {brickMass:4.5, ballMass:4,   color: 0x00FF00, label:"KC Find all walls"},
    {brickMass:5.5, ballMass:4.6, color: 0x0000FF, label:"Another Wall"},
    {brickMass:6.5, ballMass:5.6, color: 0xF2C0E0, label:"more walls :( "},
    {brickMass:7.5, ballMass:6.7, color: 0xFFCC00, label:"walls are bad"},
    {brickMass:8.5, ballMass:7.5, color: 0xC3F2D4, label:"last wall"}
];

var endGameMessage = "Congrats! You broke <number> walls and saved thousands of people";

var wall1IsBroken = false;
var wall2IsBroken = false;

var scene1Button = document.getElementById("scene1Button");
var scene2Button = document.getElementById("scene2Button");
var scene3Button = document.getElementById("scene3Button");
var scene4Button = document.getElementById("scene4Button");
var scene6Button = document.getElementById("scene6Button");

for(var i = 1; i<=4; i++){
    var button = document.getElementById("scene"+i+"Button");
    button.dataNext=1+i;
    button.addEventListener("click", function(){
        goToNextScene(this.dataNext);
    });
}
scene6Button.addEventListener("click", function(){
    goToNextScene(1);
});

function hideAllScene(){
    var scenes = ['scene1','scene2','scene3','scene4', 'scene5', 'scene6'];
    var videos = ['scene1Video','scene2Video','scene3Video','scene4Video'];
    document.getElementById("scene6").className = "";
    for(var i  = 0; i<scenes.length; i++){
        document.getElementById(scenes[i]).style.display = "none";
        if(document.getElementById(videos[i])){
            document.getElementById(videos[i]).pause();
        }
    }
}

function goToNextScene(scene){
    if(scene === undefined){
        currentScene += 1;    
    }else{
        currentScene = scene;
    }
    if(currentScene > 6) currentScene = 6;
    hideAllScene();
    document.getElementById("scene"+currentScene).style.display="block";
    if(currentScene <= 4){
        document.getElementById("scene"+currentScene+"Video").currentTime = 0;
        document.getElementById("scene"+currentScene+"Video").play();
    }else if(currentScene === 5){
        startNewGame();
    }else if(currentScene === 6){
        var message = endGameMessage.replace("<number>", wallsBroken);
        var labelElement = document.getElementById("scene"+currentScene+"Label");
        labelElement.innerHTML = message;
        labelElement.parentNode.className = "rotateScene";


    }
}

function init() {
    initGraphics();
    initPhysics();
    createObjects();
    animate();
    initSocket();
}

function initGraphics() {
    container = document.getElementById( 'container' );
    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.2, 2000 );
    scene = new THREE.Scene();

    camera.position.x = -10;
    camera.position.y = 4;
    camera.position.z =  0;

    controls = new THREE.OrbitControls( camera );
    controls.target.y = 2;
    controls.enabled = false;
    controls.enablePan = false;
    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor( 0xbfd1e5 );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.shadowMap.enabled = true;

    textureLoader = new THREE.TextureLoader();

    var ambientLight = new THREE.AmbientLight( 0x404040 );
    scene.add( ambientLight );

    var light = new THREE.DirectionalLight( 0xffffff, 1 );
    light.position.set( -10, 10, 5 );
    light.castShadow = true;
    var d = 10;
    light.shadow.camera.left = -d;
    light.shadow.camera.right = d;
    light.shadow.camera.top = d;
    light.shadow.camera.bottom = -d;

    light.shadow.camera.near = 2;
    light.shadow.camera.far = 50;

    light.shadow.mapSize.x = 1024;
    light.shadow.mapSize.y = 1024;

    scene.add( light );

    container.innerHTML = "";

    container.appendChild( renderer.domElement );

    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    container.appendChild( stats.domElement );

    window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function initPhysics() {
    // Physics configuration

    collisionConfiguration = new Ammo.btSoftBodyRigidBodyCollisionConfiguration();
    dispatcher = new Ammo.btCollisionDispatcher( collisionConfiguration );
    broadphase = new Ammo.btDbvtBroadphase();
    solver = new Ammo.btSequentialImpulseConstraintSolver();
    softBodySolver = new Ammo.btDefaultSoftBodySolver();
    physicsWorld = new Ammo.btSoftRigidDynamicsWorld( dispatcher, broadphase, solver, collisionConfiguration, softBodySolver);
    physicsWorld.setGravity( new Ammo.btVector3( 0, gravityConstant, 0 ) );
    physicsWorld.getWorldInfo().set_m_gravity( new Ammo.btVector3( 0, gravityConstant, 0 ) );

}

function createObjects() {
    clearObjects();

    var pos = new THREE.Vector3();
    var quat = new THREE.Quaternion();
    pos.set( 0, - 0.5, 0 );
    quat.set( 0, 0, 0, 1 );
    ground = createParalellepiped( 40, 1, 40, 0, pos, quat, new THREE.MeshPhongMaterial( { color: configuration[wallsBroken].color } ) );
    ground.castShadow = true;
    ground.receiveShadow = true;
    
    wall1 = createWall(pos, quat, configuration[wallsBroken].brickMass, 6, 8, createMaterial(), -8);
    wall2 = createWall(pos, quat, configuration[wallsBroken].brickMass, 6, 8, createMaterial(), pos.z-0.3);   
    document.getElementById("walllabel").innerHTML=configuration[wallsBroken].label; 
}

function clearObjects(){
    for (var i = rigidBodies.length - 1; i >= 0; i--) {
        var body = rigidBodies[i];
        body.material.dispose();
        body.geometry.dispose();
        physicsWorld.removeRigidBody(body.userData.physicsBody);
        scene.remove(body);
    }
    if(ground){
        ground.material.dispose();
        ground.geometry.dispose();
        scene.remove(ground);
    }
    rigidBodies = [];

    wall1IsBroken = false;
    wall2IsBroken = false;
}


function createWall(pos, quat, objectMass, cols, rows, colorMaterial, newZ){
    var bricks = [];
    var brickMass = objectMass;
    var brickLength = 1.2;
    var brickDepth = 0.6;
    var brickHeight = brickLength * 0.5;
    var numBricksLength = cols;
    var numBricksHeight = rows;
    var z0 = newZ;

    pos.set( 0, 0, z0 );
    quat.set( 0, 0, 0, 1 );
    for ( var j = 0; j < numBricksHeight; j ++ ) {

        var oddRow = ( j % 2 ) == 1;

        pos.z = z0;

        if ( oddRow ) {
            pos.z -= 0.25 * brickLength;
        }

        var nRow = oddRow? numBricksLength + 1 : numBricksLength;
        for ( var i = 0; i < nRow; i ++ ) {

            var brickLengthCurrent = brickLength;
            var brickMassCurrent = brickMass;
            if ( oddRow && ( i == 0 || i == nRow - 1 ) ) {
                brickLengthCurrent *= 0.5;
                brickMassCurrent *= 0.5;
            }

            var brick = createParalellepiped( brickDepth, brickHeight, brickLengthCurrent, brickMassCurrent, pos, quat, colorMaterial);
            brick.castShadow = true;
            brick.receiveShadow = true;
            initialPosition = new THREE.Vector3();
            initialPosition.copy(brick.position);
            bricks.push({brick: brick, damage: 0, initialPosition: initialPosition});
            if ( oddRow && ( i == 0 || i == nRow - 2 ) ) {
                pos.z += 0.75 * brickLength;
            }
            else {
                pos.z += brickLength;
            }
        }
        pos.y += brickHeight;
    }
    return bricks;
}

function createRandomColor() {
    return Math.floor( Math.random() * ( 1 << 24 ) );
}

function createMaterial() {
    return new THREE.MeshPhongMaterial( { color: createRandomColor() } );
}

function createParalellepiped( sx, sy, sz, mass, pos, quat, material ) {

    var threeObject = new THREE.Mesh( new THREE.BoxGeometry( sx, sy, sz, 1, 1, 1 ), material );
    var shape = new Ammo.btBoxShape( new Ammo.btVector3( sx * 0.5, sy * 0.5, sz * 0.5 ) );
    shape.setMargin( margin );
    createRigidBody( threeObject, shape, mass, pos, quat );
    return threeObject;

}

function createRigidBody( threeObject, physicsShape, mass, pos, quat, vel, angVel ) {
    if ( pos ) {
        threeObject.position.copy( pos );
    }else {
        pos = threeObject.position;
    }if ( quat ) {
        threeObject.quaternion.copy( quat );
    }else {
        quat = threeObject.quaternion;
    }

    var transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
    transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
    var motionState = new Ammo.btDefaultMotionState( transform );

    var localInertia = new Ammo.btVector3( 0, 0, 0 );
    physicsShape.calculateLocalInertia( mass, localInertia );

    var rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, physicsShape, localInertia );
    var body = new Ammo.btRigidBody( rbInfo );
    body.setFriction( 0.5 );
    if ( vel ) {
        body.setLinearVelocity( new Ammo.btVector3( vel.x, vel.y, vel.z ) );
    }
    if ( angVel ) {
        body.setAngularVelocity( new Ammo.btVector3( angVel.x, angVel.y, angVel.z ) );
    }
    threeObject.userData.physicsBody = body;
    threeObject.userData.collided = false;
    scene.add( threeObject );

    if ( mass > 0 ) {
        rigidBodies.push( threeObject );

        // Disable deactivation
        body.setActivationState( 4 );
    }

    physicsWorld.addRigidBody( body );
    return body;

}

function animate() {
    requestAnimationFrame( animate );
    render();
    stats.update();
    if(countdown <= 0 && currentScene == 5){
        goToNextScene(6);
    }
}

function startNewGame(){
    countdown = 30;
    wallsBroken = 0;
    
    createObjects();
}


function render() {
    var deltaTime = clock.getDelta();

    updatePhysics( deltaTime );

    updateDamage();

    checkIfShouldRebuild();

    controls.update( deltaTime );

    renderer.render( scene, camera );

    time += deltaTime;
    countdown -=deltaTime;
    document.getElementById("countDown").innerHTML=formatTime(countdown);


}

function formatTime(time){
    if(time <= 9){
        return "00:0"+Math.ceil(time);
    }
    return "00:"+ Math.ceil(time);
}

function updateDamage() {
  updateWallDamage(wall1, function() { wall1IsBroken = true; });
  updateWallDamage(wall2, function() { wall2IsBroken = true; });
}

function checkIfShouldRebuild() {
  if (wall1IsBroken && wall2IsBroken) {
    console.log("Both are broken!");
    wallsBroken++;
    createObjects();
    console.log("Wall number:", wallsBroken+1);
  }
}

function updateWallDamage(wall, cb) {
  var totalWallDamage = 0;
  for (var i = 0; i < wall.length; i++) {
    var deltaX = Math.pow(Math.floor(wall[i].brick.position.x) - wall[i].initialPosition.x, 2)
    var deltaY = Math.pow(Math.floor(wall[i].brick.position.y) - wall[i].initialPosition.y, 2)
    var deltaZ = Math.pow(Math.floor(wall[i].brick.position.z) - wall[i].initialPosition.z, 2)
    var delta = Math.sqrt(deltaX + deltaY + deltaZ);
    wall[i].damage = delta < 10 ? delta : 10;
    totalWallDamage += wall[i].damage;
  }
  if (totalWallDamage > 100) {
    cb();
  }
}

function updatePhysics( deltaTime ) {


    // Step world
    physicsWorld.stepSimulation( deltaTime, 10 );

    // Update rigid bodies
    for ( var i = 0, il = rigidBodies.length; i < il; i++ ) {
        var objThree = rigidBodies[ i ];
        var objPhys = objThree.userData.physicsBody;
        var ms = objPhys.getMotionState();
        if ( ms ) {

            ms.getWorldTransform( transformAux1 );
            var p = transformAux1.getOrigin();
            var q = transformAux1.getRotation();
            objThree.position.set( p.x(), p.y(), p.z() );
            objThree.quaternion.set( q.x(), q.y(), q.z(), q.w() );

        }
    }

}

function ThrowBall(mass, targetPosition){
    var pos = new THREE.Vector3();
    var quat = new THREE.Quaternion();
    var mouseCoords = new THREE.Vector2();
    var raycaster = new THREE.Raycaster();
    var ballMaterial = new THREE.MeshBasicMaterial({color: 0x202020, opacity: 0.0, transparent: true, depthWrite: false});

    mouseCoords.set(targetPosition.x,targetPosition.y);
    raycaster.setFromCamera( mouseCoords, camera );
    // Creates a ball and throws it
    var ballMass = mass;
    var ballRadius = 0.4;
    var ball = new THREE.Mesh( new THREE.SphereGeometry( ballRadius, 14, 10 ), ballMaterial );
    ball.castShadow = false;
    ball.receiveShadow = false;
    var ballShape = new Ammo.btSphereShape( ballRadius );
    ballShape.setMargin( margin );
    pos.copy(raycaster.ray.direction);
    pos.add(raycaster.ray.origin);
    pos.set(targetPosition.x, targetPosition.y, targetPosition.z);
    quat.set( 0, 0, 0, 1 );
    var ballBody = createRigidBody( ball, ballShape, ballMass, pos, quat );
    pos.copy( raycaster.ray.direction );
    pos.multiplyScalar( 24 );
    ballBody.setLinearVelocity( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
}

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

function getRandomPositionBasedOnWall(wall){
    var position = new THREE.Vector3();
    var firstBrick = wall[wall.length-1].initialPosition;
    var lastBrick = wall[0].initialPosition;
    position.set(getRandomArbitrary(lastBrick.x, firstBrick.x), 
        getRandomArbitrary(lastBrick.y, firstBrick.y), 
        getRandomArbitrary(lastBrick.z, firstBrick.z))
    return position;
}

document.getElementById("player1").addEventListener("click", function(){
    var position = getRandomPositionBasedOnWall(wall1);
    ThrowBall(configuration[wallsBroken].ballMass, position);

});
document.getElementById("player2").addEventListener("click", function(){
    var position = getRandomPositionBasedOnWall(wall2);
    ThrowBall(configuration[wallsBroken].ballMass, position);

});

function initSocket(){
    socket = io.connect('http://localhost:8899');
    console.log("init socket");
    socket.on('click', function(data) {
        console.log("should go to next scene, current scene is:", currentScene);
        if(currentScene < 5){
            
            goToNextScene();
        }
    });
    socket.on('throwBallLeft', function(data){
        if(currentScene == 5){
            var position = getRandomPositionBasedOnWall(wall1);
            ThrowBall(configuration[wallsBroken].ballMass, position);
        }
    });

    socket.on('throwBallRight', function(data){
        if(currentScene == 5){
            var position = getRandomPositionBasedOnWall(wall2);
            ThrowBall(configuration[wallsBroken].ballMass, position);
        }
    });
}
window.onload = function(){
    init();
}
