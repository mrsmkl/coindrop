
var world

function initWorld() {
    world = new b2World(new b2Vec2(0, -10),  true);
    world.SetContactListener(listener);
    initShapes();
    var listener = new Box2D.JSContactListener();
    listener.BeginContact = function (contactPtr) {
        var contact = Box2D.wrapPointer( contactPtr, Box2D.b2Contact );
        var fixtureA = contact.GetFixtureA();
        var fixtureB = contact.GetFixtureB();

        var obj1 = assoc[fixtureA.GetBody().e];
        var obj2 = assoc[fixtureB.GetBody().e];

        // console.log("Here");

        // if (obj1 && obj2) handleCollision(obj1, obj2);

    }

    // Empty implementations for unused methods.
    listener.EndContact = function() {};
    listener.PreSolve = function() {};
    listener.PostSolve = function() {};

}

var delete_list = [];

var bodies = [];
var extra_bodies = [];
var joints = [];

function getFile(fname, cont) {
    var ajax = new XMLHttpRequest();
    ajax.open("GET", fname, true);
    ajax.withCredentials = true;
    ajax.onreadystatechange = function (x) {
        if (ajax.readyState == 4 && typeof ajax.responseText == "string") cont(ajax.responseText, x);
    };
    ajax.send();
}

// getFile("wagon.data", initRules);

var speed = a => a ? a.physics.GetLinearVelocity().Length() : 0;

function raycast(x, y, a) {
    var lst = [];
    var cb = new Box2D.JSRayCastCallback();
    cb.ReportFixture = function (fixPtr) {
        var fixture = Box2D.wrapPointer(fixPtr, Box2D.b2Fixture);
        var mesh = assoc[fixture.GetBody().e];
        if (mesh) lst.push(mesh);
    };
    world.RayCast(cb, new b2Vec2(x,y), new b2Vec2(x+100*Math.cos(a),y+100*Math.sin(a)));
    return lst;
}

models.wagon = function (x,y) {
    var obj = new THREE.Object3D();
    var bottom = addBox(0,0, 8, 1, 0x0022ff);
    bottom.position.set(0,0,0);
    var right = addBox(0,0, 1, 4, 0x0022ff);
    right.position.set(3.5,2.5,0);
    var left = addBox(0,0, 1, 4, 0x0022ff);
    left.position.set(-3.5,2.5,0);
    obj.add(bottom);
    obj.add(right);
    obj.add(left);
    return obj;
}

function makeWagon(x,y) {
    var body = dynamicBody(x,y);

    var shape = new Box2D.b2PolygonShape();
    shape.SetAsBox(4, 0.5);
    body.CreateFixture(shape, 5);
    
    var shape = new Box2D.b2PolygonShape();
    shape.SetAsBox(0.5, 2, new b2Vec2(3.5,2.5), 0);
    body.CreateFixture(shape, 5);
    
    var shape = new Box2D.b2PolygonShape();
    shape.SetAsBox(0.5, 2, new b2Vec2(-3.5,2.5), 0);
    body.CreateFixture(shape, 5);
    
    return makeModel(x, y, "wagon", body);
}

function putWagon(x, y) {
    var wagon = makeWagon(x+0, y-1);
    var w1 = makeWheel(x-4, y-3);
    var w2 = makeWheel(x+4, y-3);
    bodies.forEach((b,i) => b.index = i);
    var j1 = loadRevolute({body1: w1.index, body2: wagon.index, type:"revolute"});
    var j2 = loadRevolute({body1: w2.index, body2: wagon.index, type:"revolute"});
    j1.physics.EnableMotor(false);
    j2.physics.EnableMotor(false);
    joints.push(j1);
    joints.push(j2);
    return wagon;
}

function putBeam(ground, x, y) {
    var obj = makeBeam(x, y);
    bodies.forEach((b,i) => b.index = i);
    var j = loadRevolute({body1: obj.index, body2: ground.index, type:"revolute", collide_connected: true});
    j.physics.EnableMotor(false);
    joints.push(j);
}

function makeGroundBox() {
    var bd_ground = new Box2D.b2BodyDef();
    var ground = world.CreateBody(bd_ground);
    
    var shape = new Box2D.b2PolygonShape();
    shape.SetAsBox(20, 1.5);

    var fd = new b2FixtureDef();
    fd.set_shape(shape);
    fd.set_density(10.0);
    fd.set_friction(0.95);

    ground.CreateFixture(fd);
    return ground;
}

var mouse = new THREE.Vector2();

/*
var grass_texture = loader.load( "grass.png" );
grass_texture.wrapS = grass_texture.wrapT = THREE.RepeatWrapping;
grass_texture.repeat.set(0.1, 0.1);
grass_texture.offset.y = 0.5;

var t_texture = loader.load("tausta.png");
*/

function makeBG() {
    var mesh = new THREE.Mesh(new THREE.PlaneGeometry(100,50), new THREE.MeshStandardMaterial({color:0x111111}));
    scene.add(mesh);
    mesh.position.z = -12;
    mesh.position.y = 0;
    return mesh;
}

var bg = makeBG();

function makeExtension(x,y,a) {
    var gbox = addBox(0,-8.5,40,3, 0x00ff00);
    gbox.material.map = grass_texture;
    gbox.physics = makeGroundBox();
    gbox.physics.SetTransform(new b2Vec2(x,y), a || 0);
    scene.add(gbox);
    extra_bodies.push(gbox);
    return gbox;
}

function addDelete(obj) {
    if (obj && !delete_list.find(a => a == obj)) delete_list.push(obj);
}

var speed = a => a ? a.physics.GetLinearVelocity().Length() : 0;

// elem("#music").volume = 0.2

function handleCollision(a,b) {
    if (speed(a) < 5 && speed(b) < 5 || a.obj_type == "wheel" || b.obj_type == "wheel" ) return;
    play("#hit",0);
}



var renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lights
var ambient = new THREE.AmbientLight(0x101010);
// scene.add(ambient);


var hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
hemiLight.color.setHSL(0.6, 1, 0.6);
hemiLight.groundColor.setHSL(0.095, 1, 0.75);
hemiLight.position.set(0, 500, 0);

var light = new THREE.PointLight(0xffffff, 1, 0);
// slight = new THREE.PointLight(0xffffff, 1, 100);
light.position.set(3, 3, 10);

// scene.add(light);

var light2 = new THREE.DirectionalLight(0xffffff, 1, 10000);
light2.position.set(10, 100, 300);

scene.add(light2);

function handleResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
}

function handleMove(event) {
    event.preventDefault();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function handle_wheel(ev) {
    camera.position.z += ev.deltaY*0.01;
}

function handle_stupid_wheel(ev) {
    camera.position.z += ev.detail*0.1;
}

window.addEventListener('mousewheel', handle_wheel, false);
window.addEventListener('DOMMouseScroll', handle_stupid_wheel, false);
window.addEventListener('resize', handleResize, false);
window.addEventListener('mousemove', handleMove, false);

var log = [];

function updateLog(str) {
    if (log.length == 10) log = log.slice(1);
    log.push(str);
    elem("#log").innerHTML = log.join("<br>");
}

function makeStation(s) {
    var box = addBox(0,0,4,1, 0xffffff);
    box.material.map = makeText(s.name);
    box.material.needsUpdate = true;
    box.position.set(s.x+pos,s.y,-10)
    scene.add(box);
    s.obj = box;
    s.time = 0;
    s.time_limit = s.time_limit || 50;
    stations.push(s);
    return box;
}

function collectBoxes(s) {
    bodies.filter(a => a.obj_type == "box" && s.obj.position.distanceTo(a.position) < 10).forEach(removeBody); 
}

function once(f) {
    var done = false;
    return () => { if (done) return; done = true; f(); }
}

var stations = [];

var levels = [];

function createLevels() {
    levels[0] = {
        points: makeGame(20),
        stations: [
        ]
    }

    levels[1] = {
        points: makeFlat(100),
        stations: [
            {x:5, y: 1, name:"Box 2", action: (s) => makeBox(s.obj.position.x, 10) },
            {x:30, y: 1, name:"Box 2", action: (s) => makeLillibro(s.obj.position.x, 10) },
            {x:60, y: 1, name:"Collect", action: (s) => collectBoxes(s) },
            {x:95, y:1, name:"End 2", time_limit: 10, action: once(() => makeLevel(levels[2])) }
        ]
    }

    levels[2] = {
        points: makeRandom(2.5),
        stations: [
            {x:5, y: 1, name:"Box 2", action: (s) => makeBox(s.obj.position.x, 10) },
            {x:520, y:1, name:"End 2", time_limit: 10, action: once(() => makeLevel(levels[3])) }
        ]
    }

    levels[3] = {
        points: makeRandom(3),
        stations: [
            {x:5, y: 1, name:"Box 2", action: (s) => makeBox(s.obj.position.x, 10) },
            {x:520, y:1, name:"End 2", time_limit: 10, action: once(() => makeLevel(levels[4])) }
        ]
    }

    levels[4] = {
        points: makeRandom(3.5),
        stations: [
            {x:5, y: 1, name:"Box 2", action: (s) => makeBox(s.obj.position.x, 10) },
            {x:520, y:1, name:"End 2", time_limit: 10, action: once(() => makeLevel(levels[5])) }
        ]
    }

    levels[5] = {
        points: makeRandom(4),
        stations: [
            {x:5, y: 1, name:"Box 2", action: (s) => makeBox(s.obj.position.x, 10) },
            {x:520, y:1, name:"End 2", time_limit: 10, action: once(() => makeLevel(levels[6])) }
        ]
    }

    levels[6] = {
        points: makeRandom(4.5),
        stations: [
            {x:5, y: 1, name:"Box 2", action: (s) => makeBox(s.obj.position.x, 10) },
            {x:520, y:1, name:"End 2", time_limit: 10, action: once(() => makeLevel(levels[7])) }
        ]
    }
}

var cur_level;

var pos = 0;

var cur_levels;

function makeLevel(level) {
    t = 0;
    time_limit = level.time_limit || 30;
    var ground = groundBody(level.points);
    scene.add(ground);
    level.stations.forEach(makeStation);
    moveBody(ground, pos, 0);
    pos += largest(ground.obj_info.points, p => p.x).x;
    ground.obj_info.pos = pos;
    bodies.push(ground);
    cur_levels.push(ground);
}

function initGame() {
    camera.position.z = 25
    camera.position.x = 5
    camera.position.y = -10
    initWorld();
    createLevels();
    cur_levels = [];
    cur_level = levels[0];
    pos = 0;
    putWagon(-5, -14);
    makeLillibro(-5, -12);
    putWagon(25, -14);
    makeLillibro(25, -12);
    makeLevel(levels[0]);
}

function resetWagon() {
    extra_bodies.forEach(a => { scene.remove(a); world.DestroyBody(a.physics); });
    bodies.forEach(a => { scene.remove(a); world.DestroyBody(a.physics); if (pool[a.obj_type]) pool[a.obj_type].push(a); });
    joints.forEach(a => { scene.remove(a); pool[a.obj_type].push(a); });
    stations.forEach(a => { scene.remove(a.obj); });
    bodies = [];
    joints = [];
    extra_bodies = [];
    stations = [];

    initGame();
    updateLog("Oops, dropped out!");
}

var last_pos = new THREE.Vector3();

function followWagon() {
    var wagon = bodies.find(a => a.obj_type == "wagon");
    if (!wagon) return;
    // if (wagon.position.y < -100.0) return resetWagon();
    // Check for location
    /*
    stations.forEach(a => {
        if (Math.abs(a.obj.position.x - wagon.position.x) < 2) {
            a.time++;
            var sz = 1+a.time/10;
            a.obj.scale.set(sz, sz, 1);
            if (a.time > a.time_limit) {
                a.time = 0;
                if (a.action) a.action(a);
                if (a.event) handleEvent(a.event);
            }
        }
        else {
            a.obj.scale.set(1,1,1);
            a.time = 0;
        }
    });
    elem("#message").innerHTML = Math.floor((time_limit - t/60)*10)/10.0 + "s";
    elem("#message2").innerHTML = Math.floor((pos - wagon.position.x)*5)/10.0 + "m";
    elem("#message3").innerHTML = Math.floor((wagon.position.distanceTo(last_pos))*30*3600/1000) + "km/h";
    */
    
    last_pos = wagon.position.clone();
    // Follow
    wagon.physics.SetAwake(true);
    var a = mouse.x*0.5
    // var a = camera.rotation.z = mouse.x*0.5
    // camera.position.x = wagon.position.x;
    // camera.position.y = wagon.position.y;
    light.position.x = camera.position.x + 3;
    var x = 10*Math.cos(a-Math.PI/2);
    var y = 10*Math.sin(a-Math.PI/2);
    // world.SetGravity(new b2Vec2(x,y));
    /////
    var x1 = 0;
    var x2 = cur_levels[0].obj_info.pos;
    var i = 0;
    while (wagon.position.x > x2) {
        i++;
        if (i >= cur_levels.length) break;
        x1 = x2;
        x2 = cur_levels[i].obj_info.pos;
    }
    var rate = (wagon.position.x - x1) / (x2-x1);
    rate = rate - 0.5;
    var bg_size = 100;
    // bg.position.x = -rate*bg_size + wagon.position.x;
}

var t = 0;

function updateGame() {
    if (!world) return;
    t++;
    followWagon();
    world.Step(1/60, 10, 10);
    world.Step(1/60, 10, 10);
    bodies.forEach(updateBody);
    extra_bodies.forEach(updateBody);
}

function animate() {
    requestAnimationFrame(animate);
    updateGame();
    renderer.render(scene, camera);
}

requestAnimationFrame(animate);

Box2D.then(initGame);

document.body.onkeydown = function (ev) {
    if (ev.keyCode == 32) {
        makeHexagon(camera.position.x, camera.position.y+20)
    }
    else if (ev.keyCode == 38) {
        camera.position.y += 1
    }
    else if (ev.keyCode == 40) {
        camera.position.y -= 1
    }
    else if (ev.keyCode == 39) {
        camera.position.x += 1
    }
    else if (ev.keyCode == 37) {
        camera.position.x -= 1
    }
    else if (ev.keyCode == 107) {
        camera.position.z -= 2
    }
    else if (ev.keyCode == 109) {
        camera.position.z += 2
    }
    else console.log(ev.keyCode)
}




