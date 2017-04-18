// Detects webgl
if ( ! Detector.webgl ) {
    Detector.addGetWebGLMessage();
    console.log("webgl");
    document.getElementById( 'container' ).innerHTML = "";
}

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
var hinge;
var rope;
var transformAux1 = new Ammo.btTransform();

var time = 0;
var armMovement = 0;

function init() {
    initGraphics();
    initPhysics();
    createObjects();
}

function initGraphics() {
    //var radius = 500, theta = 0;
    // var frustumSize = 1000;
    container = document.getElementById( 'container' );
    // var aspect = window.innerWidth / window.innerHeight;
    // camera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, 1, 1000 );

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

    var pos = new THREE.Vector3();
    var quat = new THREE.Quaternion();

    // Ground
    pos.set( 0, - 0.5, 0 );
    quat.set( 0, 0, 0, 1 );
    var ground = createParalellepiped( 40, 1, 40, 0, pos, quat, new THREE.MeshPhongMaterial( { color: 0xFFFFFF } ) );
    ground.castShadow = true;
    ground.receiveShadow = true;
    createWall(pos, quat, 1.4, 6, 8, createMaterial(), -8);
    createWall(pos, quat, 1.4, 6, 8, createMaterial(), pos.z-0.3);
}


function createWall(pos, quat, objectMass, cols, rows, colorMaterial, newZ){
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

            if ( oddRow && ( i == 0 || i == nRow - 2 ) ) {
                pos.z += 0.75 * brickLength;
            }
            else {
                pos.z += brickLength;
            }
        }
        pos.y += brickHeight;
    }
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

}

function render() {

    var deltaTime = clock.getDelta();

    updatePhysics( deltaTime );

    controls.update( deltaTime );

    renderer.render( scene, camera );

    time += deltaTime;

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


function input(){
    var pos = new THREE.Vector3();
    var quat = new THREE.Quaternion();

    var mouseCoords = new THREE.Vector2();
    var raycaster = new THREE.Raycaster();
//    var ballMaterial = new THREE.MeshPhongMaterial( { color: 0x202020 } );
    var ballMaterial = new THREE.MeshBasicMaterial({color: 0x202020, opacity: 0.05, transparent: true, depthWrite: false});

    window.addEventListener( 'mousedown', function( event ) {
        mouseCoords.set(
            ( event.clientX / window.innerWidth ) * 2 - 1,
            - ( event.clientY / window.innerHeight ) * 2 + 1
        );
        raycaster.setFromCamera( mouseCoords, camera );
        // Creates a ball and throws it
        var ballMass = 0.2;
        var ballRadius = 0.4;
        var ball = new THREE.Mesh( new THREE.SphereGeometry( ballRadius, 14, 10 ), ballMaterial );
        ball.castShadow = false;
        ball.receiveShadow = false;
        var ballShape = new Ammo.btSphereShape( ballRadius );
        ballShape.setMargin( margin );
        pos.copy( raycaster.ray.direction );
        pos.add( raycaster.ray.origin );
        quat.set( 0, 0, 0, 1 );
        var ballBody = createRigidBody( ball, ballShape, ballMass, pos, quat );
        pos.copy( raycaster.ray.direction );
        pos.multiplyScalar( 24 );
        ballBody.setLinearVelocity( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
    }, false );
}
init();
animate();
input();