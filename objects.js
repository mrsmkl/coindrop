
var elem = str => document.querySelector(str);

// var setting_level = "low";
// var setting_level = "high";
// var setting_level = "normal";

var setting_levels = {
    "#low": "low",
    "#high": "high",
    "#normal": "normal",
};

var setting_level = setting_levels[window.location.hash] || localStorage.getItem("builder_gfx_settings") || "normal";

function changeSettings(str) {
    localStorage.setItem("builder_gfx_settings", str)
}

function play(str, offset) {
    var snd = elem(str);
    snd.currentTime = offset == undefined ? 0.5 : offset;
    snd.play();
}

var Box2D = Box2D();

var b2Vec2=Box2D.b2Vec2, b2BodyDef = Box2D.b2BodyDef, b2Body = Box2D.b2Body;
var b2FixtureDef = Box2D.b2FixtureDef;
var b2Fixture = Box2D.b2Fixture;
var b2World = Box2D.b2World;
var b2MassData = Box2D.b2MassData;
var b2PolygonShape = Box2D.b2PolygonShape;
var b2ChainShape = Box2D.b2ChainShape;
var b2CircleShape = Box2D.b2CircleShape;

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 3000 );
camera.position.set( 0, 0, 10 );

var mode = "title";

function rotateBody(obj, a) {
    obj.physics.SetTransform(obj.physics.GetPosition(), a);
}

function moveBody(obj, x, y) {
    obj.physics.SetTransform(new b2Vec2(x,y), obj.physics.GetAngle());
    obj.physics.SetAwake(true);
}

function addBox(x, y, w, h, color) {
    if (typeof w != 'number') w = 1;
    if (typeof h != 'number') h = 1;
    var geometry = new THREE.BoxGeometry( w, h, 1 );
    var material = new THREE.MeshLambertMaterial( { color: color, overdraw: 0.5 } );
    // var material = new THREE.MeshPhongMaterial( { color: 0xffdd99 } );
    var cube = new THREE.Mesh( geometry, material );
    cube.position.set(x,y,-9);
    cube.castShadow = true;
    cube.receiveShadow = true;
    return cube;
}

function simpleBox(x, y, w, h, color) {
    if (typeof w != 'number') w = 1;
    if (typeof h != 'number') h = 1;
    var geometry = new THREE.BoxGeometry( w, h, 1 );
    var material = new THREE.MeshLambertMaterial( { color: color, overdraw: 0.5 } );
    // var material = new THREE.MeshPhongMaterial( { color: 0xffdd99 } );
    var cube = new THREE.Mesh( geometry, material );
    cube.position.set(x,y,-9);
    cube.castShadow = true;
    cube.receiveShadow = true;
    return cube;
}

function addShinyBox(x, y, w, h, color) {
    if (typeof w != 'number') w = 1;
    if (typeof h != 'number') h = 1;
    var geometry = new THREE.BoxGeometry( w, h, 1 );
    // var material = new THREE.MeshLambertMaterial( { color: color, overdraw: 0.5 } );
    var material = new THREE.MeshPhongMaterial( { color: color, specular: color } );
    material.shininess = 100;
    var cube = new THREE.Mesh( geometry, material );
    cube.position.set(x,y,-9);
    cube.castShadow = true;
    cube.receiveShadow = true;
    scene.add( cube );
    return cube;
}

function addCylinder(x, y, w, h, color) {
    if (typeof w != 'number') w = 1;
    if (typeof h != 'number') h = 1;
    var geometry = new THREE.CylinderGeometry( w/2, w/2, h, 30 );
    var material = new THREE.MeshLambertMaterial( { color: color, overdraw: 0.5 } );
    // var material = new THREE.MeshPhongMaterial( { color: 0xffdd99 } );
    var cube = new THREE.Mesh( geometry, material );
    cube.position.set(x,y,-9);
    cube.castShadow = true;
    cube.receiveShadow = true;
    return cube;
}

function addPointer() {
    var geometry = new THREE.BoxGeometry(2, 2, 0.2);
    var material = new THREE.MeshLambertMaterial({ color: 0xff3322, overdraw: 0.5 } );
    material.transparent = true;
    material.opacity = 0.4;
    var cube = new THREE.Mesh( geometry, material );
    cube.position.set(-0,-100,-7);
    scene.add(cube);
    return cube;
}

function addMapBox(x,y,type) {
    var cube = types[type].mapMarker();
    cube.position.set(x,y,0);
    map.add(cube);
    cube.material.transparent = true;
    cube.obj_type = "map_marker";
    // cube.castShadow = true;
    return cube;
}

function addTriangle(x,y) {
    var shape = new THREE.Shape();
    shape.moveTo(-5, -1.0);
    shape.lineTo( 0,  1.0);
    shape.lineTo( 5, -1.0);

    var geom = new THREE.ExtrudeGeometry(shape, {amount:1.5, bevelEnabled: false});
    // geom.rotateZ(-Math.PI/2);
    // var mesh = new THREE.Mesh(geom, new THREE.MeshPhongMaterial({ color: 0xff0000 })) ;
    
    var c = (num) => new THREE.Vector2(geom.vertices[num].x*0.1, (geom.vertices[num].y+geom.vertices[num].z)*0.1);
    geom.faces.forEach((f, i) => geom.faceVertexUvs[0][i] = [c(f.a), c(f.b), c(f.c)]);
    geom.uvsNeedUpdate = true;
    
    var mesh = new THREE.Mesh(geom, new THREE.MeshPhongMaterial({ map: spots_texture })) ;
    mesh.position.set(x,y,-9);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    scene.add( mesh );
    return mesh;
}

function mouthGeom_() {
    var shape = new THREE.Shape();
    shape.moveTo( -5,-1 );
    shape.bezierCurveTo(-2, 2, 2, 2, 5, -1,0);
    shape.lineTo( 5, 1);
    shape.bezierCurveTo(2, 4, -2, 4, -5, 1,0);
    shape.lineTo( -5, -1);
    
    /*var shape2 = new THREE.Shape();
    shape2.moveTo( -5,-1.0 );
    shape2.bezierCurveTo(-2, -4, 2, -4, 5, -1,0);
    shape2.lineTo( 5, 1);
    shape2.bezierCurveTo(2, -2, -2, -2, -5, 1,0);
    shape2.lineTo( -5, -1);
    */
    
    var geom = new THREE.ExtrudeGeometry(shape, {
        amount: 1,
        bevelEnabled: true, bevelSegments: 5, steps: 5, bevelSize: 0.3,bevelThickness: 0.3
    });
    geom.morphTargets.push({
        name: "sad",
        vertices: geom.vertices.map(a => a.clone())
    });
    geom.morphTargets.push({
        name: "happy",
        // vertices: geom2.vertices.map(a => a.clone())
        vertices: geom.vertices.map(a => {var v = a.clone(); v.y = v.y+Math.pow(v.x,2); return v})
    });
    geom.vertices.forEach(v => v.y = v.y-Math.abs(v.x));
    geom.computeVertexNormals();
    geom.computeMorphNormals();
    return geom;
}

function mouthGeom() {
    // var geom = new THREE.CylinderGeometry(0.75, 0.75, 5, 10, 10);
    var geom = new THREE.BoxGeometry(1.5, 5, 0.75, 1, 10);
    geom.rotateZ(Math.PI/2);
    geom.scale(1,1,1);
    geom.morphTargets.push({
        name: "sad",
        vertices: geom.vertices.map(a => {var v = a.clone(); v.y = v.y-Math.pow(v.x,2)+(2.5*2.5); return v})
    });
    /*
    geom.morphTargets.push({
        name: "happy",
        vertices: geom.vertices.map(a => {var v = a.clone(); v.y = v.y+Math.pow(v.x,2); return v})
    });
    */
    geom.computeVertexNormals();
    geom.computeMorphNormals();
    return geom;
}

var mouth_geom = mouthGeom();

function addMouth(x,y) {
    var mesh = new THREE.Mesh(mouth_geom, new THREE.MeshPhongMaterial({ color: 0xff0000, morphTargets: true, morphNormals: true }));
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.scale.set(0.08, 0.08, 0.08);

    return mesh;
}


var temp, shape, mini_shape

var horn_shape_1, horn_shape_2, bar_shape, t_shape, big_horn_shape_1, big_horn_shape_2

function initShapes() {
    temp = new b2Vec2(0,0);

    shape = new Box2D.b2PolygonShape();
    shape.SetAsBox(0.5, 0.5);

    mini_shape = new Box2D.b2PolygonShape();
    mini_shape.SetAsBox(0.1, 0.5);
    
    horn_shape_1 = horn_shape(Math.PI/6+Math.PI/2, 1);
    horn_shape_2 = horn_shape(-Math.PI/6+Math.PI/2, 1);
    bar_shape = createPolygonShape([new b2Vec2(-0.5,-0.25),new b2Vec2(0.5,-0.25),new b2Vec2(0.4,0.25),new b2Vec2(-0.4,0.25)]);
    t_shape = createPolygonShape([new b2Vec2(-5,-1.0),new b2Vec2(0,1.0),new b2Vec2(5,-1.0)]);
    big_horn_shape_1 = horn_shape(Math.PI/6+Math.PI/2, 2);
    big_horn_shape_2 = horn_shape(-Math.PI/6+Math.PI/2, 2);
}

var extra_shape = (x,y) => createPolygonShape([new b2Vec2(-0.5+x,-0.5+y),new b2Vec2(0.5+x,-0.5+y),new b2Vec2(0.5+x,0.5+y),new b2Vec2(-0.5+x,0.5+y)]);

function makeBox(x, y) {
    temp.Set(x,y);
    var bd = new Box2D.b2BodyDef();
    bd.set_type(Box2D.b2_dynamicBody);
    bd.set_position(temp);
    var body = world.CreateBody(bd);

    body.CreateFixture(shape, 5.0);

    return makeModel(x, y, "box", body);
}

function makeJunkBox(x, y) {
    temp.Set(x,y);
    var bd = new Box2D.b2BodyDef();
    bd.set_type(Box2D.b2_dynamicBody);
    bd.set_position(temp);
    var body = world.CreateBody(bd);

    var fd = new Box2D.b2FixtureDef();
    fd.set_density(0.1);
    fd.set_friction(1);
    fd.set_restitution(0.1);
    fd.set_shape(shape);
    body.CreateFixture(fd);
    
    // body.CreateFixture(shape, 5.0);

    return makeModel(x, y, "junkbox", body);
}
/*
function makeJunk(x, y) {
    var dir = Math.PI*2*Math.random();
    var dx = Math.sqrt(2)*Math.cos(dir);
    var dy = Math.sqrt(2)*Math.sin(dir);
    var b1 = makeJunkBox(x-dx,y+dy);
    var b2 = makeJunkBox(x+dx,y-dy);
    
    var info = {body1: bodies.length-2, body2: bodies.length-1};
    info.loc = {x:Math.sqrt(2), y:0};
    return loadGlue(info);
    
    return b1;
}
*/

function addWheel(x,y) {
    var geometry = new THREE.TorusGeometry( 10, 4, 10, 30 );
    var material = new THREE.MeshPhongMaterial( { color: 0x221122 } );
    var torus = new THREE.Mesh( geometry, material );
    torus.scale.set(1/14, 1/14, 1/14);
    torus.position.set(x,y,-9);
    scene.add( torus );
    var in_wheel = new THREE.Mesh( new THREE.CylinderGeometry(8, 8, 3),  new THREE.MeshPhongMaterial( { color: 0x667755 } ));
    in_wheel.rotateX(Math.PI/2);
    torus.add(in_wheel);
    var axel = new THREE.Mesh( new THREE.BoxGeometry(4, 4, 4),  new THREE.MeshPhongMaterial( { color: 0x444488 } ));
    torus.add(axel);
    return torus;
}

function makeCar(x, y) {
    temp.Set(x,y);
    var bd = new Box2D.b2BodyDef();
    bd.set_type(Box2D.b2_dynamicBody);
    bd.set_position(temp);
    var shape = new Box2D.b2PolygonShape();
    shape.SetAsBox(4, 2);
    var body = world.CreateBody(bd);
    body.CreateFixture(shape, 5.0);
    var box = addBox(x, y, 1, 1, 0xffffff);
    scene.add(box);
    var box2 = new THREE.Mesh(new THREE.BoxGeometry(8,2,1),  new THREE.MeshPhongMaterial( { color: 0xffffff } ));
    box2.position.set(0,-1,0);
    box.add(box2);
    var box3 = new THREE.Mesh(new THREE.BoxGeometry(6,2,1),  new THREE.MeshPhongMaterial( { color: 0xffffff } ));
    box3.position.set(-1,1,0);
    box.add(box3);
    var box5 = new THREE.Mesh(new THREE.BoxGeometry(2,0.2,1),  new THREE.MeshPhongMaterial( { color: 0xffffff } ));
    box5.position.set(3,1.9,0);
    box.add(box5);
    var box4 = new THREE.Mesh(new THREE.BoxGeometry(2,1.8,1),  new THREE.MeshPhongMaterial( { color: 0x0000ff } ));
    box4.material.opacity = 0.2;
    box4.material.transparent = true;
    box4.position.set(3,0.9,0);
    box.add(box4);
    var head = addHead(0,0);
    head.position.set(3,0.9,0);
    head.rotateY(Math.PI/4);
    box.add(head);
    var h_body = addCylinder(x,y,1,2,0x7788ff);
    h_body.position.set(3,0.9-1.5,0);
    box.add(h_body);
    // var box = addBox(0,0, 8, 4);
    box.physics = body;
    extra_bodies.push(box);
    var wheel1 = addWheel(x+2, y-3.5);
    var wheel2 = addWheel(x-2, y-3.5);
    var circleShape = new b2CircleShape();
    circleShape.set_m_radius(1);
    
    var fd = new b2FixtureDef();
    fd.set_shape(circleShape);
    fd.set_density(5.0);
    fd.set_friction(0.95);
    
    bd.set_position(new b2Vec2(x+2, y-3.5));
    var w1 = world.CreateBody(bd);
    w1.CreateFixture(fd);
    
    bd.set_position(new b2Vec2(x-2, y-3.5));
    var w2 = world.CreateBody(bd);
    w2.CreateFixture(fd);
    
    var m_hz = 4.0;
    var m_zeta = 0.7;

    var jd = new Box2D.b2WheelJointDef();
    var axis = new b2Vec2(0.0, 1.0);

    jd.Initialize(body, w2, w2.GetPosition(), axis);
    jd.set_motorSpeed(0.0);
    jd.set_maxMotorTorque(20000.0);
    jd.set_enableMotor(true);
    jd.set_frequencyHz(m_hz);
    jd.set_dampingRatio(m_zeta);
    var rearWheelJoint = Box2D.castObject( world.CreateJoint(jd), Box2D.b2WheelJoint );
    rearWheelJoint.SetMotorSpeed(-3);
    
    jd.Initialize(body, w1, w1.GetPosition(), axis);
    jd.set_maxMotorTorque(20000.0);
    jd.set_enableMotor(false);
    jd.set_frequencyHz(m_hz);
    jd.set_dampingRatio(m_zeta);
    var frontWheelJoint = Box2D.castObject( world.CreateJoint(jd), Box2D.b2WheelJoint );
    frontWheelJoint.SetMotorSpeed(-3);
    
    wheel1.physics = w1;
    wheel2.physics = w2;
    wheel1.joint = frontWheelJoint;
    wheel2.joint = rearWheelJoint;
    
    extra_bodies.push(wheel1);
    extra_bodies.push(wheel2);
    
    box.wheels = [wheel1, wheel2];
    box.obj_type = "car";
    return box;
}

function makeBus(x, y, num) {
    temp.Set(x,y);
    var bd = new Box2D.b2BodyDef();
    bd.set_type(Box2D.b2_dynamicBody);
    bd.set_position(temp);
    var shape = new Box2D.b2PolygonShape();
    shape.SetAsBox(6, 2);
    var body = world.CreateBody(bd);
    body.CreateFixture(shape, 50.0);
    var box = addBox(x, y, 0.1, 0.1);
    scene.add(box);
    var box2 = new THREE.Mesh(new THREE.BoxGeometry(12,2,1),  new THREE.MeshPhongMaterial( { color: 0xffff11 } ));
    box2.position.set(0,-1,0);
    box.add(box2);
    var box3 = new THREE.Mesh(new THREE.BoxGeometry(12,0.2,1),  new THREE.MeshPhongMaterial( { color: 0xffff11 } ));
    box3.position.set(0,1.9,0);
    box.add(box3);
        var box4 = new THREE.Mesh(new THREE.BoxGeometry(12,1.8,1),  new THREE.MeshPhongMaterial( { color: 0x0000ff } ));
        box4.material.opacity = 0.2;
        box4.material.transparent = true;
        box4.position.set(0,0.9,0);
        box.add(box4);
    function addWindow(x) {
        var box5 = new THREE.Mesh(new THREE.BoxGeometry(0.2,1.8,0.2),  new THREE.MeshPhongMaterial( { color: 0xffff11 } ));
        box5.position.set(x-1,0.9,0.41);
        box.add(box5);
        var box5 = new THREE.Mesh(new THREE.BoxGeometry(0.2,1.8,0.2),  new THREE.MeshPhongMaterial( { color: 0xffff11 } ));
        box5.position.set(x-1,0.9,-0.41);
        box.add(box5);
    }
    addWindow(5);
    addWindow(2.5);
    addWindow(-2.5);
    addWindow(0);
    addWindow(-4.9);
    var head = addHead(0,0);
    head.position.set(5,0.9,0);
    head.rotateY(Math.PI/4);
    box.add(head);
    var h_body = addCylinder(x,y,1,2,0x7788ff);
    h_body.position.set(5,0.9-1.5,0);
    box.add(h_body);
    
    for (var i = 0; i < num; i++) {
        var xc = -4.9 + (i/num)*8;
        var head = addHead(0,0);
        head.position.set(xc,0.9,0);
        head.rotateY(Math.PI/4);
        head.scale.set(0.5, 0.5, 0.5);
        box.add(head);
        var h_body = addCylinder(0,0,1,2,0x40E0D0);
        h_body.scale.set(0.5, 0.5, 0.5);
        h_body.position.set(xc,0.9-0.75,0);
        box.add(h_body);
    }
    
    // var box = addBox(0,0, 8, 4);
    box.physics = body;
    extra_bodies.push(box);
    var wheel1 = addWheel(x+3, y-3);
    var wheel2 = addWheel(x-3, y-3);
    var wheel3 = addWheel(x-1.5, y-3);
    var circleShape = new b2CircleShape();
    circleShape.set_m_radius(1);
    
    var fd = new b2FixtureDef();
    fd.set_shape(circleShape);
    fd.set_density(100.0);
    fd.set_friction(0.95);
    
    bd.set_position(new b2Vec2(x+4, y-3));
    var w1 = world.CreateBody(bd);
    w1.CreateFixture(fd);
    
    bd.set_position(new b2Vec2(x-4, y-3));
    var w2 = world.CreateBody(bd);
    w2.CreateFixture(fd);
    
    bd.set_position(new b2Vec2(x-1.5, y-3));
    var w3 = world.CreateBody(bd);
    w3.CreateFixture(fd);
    
    var m_hz = 4.0;
    var m_zeta = 0.7;

    var jd = new Box2D.b2WheelJointDef();
    var axis = new b2Vec2(0.0, 1.0);

    jd.Initialize(body, w2, w2.GetPosition(), axis);
    jd.set_motorSpeed(0.0);
    jd.set_maxMotorTorque(20000.0);
    jd.set_enableMotor(true);
    jd.set_frequencyHz(m_hz);
    jd.set_dampingRatio(m_zeta);
    var rearWheelJoint = Box2D.castObject( world.CreateJoint(jd), Box2D.b2WheelJoint );
    rearWheelJoint.SetMotorSpeed(-3);
    
    jd.Initialize(body, w1, w1.GetPosition(), axis);
    jd.set_maxMotorTorque(20000.0);
    jd.set_enableMotor(true);
    jd.set_frequencyHz(m_hz);
    jd.set_dampingRatio(m_zeta);
    var frontWheelJoint = Box2D.castObject( world.CreateJoint(jd), Box2D.b2WheelJoint );
    frontWheelJoint.SetMotorSpeed(-3);
    
    jd.Initialize(body, w3, w3.GetPosition(), axis);
    jd.set_maxMotorTorque(20000.0);
    jd.set_enableMotor(true);
    jd.set_frequencyHz(m_hz);
    jd.set_dampingRatio(m_zeta);
    var b2WheelJoint = Box2D.castObject( world.CreateJoint(jd), Box2D.b2WheelJoint );
    b2WheelJoint.SetMotorSpeed(-3);
    
    wheel1.physics = w1;
    wheel2.physics = w2;
    wheel3.physics = w3;
    
    extra_bodies.push(wheel1);
    extra_bodies.push(wheel2);
    extra_bodies.push(wheel3);
    
}

function makeTruck(x, y) {
    temp.Set(x,y);
    var bd = new Box2D.b2BodyDef();
    bd.set_type(Box2D.b2_dynamicBody);
    bd.set_position(temp);
    var shape = new Box2D.b2PolygonShape();
    var body = world.CreateBody(bd);
    shape.SetAsBox(6, 0.5, new b2Vec2(0, -1.5), 0);
    body.CreateFixture(shape, 50.0);
    shape.SetAsBox(1.5, 2, new b2Vec2(4.5, 0), 0);
    body.CreateFixture(shape, 50.0);
    var box = addBox(x, y, 0.1, 0.1);
    scene.add(box);
    box.material.opacity = 0;
    box.material.transparent = true;
    var box2 = new THREE.Mesh(new THREE.BoxGeometry(12,1,1),  new THREE.MeshPhongMaterial( { color: 0x1111ff } ));
    box2.position.set(0,-1.5,0);
    box.add(box2);
    var box3 = new THREE.Mesh(new THREE.BoxGeometry(2.8,0.2,1),  new THREE.MeshPhongMaterial( { color: 0x1111ff } ));
    box3.position.set(4.6,1.9,0);
    box.add(box3);
    var box5 = new THREE.Mesh(new THREE.BoxGeometry(3,1,1),  new THREE.MeshPhongMaterial( { color: 0x1111ff } ));
    box5.position.set(4.5,-0.5,0);
    box.add(box5);
    var box6 = new THREE.Mesh(new THREE.BoxGeometry(0.2,4,1),  new THREE.MeshPhongMaterial( { color: 0x1111ff } ));
    box6.position.set(3.1,0,0);
    box.add(box6);
    var box4 = new THREE.Mesh(new THREE.BoxGeometry(2.8,1.8,1),  new THREE.MeshPhongMaterial( { color: 0x0000ff } ));
    box4.material.opacity = 0.2;
    box4.material.transparent = true;
    box4.position.set(4.6,0.9,0);
    box.add(box4);
    var head = addHead(0,0);
    head.position.set(5,0.9,0);
    head.rotateY(Math.PI/4);
    box.add(head);
    var h_body = addCylinder(x,y,1,2,0x7788ff);
    h_body.position.set(5,0.9-1.5,0);
    box.add(h_body);
    // var box = addBox(0,0, 8, 4);
    box.physics = body;
    extra_bodies.push(box);
    var wheel1 = addWheel(x+3, y-3);
    var wheel2 = addWheel(x-3, y-3);
    var wheel3 = addWheel(x-1.5, y-3);
    var circleShape = new b2CircleShape();
    circleShape.set_m_radius(1);
    
    var fd = new b2FixtureDef();
    fd.set_shape(circleShape);
    fd.set_density(100.0);
    fd.set_friction(0.95);
    
    bd.set_position(new b2Vec2(x+4, y-3));
    var w1 = world.CreateBody(bd);
    w1.CreateFixture(fd);
    
    bd.set_position(new b2Vec2(x-4, y-3));
    var w2 = world.CreateBody(bd);
    w2.CreateFixture(fd);
    
    bd.set_position(new b2Vec2(x-1.5, y-3));
    var w3 = world.CreateBody(bd);
    w3.CreateFixture(fd);
    
    var m_hz = 4.0;
    var m_zeta = 0.7;

    var jd = new Box2D.b2WheelJointDef();
    var axis = new b2Vec2(0.0, 1.0);

    jd.Initialize(body, w2, w2.GetPosition(), axis);
    jd.set_motorSpeed(0.0);
    jd.set_maxMotorTorque(20000.0);
    jd.set_enableMotor(true);
    jd.set_frequencyHz(m_hz);
    jd.set_dampingRatio(m_zeta);
    var rearWheelJoint = Box2D.castObject( world.CreateJoint(jd), Box2D.b2WheelJoint );
    rearWheelJoint.SetMotorSpeed(-3);
    
    jd.Initialize(body, w1, w1.GetPosition(), axis);
    jd.set_maxMotorTorque(20000.0);
    jd.set_enableMotor(true);
    jd.set_frequencyHz(m_hz);
    jd.set_dampingRatio(m_zeta);
    var frontWheelJoint = Box2D.castObject( world.CreateJoint(jd), Box2D.b2WheelJoint );
    frontWheelJoint.SetMotorSpeed(-3);
    
    jd.Initialize(body, w3, w3.GetPosition(), axis);
    jd.set_maxMotorTorque(20000.0);
    jd.set_enableMotor(true);
    jd.set_frequencyHz(m_hz);
    jd.set_dampingRatio(m_zeta);
    var b2WheelJoint = Box2D.castObject( world.CreateJoint(jd), Box2D.b2WheelJoint );
    b2WheelJoint.SetMotorSpeed(-3);
    
    wheel1.physics = w1;
    wheel2.physics = w2;
    wheel3.physics = w3;
    
    extra_bodies.push(wheel1);
    extra_bodies.push(wheel2);
    extra_bodies.push(wheel3);
    
    box.obj_type = "truck";
    box.setSpeed = function (x) {
        rearWheelJoint.SetMotorSpeed(x);
        frontWheelJoint.SetMotorSpeed(x);
        b2WheelJoint.SetMotorSpeed(x);
    };
    
    return box;
    
}

function makeBulldozer(x, y) {
    temp.Set(x,y);
    var bd = new Box2D.b2BodyDef();
    bd.set_type(Box2D.b2_dynamicBody);
    bd.set_position(temp);
    var shape = new Box2D.b2PolygonShape();
    shape.SetAsBox(3, 1);
    var body = world.CreateBody(bd);
    var circleShape = new b2CircleShape();
    circleShape.set_m_radius(0.5);
    circleShape.set_m_p(new b2Vec2(-1, 1.7));
    body.CreateFixture(shape, 50.0);
    body.CreateFixture(circleShape, 50.0);
    // shape.set_m_p(new b2Vec2(5, -2));
    shape.SetAsBox(0.2, 1.5, new b2Vec2(5, -2), 0);
    body.CreateFixture(shape, 50.0);
    var box = addBox(x, y, 0.1, 0.1, 0xffff55);
    var box2 = new THREE.Mesh(new THREE.BoxGeometry(6,2,1),  new THREE.MeshPhongMaterial( { color: 0xffff55 } ));
    box2.position.set(0,0,0);
    box.add(box2);
    var box3 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 3,1),  new THREE.MeshPhongMaterial( { color: 0xffff55 } ));
    box3.position.set(5,-2,0);
    box.add(box3);
    var head = addHead(0,0);
    head.position.set(-1,1.7,0);
    head.rotateY(Math.PI/4);
    box.add(head);
    var h_body = addCylinder(x,y,1,1,0x7788ff);
    h_body.position.set(-1,0.8,0);
    box.add(h_body);
    var conn = addCylinder(x,y,0.4,3,0x7788ff);
    conn.position.set(4,-1,0);
    conn.rotateZ(Math.PI/4);
    box.add(conn);
    // var box = addBox(0,0, 8, 4);
    box.physics = body;
    extra_bodies.push(box);
    var wheel1 = addWheel(x+2, y-2.5);
    var wheel2 = addWheel(x-2, y-2.5);
    
    circleShape.set_m_p(new b2Vec2(0,0));
    circleShape.set_m_radius(1);
    var fd = new b2FixtureDef();
    fd.set_shape(circleShape);
    fd.set_density(100.0);
    fd.set_friction(0.95);
    
    bd.set_position(new b2Vec2(x+2, y-2.5));
    var w1 = world.CreateBody(bd);
    w1.CreateFixture(fd);
    
    bd.set_position(new b2Vec2(x-2, y-2.5));
    var w2 = world.CreateBody(bd);
    w2.CreateFixture(fd);
    
    var m_hz = 4.0;
    var m_zeta = 0.7;

    var jd = new Box2D.b2WheelJointDef();
    var axis = new b2Vec2(0.0, 1.0);

    jd.Initialize(body, w2, w2.GetPosition(), axis);
    jd.set_motorSpeed(0.0);
    jd.set_maxMotorTorque(20000.0);
    jd.set_enableMotor(true);
    jd.set_frequencyHz(m_hz);
    jd.set_dampingRatio(m_zeta);
    var rearWheelJoint = Box2D.castObject( world.CreateJoint(jd), Box2D.b2WheelJoint );
    rearWheelJoint.SetMotorSpeed(-3);
    
    jd.Initialize(body, w1, w1.GetPosition(), axis);
    jd.set_maxMotorTorque(20000.0);
    jd.set_enableMotor(false);
    jd.set_frequencyHz(m_hz);
    jd.set_dampingRatio(m_zeta);
    var frontWheelJoint = Box2D.castObject( world.CreateJoint(jd), Box2D.b2WheelJoint );
    frontWheelJoint.SetMotorSpeed(-3);
    
    wheel1.physics = w1;
    wheel2.physics = w2;
    
    extra_bodies.push(wheel1);
    extra_bodies.push(wheel2);
    
    scene.add(box);
}

function makeAmbulance(x, y) {
    temp.Set(x,y);
    var bd = new Box2D.b2BodyDef();
    bd.set_type(Box2D.b2_dynamicBody);
    bd.set_position(temp);
    var shape = new Box2D.b2PolygonShape();
    shape.SetAsBox(4, 2);
    var body = world.CreateBody(bd);
    body.CreateFixture(shape, 50.0);
    var box = addBox(x, y, 1, 1);
    scene.add(box);
    var box2 = new THREE.Mesh(new THREE.BoxGeometry(8,2,1),  new THREE.MeshPhongMaterial( { color: 0xffffff } ));
    box2.position.set(0,-1,0);
    box.add(box2);
    var box3 = new THREE.Mesh(new THREE.BoxGeometry(6,2,1),  new THREE.MeshPhongMaterial( { color: 0xffffff } ));
    box3.position.set(-1,1,0);
    box.add(box3);
    var cross1 = new THREE.Mesh(new THREE.BoxGeometry(0.5,2,1.1),  new THREE.MeshPhongMaterial( { color: 0xff1111 } ));
    cross1.position.set(-1.5,0.5,0);
    box.add(cross1);
    var cross2 = new THREE.Mesh(new THREE.BoxGeometry(2,0.5,1.1),  new THREE.MeshPhongMaterial( { color: 0xff1111 } ));
    cross2.position.set(-1.5,0.5,0);
    box.add(cross2);
    var box5 = new THREE.Mesh(new THREE.BoxGeometry(2,0.2,1),  new THREE.MeshPhongMaterial( { color: 0xffffff } ));
    box5.position.set(3,1.9,0);
    box.add(box5);
    var box4 = new THREE.Mesh(new THREE.BoxGeometry(2,1.8,1),  new THREE.MeshPhongMaterial( { color: 0x0000ff } ));
    box4.material.opacity = 0.2;
    box4.material.transparent = true;
    box4.position.set(3,0.9,0);
    box.add(box4);
    var head = addHead(0,0);
    head.position.set(3,0.9,0);
    head.rotateY(Math.PI/4);
    box.add(head);
    var h_body = addCylinder(x,y,1,2,0x7788ff);
    h_body.position.set(3,0.9-1.5,0);
    box.add(h_body);
    // var box = addBox(0,0, 8, 4);
    box.physics = body;
    extra_bodies.push(box);
    var wheel1 = addWheel(x+2, y-3.5);
    var wheel2 = addWheel(x-2, y-3.5);
    var circleShape = new b2CircleShape();
    circleShape.set_m_radius(1);
    
    var fd = new b2FixtureDef();
    fd.set_shape(circleShape);
    fd.set_density(100.0);
    fd.set_friction(0.95);
    
    bd.set_position(new b2Vec2(x+2, y-3.5));
    var w1 = world.CreateBody(bd);
    w1.CreateFixture(fd);
    
    bd.set_position(new b2Vec2(x-2, y-3.5));
    var w2 = world.CreateBody(bd);
    w2.CreateFixture(fd);
    
    var m_hz = 4.0;
    var m_zeta = 0.7;

    var jd = new Box2D.b2WheelJointDef();
    var axis = new b2Vec2(0.0, 1.0);

    jd.Initialize(body, w2, w2.GetPosition(), axis);
    jd.set_motorSpeed(0.0);
    jd.set_maxMotorTorque(20000.0);
    jd.set_enableMotor(true);
    jd.set_frequencyHz(m_hz);
    jd.set_dampingRatio(m_zeta);
    var rearWheelJoint = Box2D.castObject( world.CreateJoint(jd), Box2D.b2WheelJoint );
    rearWheelJoint.SetMotorSpeed(-3);
    
    jd.Initialize(body, w1, w1.GetPosition(), axis);
    jd.set_maxMotorTorque(20000.0);
    jd.set_enableMotor(false);
    jd.set_frequencyHz(m_hz);
    jd.set_dampingRatio(m_zeta);
    var frontWheelJoint = Box2D.castObject( world.CreateJoint(jd), Box2D.b2WheelJoint );
    frontWheelJoint.SetMotorSpeed(-3);
    
    wheel1.physics = w1;
    wheel2.physics = w2;
    
    extra_bodies.push(wheel1);
    extra_bodies.push(wheel2);
    
}

function makeBall(x,y) {
    temp.Set(x,y);
    var bd = new Box2D.b2BodyDef();
    bd.set_type(Box2D.b2_dynamicBody);
    bd.set_position(temp);
    var shape = new Box2D.b2CircleShape();
    shape.set_m_radius(1);
    
    var fd = new b2FixtureDef();
    fd.set_shape(shape);
    fd.set_density(2.0);
    fd.set_friction(0.95);
    fd.set_restitution(0.95);

    
    var body = world.CreateBody(bd);
    body.CreateFixture(fd);
    
    var ball = addSphere(x,y,-9, 1, 0x11ff11);
    ball.obj_type = "ball";
    ball.physics = body;
    scene.add(ball);
    extra_bodies.push(ball);
    return ball;
}

function makeBasket(x,y) {
    temp.Set(x,y);
    var bd = new Box2D.b2BodyDef();
    bd.set_type(Box2D.b2_dynamicBody);
    bd.set_position(temp);
    var shape = new Box2D.b2PolygonShape();
    shape.SetAsBox(2, 0.5);
    var body = world.CreateBody(bd);
    body.CreateFixture(shape, 50.0);
    shape.SetAsBox(0.5, 2, new b2Vec2(-2, 2), 0);
    body.CreateFixture(shape, 50.0);
    shape.SetAsBox(0.5, 2, new b2Vec2(2, 2), 0);
    body.CreateFixture(shape, 50.0);
    var box = addBox(x, y, 4, 1);
    scene.add(box);
    var box2 = new THREE.Mesh(new THREE.BoxGeometry(1,4,1),  new THREE.MeshPhongMaterial( { color: 0xffffff } ));
    box2.position.set(-2,2,0);
    box.add(box2);
    var box3 = new THREE.Mesh(new THREE.BoxGeometry(1,4,1),  new THREE.MeshPhongMaterial( { color: 0xffffff } ));
    box3.position.set(2,2,0);
    box.add(box3);
    
    box.obj_type = "basket";
    box.physics = body;
    extra_bodies.push(box);
    return box;
}

function makeJunk(x, y) {
    temp.Set(x,y);
    var bd = new Box2D.b2BodyDef();
    bd.set_type(Box2D.b2_dynamicBody);
    bd.set_position(temp);
    var body = world.CreateBody(bd);
    var fd = new Box2D.b2FixtureDef();
    var shape = extra_shape(1, 1);
    // fd.set_density(0.1);
    fd.set_density(10);
    fd.set_friction(1);
    fd.set_restitution(0.1);
    fd.set_shape(shape);
    body.CreateFixture(fd);
    var shape2 = extra_shape(-1, -1);
    fd.set_shape(shape2);
    body.CreateFixture(fd);
    body.SetTransform(body.GetPosition(), Math.random()*Math.PI*2);

    return makeModel(x, y, "junk", body);
}

function makeGold(x, y) {
    temp.Set(x,y);
    var bd = new Box2D.b2BodyDef();
    bd.set_type(Box2D.b2_dynamicBody);
    bd.set_position(temp);
    var body = world.CreateBody(bd);
    body.CreateFixture(bar_shape, 500.0);

    return makeModel(x, y, "gold", body);
}

function makeFloor(x, y) {
    var shape = new Box2D.b2PolygonShape();
    shape.SetAsBox(4, 0.5);
    temp.Set(x,y);
    var bd = new Box2D.b2BodyDef();
    bd.set_type(Box2D.b2_dynamicBody);
    bd.set_position(temp);
    var body = world.CreateBody(bd);
    body.CreateFixture(shape, 5.0);

    return makeModel(x, y, "floor", body);
}

function genmakeCylinder(x, y, model) {
    temp.Set(x,y);
    var bd = new Box2D.b2BodyDef();
    bd.set_type(Box2D.b2_dynamicBody);
    bd.set_position(temp);
    var body = world.CreateBody(bd);
    var shape = new Box2D.b2PolygonShape();
    shape.SetAsBox(0.5, 1);
    body.CreateFixture(shape, 5.0);

    return makeModel(x, y, model, body);
}

function makeSmallCylinder(x, y, model) {
    temp.Set(x,y);
    var bd = new Box2D.b2BodyDef();
    bd.set_type(Box2D.b2_dynamicBody);
    bd.set_position(temp);
    var body = world.CreateBody(bd);
    var shape = new Box2D.b2PolygonShape();
    shape.SetAsBox(0.25, 0.5);
    body.CreateFixture(shape, 5.0);

    return makeModel(x, y, "small_cylinder", body);
}

function makeReactor(x, y) {
    temp.Set(x,y);
    var bd = new Box2D.b2BodyDef();
    bd.set_type(Box2D.b2_dynamicBody);
    bd.set_position(temp);
    var body = world.CreateBody(bd);
    var shape = new Box2D.b2PolygonShape();
    shape.SetAsBox(1.5, 2.5);
    body.CreateFixture(shape, 5.0);

    return makeModel(x, y, "reactor", body);
}

function makeCowCylinder(x, y) {
    temp.Set(x,y);
    var bd = new Box2D.b2BodyDef();
    bd.set_type(Box2D.b2_dynamicBody);
    bd.set_position(temp);
    var body = world.CreateBody(bd);
    var shape = new Box2D.b2PolygonShape();
    shape.SetAsBox(0.75, 0.5);
    body.CreateFixture(shape, 5.0);

    return makeModel(x, y, "cow_cylinder", body);
}

function makeBed(x, y) {
    temp.Set(x,y);
    var bd = new Box2D.b2BodyDef();
    bd.set_type(Box2D.b2_dynamicBody);
    bd.set_position(temp);
    var body = world.CreateBody(bd);
    var shape = new Box2D.b2PolygonShape();
    shape.SetAsBox(1.5, 0.5);
    body.CreateFixture(shape, 5.0);

    return makeModel(x, y, "bed", body);
    // m.obj_info.reserved = false;
    // return m;
}

function makeCylinder(x, y) {
    return genmakeCylinder(x, y, "cylinder");
}

function makeButtonCylinder(x, y) {
    return genmakeCylinder(x, y, "button_cylinder");
}

var assoc = {};

function setupObject(obj, type, body) {
    obj.obj_info = {};
    obj.obj_type = type;
    obj.obj_time = 0;
    obj.physics = body;
    assoc[body.e] = obj;
    bodies.push(obj);
    scene.add(obj);
}

function makePipe(x, y) {
    temp.Set(x,y);
    var bd = new Box2D.b2BodyDef();
    bd.set_type(Box2D.b2_dynamicBody);
    bd.set_position(temp);
    var body = world.CreateBody(bd);
    var shape = new Box2D.b2PolygonShape();
    shape.SetAsBox(0.5, 0.5);
    body.CreateFixture(shape, 5.0);

    return makeModel(x, y, "pipe", body);
}

function createPolygonShape(vertices) {
    var shape = new Box2D.b2PolygonShape();
    // var buffer = Box2D.allocate(vertices.length * 8, 'float', Box2D.ALLOC_STACK);
    var buffer = Box2D._malloc(vertices.length * 8);
    var offset = 0;
    for (var i = 0; i < vertices.length; i++) {
        // Box2D.setValue(buffer + (offset), vertices[i].get_x(), 'float'); // x
        Box2D.HEAPF32[buffer + offset >> 2] = vertices[i].get_x();
        // Box2D.setValue(buffer + (offset + 4), vertices[i].get_y(), 'float'); // y
        Box2D.HEAPF32[buffer + (offset + 4) >> 2] = vertices[i].get_y();
        offset += 8;
    }
    var ptr_wrapped = Box2D.wrapPointer(buffer, Box2D.b2Vec2);
    shape.Set(ptr_wrapped, vertices.length);
    return shape;
}

var v2 = (x,y) => new b2Vec2(x,y);

function queryArea(x, y, w, h) {
    var cb = new Box2D.JSQueryCallback();
    var res = [];
    cb.ReportFixture = function (fixturePtr) {
        console.log("Doing something");
        var fixture = Box2D.wrapPointer(fixturePtr, Box2D.b2Fixture);
        if ( fixture.GetBody().GetType() != Box2D.b2_dynamicBody ) return true;
        // if ( ! fixture.TestPoint( this.m_point ) ) return true;
        var obj = assoc[fixture.GetBody().e];
        if (!res.find(a => obj == a)) res.push(obj);
        
        return true;
    };
    var aabb = new Box2D.b2AABB();
    aabb.set_lowerBound(new Box2D.b2Vec2(x - w, y - h));
    aabb.set_upperBound(new Box2D.b2Vec2(x + w, y + h));
    world.QueryAABB(cb, aabb);
    return res;
}

function makeRoof(x, y) {
    temp.Set(x,y);
    var bd = new Box2D.b2BodyDef();
    bd.set_type(Box2D.b2_dynamicBody);
    bd.set_position(temp);
    var body = world.CreateBody(bd);
    body.CreateFixture(t_shape, 5.0);

    return makeModel(x, y, "roof", body);
}

function addSphere(x, y, z, r, color, num) {
    num = num || 30;
    var geometry = new THREE.SphereBufferGeometry( r, num, num );
    var material = new THREE.MeshPhongMaterial( { color: color } );
    var cube = new THREE.Mesh( geometry, material );
    cube.position.set(x,y,z);
    cube.castShadow = true;
    cube.receiveShadow = true;
    return cube;
}

function makeCloud() {
    var geometry = new THREE.Geometry();
    for (var i = 0; i < 100; i++) {
        var x = Math.random()*3 - 1.5;
        var y = Math.random()*3 - 1.5;
        var sphere = new THREE.SphereGeometry((Math.random()+0.2) / (Math.pow(x*x + y*y, 0.3)+0.5), 20, 20);
        sphere.translate(x*2, y, 0);
        geometry.merge(sphere);
    }
    geometry.computeBoundingSphere();
    var material = new THREE.MeshPhongMaterial( { color: 0xffffff } );
    material.transparent = true;
    material.opacity = 0.9;
    var cube = new THREE.Mesh( geometry, material );
    cube.castShadow = true;
    cube.position.set(0,14,-9)
    cube.scale.set(5,5,1)
    return cube;
}

function glueGeom() {
    var geometry = new THREE.Geometry();
    for (var i = 0; i < 10; i++) {
        var x = Math.random() - 0.5;
        var y = Math.random() - 0.5;
        // var sphere = new THREE.SphereGeometry((Math.random()*0.3+0.2), 20, 20);
        var sphere = new THREE.SphereGeometry((Math.random()*0.3+0.2), 10, 10);
        sphere.translate(x, y, 0);
        geometry.merge(sphere);
    }
    return geometry;
}

var glue_geom = glueGeom();


function coinGeom() {
    var geometry = new THREE.Geometry();
    for (var i = 0; i < 20; i++) {
        var x = Math.random() - 0.5;
        var y = Math.random() - 0.5;
        var z = Math.random() - 0.5;
        // var sphere = new THREE.SphereGeometry((Math.random()*0.3+0.2), 20, 20);
        var sphere = new THREE.CylinderGeometry(0.2, 0.2, 0.05, 10);
        sphere.translate(x, y, z);
        sphere.rotateX(Math.PI/2);
        sphere.rotateY((Math.random()-0.5));
        sphere.rotateX((Math.random()-0.5));
        geometry.merge(sphere);
    }
    return geometry;
}

var coin_geom = coinGeom();

function addCoins(money) {
    // geometry.computeBoundingSphere();
    var material = new THREE.MeshPhongMaterial( { color: 0xffd700, specular: 0xffd700 } );
    var cube = new THREE.Mesh( coin_geom, material );
    cube.castShadow = true;
    // cube.position.set(0,0,-8.5);
    // scene.add(cube);
    cube.money = money;
    return cube;
}

function makeGlue() {
    // geometry.computeBoundingSphere();
    var material = new THREE.MeshPhongMaterial( { color: 0xeeddee } );
    material.transparent = true;
    material.opacity = 0.9;
    var cube = new THREE.Mesh( glue_geom, material );
    cube.castShadow = true;
    cube.position.set(0,0,-8.5);
    cube.scale.set(0.5,0.5,0.2);
    scene.add(cube);
    return cube;
}
function toJointCoord(info, x, y) {
    var p1 = bodies[info.body1].position;
    var p2 = bodies[info.body2].position;
    var v1_x = p2.x - p1.x;
    var v1_y = p2.y - p1.y;
    var len = Math.sqrt(v1_x*v1_x + v1_y*v1_y);
    v1_x = v1_x / len;
    v1_y = v1_y / len;
    
    var v2_x = v1_y;
    var v2_y = -v1_x;
    
    x = x - p1.x;
    y = y - p1.y;
    return {x: x*v1_x + y*v1_y, y: x*v2_x + y*v2_y};
}

function inverse22(a,b,c,d) {
    var idet = 1/(a*d - b*c);
    return {x1:idet*d, y1:-idet*b, x2:-idet*c, y2:idet*a};
}

function fromJointCoord(obj, x, y) {
    var p1 = bodies[obj.obj_body1].position;
    var p2 = bodies[obj.obj_body2].position;
    var v1_x = p2.x - p1.x;
    var v1_y = p2.y - p1.y;
    var len = Math.sqrt(v1_x*v1_x + v1_y*v1_y);
    v1_x = v1_x / len;
    v1_y = v1_y / len;
    
    var v2_x = v1_y;
    var v2_y = -v1_x;
    
    var inv = inverse22(v1_x, v1_y, v2_x, v2_y);
    
    return {x: p1.x + x*inv.x1 + y*inv.y1, y: p1.y + x*inv.x2 + y*inv.y2};
}

function updateJoint(j) {
    if (!j.obj_info.loc) return;
    var p = fromJointCoord(j, j.obj_info.loc.x, j.obj_info.loc.y);
    var p1 = bodies[j.obj_body1].position;
    var p2 = bodies[j.obj_body2].position;
    var rot = Math.atan2(p1.x - p2.x, p1.y - p2.y);
    j.position.set(p.x, p.y, -8.5);
    // j.rotation.setFromVector3(new THREE.Vector3(0,0,j.rotation-rot));
    j.rotation.setFromVector3(new THREE.Vector3(0,0,-rot));
}

function addGlue(x,y) {
    var v = new THREE.Vector3(x,y,-9);
    bodies.forEach((b,i) => b.index = i);
    var distance = o => o.position.distanceTo(v);
    var stuff = queryArea(x,y,0.5,0.5);
    var sorted = stuff.sort((a,b) => distance(a) - distance(b));
    // if (sorted.length < 2 || distance(sorted[1]) > 1) return;
    if (sorted.length < 2) return;
    info.resource.glue--;
    var inf = {body1: sorted[0].index, body2: sorted[1].index, type:"glue"};
    inf.loc = toJointCoord(inf, x, y);
    
    return loadGlue(inf);
}

function loadGlue(info) {
    var glue = makeGlue();
    glue.obj_type = "glue";
    glue.obj_body1 = info.body1;
    glue.obj_body2 = info.body2;
    glue.obj_info = info;
    // glue.position.set(x,y,-8.5);
    joints.push(glue);
    var jd = new Box2D.b2WeldJointDef();

    var b1 = bodies[info.body1].physics;
    var b2 = bodies[info.body2].physics;
    jd.set_bodyA(b1);
    jd.set_bodyB(b2);
    var p = fromJointCoord(glue, glue.obj_info.loc.x, glue.obj_info.loc.x);
    jd.set_localAnchorA(b1.GetLocalPoint(v2(p.x,p.y)));
    jd.set_localAnchorB(b2.GetLocalPoint(v2(p.x,p.y)));
    jd.set_collideConnected(true);
    jd.set_referenceAngle(b2.GetAngle() - b1.GetAngle());
    jd.set_dampingRatio(2);
    /*
    jd.set_frequencyHz(7);
    */
    updateJoint(glue);
    glue.physics = world.CreateJoint(jd);

    return glue;
}

function addCircularSaw(obj,x,y) {
    var saw = makeSaw(x,y);
    bodies.forEach((b,i) => b.index = i);
    var inf = {body1: saw.index, body2: obj.index, type: "revolute"};
    var joint = loadRevolute(inf);
    joints.push(joint);
    return joint;
}

function addHelicopter(x,y) {
    var material = new THREE.MeshPhongMaterial( {color: 0xffff00, side:THREE.DoubleSide} );
    var geometry = new THREE.CylinderGeometry( 1, 1, 2, 32, 32);
    geometry.rotateZ(Math.PI/2);
    var obj = new THREE.Mesh( geometry, material );
    var geometry = new THREE.SphereGeometry( 1, 32, 32, 0, Math.PI);
    var s1 = new THREE.Mesh( geometry, material );
    s1.rotateY(-Math.PI/2);
    var geometry = new THREE.SphereGeometry( 1, 32, 32, 0, Math.PI, 0, Math.PI/2);
    var s2 = new THREE.Mesh( geometry, material );
    s2.rotateY(-Math.PI/2);
    s2.rotateX(-Math.PI);
    var geometry = new THREE.SphereGeometry( 1, 32, 32, 0, Math.PI, 0, Math.PI/2);
    var material2 = new THREE.MeshPhongMaterial( {color: 0xffffff} );
    material2.transparent = true;
    material2.opacity = 0.5;
    var s3 = new THREE.Mesh( geometry, material2 );
    s3.rotateY(-Math.PI/2);
    s3.rotateX(-Math.PI/2);
    s1.position.set(-1,0,0);
    s2.position.set(1,0,0);
    s3.position.set(1,0,0);
    obj.add(s1);
    obj.add(s2);
    obj.add(s3);
    var head = addHead(0,0);
    head.position.set(1.4,0.3,0);
    head.scale.set(0.5, 0.5, 0.5);
    head.rotateY(Math.PI/4);
    obj.add(head);
    var h_body = addCylinder(0,0,1,1,0x7788ff);
    h_body.position.set(1.4,-0.2,0);
    h_body.scale.set(0.5,0.5,0.5);
    obj.add(h_body);
    var down = addBox(0,0,3,0.5, 0x665544);
    down.position.set(0, -1.5, 0);
    obj.add(down);
    
    var rotor = new THREE.Object3D();
    
    var r1 = addBox(0,0,5,0.2, 0x665544);
    r1.position.set(0, 1.5, 0);
    var r2 = addBox(0,0,5,0.2, 0x665544);
    r2.position.set(0, 1.5, 0);
    r2.rotateY(Math.PI/2);
    
    var geometry = new THREE.CylinderGeometry(0.2, 0.2, 0.75, 32);
    var pole = new THREE.Mesh( geometry, material );
    pole.position.set(0,1.25,0);
    
    rotor.add(r1);
    rotor.add(r2);
    rotor.add(pole);
    
    obj.add(rotor);
    
    var geometry = new THREE.CylinderGeometry(0.1, 0.1, 0.75, 32);
    var pole1 = new THREE.Mesh( geometry, material );
    pole1.position.set(-0.5,-1.25,0);
    
    var geometry = new THREE.CylinderGeometry(0.1, 0.1, 0.75, 32);
    var pole2 = new THREE.Mesh( geometry, material );
    pole2.position.set(0.5,-1.25,0);
    
    obj.add(pole1);
    obj.add(pole2);
    
    obj.update = () => rotor.rotateY(0.5);
    
    obj.position.set(x,y,-9);
    obj.scale.set(2,2,2);
    obj.obj_type = "helicopter";
    scene.add(obj);
    return obj;
}

function makeHelicopter(x,y) {
    var mesh = addHelicopter(x,y);
    var body = dynamicBody(x,y);

    // shape.SetAsBox(0.2, 1.5, new b2Vec2(5, -2), 0);
    // body.CreateFixture(shape, 50.0);

    var shape = new Box2D.b2PolygonShape();
    shape.SetAsBox(2, 2);
    body.CreateFixture(shape, 5.0);
    
    var shape = new Box2D.b2PolygonShape();
    shape.SetAsBox(3, 0.5, new b2Vec2(0, -3), 0);
    body.CreateFixture(shape, 5.0);
    
    var shape = new b2CircleShape();
    shape.set_m_radius(2);
    shape.set_m_p(new b2Vec2(-2, 0));
    body.CreateFixture(shape, 5.0);
    
    var shape = new b2CircleShape();
    shape.set_m_radius(2);
    shape.set_m_p(new b2Vec2(2, 0));
    body.CreateFixture(shape, 5.0);
    
    // body.CreateFixture(shape, 5.0);
    mesh.physics = body;
    extra_bodies.push(mesh);
    return mesh;
}

function loadRevolute(info) {
    var jd = new Box2D.b2RevoluteJointDef();
    var b1 = bodies[info.body1].physics;
    var b2 = bodies[info.body2].physics;
    jd.set_bodyA(b1);
    jd.set_bodyB(b2);
    jd.set_collideConnected(info.collide_connected || false);
    // var v = b1.GetPosition();
    var v = b1.GetWorldPoint(new b2Vec2(info.x||0,info.y||0))
    var p = {x: v.get_x(), y: v.get_y()};
    
    jd.set_localAnchorA(b1.GetLocalPoint(v2(p.x,p.y)));
    jd.set_localAnchorB(b2.GetLocalPoint(v2(p.x,p.y)));
    jd.set_enableLimit(false);
    jd.set_enableMotor(true);
    // jd.set_lowerAngle(jointJso.lowerLimit || 0);
    jd.set_maxMotorTorque(10000);
    jd.set_maxMotorTorque(1000000);
    jd.set_motorSpeed(-3);
    // jd.set_referenceAngle(jointJso.refAngle || 0);
    // jd.set_upperAngle(jointJso.upperLimit || 0);

    var joint = Box2D.castObject( world.CreateJoint(jd), Box2D.b2RevoluteJoint );
    var mesh = new THREE.Object3D();
    mesh.physics = joint;
    mesh.obj_type = "revolute";
    mesh.obj_body1 = info.body1;
    mesh.obj_body2 = info.body2;
    mesh.obj_info = info;
    return mesh;
}

var cloud = makeCloud();

var small_cloud = makeCloud();
small_cloud.scale.set(0.4, 0.4, 0.4);

function makeModel(x, y, type, body) {
    if (pool[type].length == 0) {
        var model = models[type](x, y, body);
        setupObject(model, type, body);
        return model;
    }
    else {
        var model = pool[type].pop();
        scene.add(model);
        if (model.mouth) model.mouth.morphTargetInfluences[0] = -0.2;
        setupObject(model, type, body);
        updateBody(model);
        model.obj_time = 0;
        return model;
    }
}

function addMark(x,y) {
    var geom = new THREE.CylinderGeometry(0.16, 0.13, 0.7, 10);
    var mesh = new THREE.Mesh(geom, new THREE.MeshLambertMaterial({color:0xaaaaaa}));
    mesh.position.set(x,y,0);
    var ball = new THREE.Mesh(new THREE.SphereGeometry(0.17, 10, 10), new THREE.MeshLambertMaterial({color:0xaaaaaa}));
    mesh.add(ball);
    ball.position.set(0,-0.55,0);
    mesh.scale.set(2,2,2);
    return mesh;
}

function addHead(x,y) {
    var obj = addSphere(x, y, -9, 0.5, 0xffaabb);
    var e1 = makeEye();
    e1.position.set(0.3,0.1,0.5);
    obj.add(e1);
    var e2 = makeEye();
    e2.position.set(-0.3,0.1,0.5);
    obj.add(e2);
    var m = addMouth();
    m.position.set(0,-0.2,0.5);
    m.morphTargetInfluences[0] = -0.2;
    obj.add(m);
    obj.mouth = m;
    obj.eye1 = e1;
    obj.eye2 = e2;
    // obj.obj_info = newCharacter();
    return obj;
}

var hands = [];

function addHand(head, target) {
    var x = head.position.x;
    var y = head.position.y-1;
    var obj = new THREE.Object3D();
    obj.head = head;
    obj.target = target;
    obj.num = 0;
    obj.steps = 60;
    obj.position.set(x, y, -8);
    var h_obj = addSphere(0, 0, 0, 0.5, 0xffaabb);
    h_obj.scale.set(1,1,0.3);
    obj.add(h_obj);
    scene.add(obj);
    var finger1 = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 1), new THREE.MeshPhongMaterial({color: 0xffaabb}));
    finger1.position.set(0,0.8,0);
    finger1.scale.set(1,1,1.5);
    h_obj.add(finger1);
    var finger2 = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 1), new THREE.MeshPhongMaterial({color: 0xffaabb}));
    finger2.position.set(0.4,0.5,0);
    finger2.rotateZ(-Math.PI/9);
    finger2.scale.set(1,1,1.5);
    h_obj.add(finger2);
    var finger3 = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 1), new THREE.MeshPhongMaterial({color: 0xffaabb}));
    finger3.position.set(-0.4,0.5,0);
    finger3.rotateZ(Math.PI/9);
    finger3.scale.set(1,1,1.5);
    h_obj.add(finger3);
    var finger4 = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 1), new THREE.MeshPhongMaterial({color: 0xffaabb}));
    finger4.position.set(-0.3,0,0);
    finger4.rotateZ(Math.PI/2);
    finger4.scale.set(1,1,1.5);
    h_obj.add(finger4);
    function finishFinger(finger) {
        var end = new THREE.Mesh(new THREE.SphereGeometry(0.2), new THREE.MeshPhongMaterial({color: 0xffaabb}));
        end.position.y = 0.5;
        finger.add(end);
        var nail = new THREE.Mesh(new THREE.SphereGeometry(0.18), new THREE.MeshPhongMaterial({color: 0xff0000}));
        nail.position.y = 0.5;
        nail.position.z = 0.04;
        finger.add(nail);
    }
    [finger1, finger2, finger3, finger4].forEach(finishFinger);
    hands.push(obj);
    return obj;
}

function addHandModel(x, y) {
    var obj = addSphere(x, y, -8, 0.5, 0xffaabb);
    obj.scale.set(1,1,0.3);
    var finger1 = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 1), new THREE.MeshPhongMaterial({color: 0xffaabb}));
    finger1.position.set(0,0.8,0);
    finger1.scale.set(1,1,1.5);
    obj.add(finger1);
    var finger2 = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 1), new THREE.MeshPhongMaterial({color: 0xffaabb}));
    finger2.position.set(0.4,0.5,0);
    finger2.rotateZ(-Math.PI/9);
    finger2.scale.set(1,1,1.5);
    obj.add(finger2);
    var finger3 = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 1), new THREE.MeshPhongMaterial({color: 0xffaabb}));
    finger3.position.set(-0.4,0.5,0);
    finger3.rotateZ(Math.PI/9);
    finger3.scale.set(1,1,1.5);
    obj.add(finger3);
    var finger4 = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 1), new THREE.MeshPhongMaterial({color: 0xffaabb}));
    finger4.position.set(-0.3,0,0);
    finger4.rotateZ(Math.PI/2);
    finger4.scale.set(1,1,1.5);
    obj.add(finger4);
    function finishFinger(finger) {
        var end = new THREE.Mesh(new THREE.SphereGeometry(0.2), new THREE.MeshPhongMaterial({color: 0xffaabb}));
        end.position.y = 0.5;
        finger.add(end);
        var nail = new THREE.Mesh(new THREE.SphereGeometry(0.18), new THREE.MeshPhongMaterial({color: 0xff0000}));
        nail.position.y = 0.5;
        nail.position.z = 0.04;
        finger.add(nail);
    }
    [finger1, finger2, finger3, finger4].forEach(finishFinger);
    return obj;
}

function updateHand(obj) {
    var target = obj.target[Math.floor(obj.num/obj.steps)];
    var last_position = obj.num < obj.steps ? {y:obj.head.position.y-1, x:obj.head.position.x} : obj.target[Math.floor(obj.num/obj.steps)-1].p;
    var dy = target.p.y-last_position.y;
    var dx = target.p.x-last_position.x;
    var num = obj.num%obj.steps;
    if (num == obj.steps-1 && target.action) target.action();
    obj.position.set(num/obj.steps*dx+last_position.x,num/obj.steps*dy+last_position.y,-8);
    obj.num++;
    var x = obj.position.x-obj.head.position.x;
    var y = obj.position.y-obj.head.position.y;
    obj.head.rotation.set(-y/10, x/10, 0);
}

var horn_angle = 0.1;

function horn_shape(a, sz) {
    return createPolygonShape([
        new b2Vec2(sz*0.5*Math.cos(a-horn_angle),sz*0.5*Math.sin(a-horn_angle)),
        new b2Vec2(sz*0.5*Math.cos(a+horn_angle),sz*0.5*Math.sin(a+horn_angle)),
        new b2Vec2(sz*1.5*Math.cos(a),sz*1.5*Math.sin(a))]);
}


var models = {
    head: (x,y) => addHead(x,y),
    small_head: (x,y) => { var obj = addHead(x,y); obj.scale.set(0.5, 0.5, 0.5); return obj; },
    rain: (x,y) => {
        var obj = addSphere(x, y, -9, 0.3, 0x6677ff);
        obj.material.transparent = true;
        obj.material.opacity = 0.4;
        obj.material.color.setHSL(2/3, 0.9+Math.random()*0.1, Math.random()*0.2+0.6);
        obj.receiveShadow = false;
        obj.castShadow = false;
        return obj;
    },
    cow_head: function (x,y) {
        var obj = addSphere(x, y, -9, 0.5, 0x964B00);
        var e1 = makeEye();
        e1.position.set(0.3,0.1,0.5);
        obj.add(e1);
        var e2 = makeEye();
        e2.position.set(-0.3,0.1,0.5);
        obj.add(e2);
        var m = addMouth();
        m.position.set(0,-0.2,0.5);
        obj.add(m);
        obj.mouth = m;
        var geometry = new THREE.CylinderGeometry( 0, Math.sqrt((1 - Math.pow(Math.cos(horn_angle),2)) + Math.pow(Math.sin(horn_angle),2)), 1+Math.sin(horn_angle), 30 );
        var material = new THREE.MeshPhongMaterial( { color: 0xffddff } );
        geometry.translate(0,Math.cos(horn_angle),0);
        var horn1 = new THREE.Mesh( geometry, material );
        horn1.rotateZ(Math.PI/6);
        horn1.castShadow = horn1.receiveShadow = true;
        obj.add(horn1);
        var horn2 = new THREE.Mesh( geometry, material );
        horn2.rotateZ(-Math.PI/6);
        horn2.castShadow = horn2.receiveShadow = true;
        obj.add(horn2);
        return obj;
    },
    small_cylinder: function (x,y,body) {
        var obj = addCylinder(x,y,1,2,0x40E0D0);
        obj.scale.set(0.5, 0.5, 0.5);
        return obj;
    },
    junkbox: (x,y,body) => addBox(x,y,1,1,0x777777),
    box: function (x,y,body) {
        return addBox(x,y,1,1,0x3322ff);
    },
    bed: (x,y) => addBox(x,y,3,1,0xffeeff),
    junk: function (x,y,body) {
        var obj = addCylinder(x,y,0.3,2,0x3322ff);
        obj.geometry.rotateZ(-Math.PI/4);
        var obj2 = simpleBox(x,y,1,1,0x777777);
        var obj3 = simpleBox(x,y,1,1,0x777777);
        obj.add(obj2);
        obj.add(obj3);
        obj2.position.set(1,1,0);
        obj3.position.set(-1,-1,0);
        return obj;
    },
    roof: function (x,y,body) {
        return addTriangle(x,y,0x3322ff);
    },
    gold: function (x,y,body) {
        var obj = addShinyBox(x,y,1,0.5,0xffee11);
        var arr = obj.geometry.vertices;
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].y > 0) arr[i].set(arr[i].x*(4/5), arr[i].y, arr[i].z*(4/5))
                }
        return obj;
    },
    ice_cream: (x,y) => addIceCream(x,y),
    pipe: function (x,y,body) {
        return addCylinder(x,y,1,1,0xff55dd);
    },
    floor: function (x,y,body) {
        return addBox(x,y,8,1,0x3322ff);
    },
    cylinder: function (x,y,body) {
        return addCylinder(x,y,1,2,0x7788ff);
    },
    cow_cylinder: function (x,y) {
        var geometry = new THREE.CylinderGeometry( 0.5, 0.5, 1.5, 30 );
        var material = new THREE.MeshPhongMaterial( { color: 0x964B00 } );
        geometry.rotateZ(Math.PI/2);
        var cube = new THREE.Mesh( geometry, material );
        cube.position.set(x,y,-9);
        cube.castShadow = true;
        cube.receiveShadow = true;
        return cube;
    },

    button_cylinder: function (x,y,body) {
        var obj = addCylinder(x,y,1,2,0x443388);
        var make = function (y) {
            var s = addSphere(0,y, 0.6,0.15, 0xffcc00, 10);
            s.scale.set(1,1,0.3);
            return s;
        };
        obj.add(make(0.6));
        obj.add(make(0.1));
        obj.add(make(-0.4));
        return obj;
    },
};

function addReactor(x,y) {
        var obj = addCylinder(x,y,3,5,0xaaaa88);
        var obj1 = addCylinder(0,0,2/3,1,0x121212);
        var s1 = addSlice();
        var s2 = addSlice();
        var s3 = addSlice();
        scene.remove(obj1);
        obj1.rotateX(Math.PI/2);
        obj1.position.set(0,0,1);
        s1.rotateZ(-Math.PI/8 - Math.PI/2);
        s2.rotateZ(-Math.PI/8 - Math.PI/2 + 2*Math.PI/3);
        s3.rotateZ(-Math.PI/8 - Math.PI/2 + 4*Math.PI/3);
        obj.add(obj1);
        obj.add(s1);
        obj.add(s2);
        obj.add(s3);
        return obj;
}

models.reactor = addReactor;

        
function addSlice() {
    var shape = new THREE.Shape();
    var a = Math.PI/4;
    shape.moveTo(1, 0);
    shape.lineTo(3, 0);
    shape.absarc(0, 0, 3, a, 0, false);
    shape.lineTo(Math.cos(a), Math.sin(a));
    shape.absarc(0, 0, 1, 0, a, false);
    
    var geom = new THREE.ExtrudeGeometry(shape, {
        amount: 1,
        bevelEnabled: false, bevelSegments: 5, steps: 2, bevelSize: 0.1, bevelThickness: 0.1
    });
    var mesh = new THREE.Mesh(geom, new THREE.MeshPhongMaterial({ color: 0x112211 }));
    // mesh.rotateX(Math.PI);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.scale.set(0.5, 0.5, 1);
    mesh.position.z = 0.5;

    return mesh;
}

function makeHead(x, y) {
    temp.Set(x,y);
    var bd = new Box2D.b2BodyDef();
    bd.set_type(Box2D.b2_dynamicBody);
    bd.set_position(temp);
    var body = world.CreateBody(bd);
    var shape = new Box2D.b2CircleShape();
    shape.set_m_radius(0.5);
    body.CreateFixture(shape, 5.0);
    body.CreateFixture(mini_shape, 1.0);
    return makeModel(x, y, "head", body);
}

function newHead(x, y) {
    var head = info.heads.find(a => !a.reserved && !a.sick);
    if (!head) return;
    head.reserved = true;
    var model = makeHead(x,y);
    model.obj_info = head;
    return model;
}

function makeRain(x, y) {
    temp.Set(x,y);
    var bd = new Box2D.b2BodyDef();
    bd.set_type(Box2D.b2_dynamicBody);
    bd.set_position(temp);
    var body = world.CreateBody(bd);
    var shape = new Box2D.b2CircleShape();
    shape.set_m_radius(0.1);
    body.CreateFixture(shape, 200.0);
    return makeModel(x, y, "rain", body);
}

function waffle() {
    var gtexture = new THREE.TextureLoader().load('ruutu2.png');
    var texture = new THREE.TextureLoader().load('ruutu.png');
    gtexture.wrapS = gtexture.wrapT = THREE.RepeatWrapping;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(5,5);

    var mat = new THREE.MeshPhongMaterial( { map: texture } );
    mat.bumpMap = gtexture;
    mat.bumpScale = 10;
    mat.needsUpdate = true;
    return mat;
}

var waffle_mat = waffle();

function addIceCream(x, y) {
    var sun = new THREE.Mesh( new THREE.SphereBufferGeometry( 1, 30, 30 ), new THREE.MeshPhongMaterial( { color: 0xffffff } ) );
    var geom = new THREE.CylinderGeometry( 1, 1, 10/3, 30, 30 );
    geom.vertices.forEach(a => a.set(a.x*(a.y+5/3)/(10/3), a.y, a.z*(a.y+5/3)/(10/3)));
    geom.computeFaceNormals ();
    geom.computeVertexNormals ();
    var tube = new THREE.Mesh(geom, waffle_mat);
    sun.add(tube);
    tube.position.y -= 2;
    scene.add(sun);
    sun.position.set(x,y,-9);
    return sun;
}

function addGlueBottle(x, y) {
    var sun = new THREE.Mesh( new THREE.CylinderGeometry( 0.4, 0.4, 1.7, 30), new THREE.MeshPhongMaterial( { color: 0x445522 } ) );
    var geom = new THREE.CylinderGeometry( 1, 1, 4, 30, 30 );
    geom.vertices.forEach(a => a.set(a.x, a.y, a.z*(a.y+2)/4));
    geom.computeFaceNormals ();
    geom.computeVertexNormals ();
    var tube = new THREE.Mesh(geom, new THREE.MeshPhongMaterial( { color: 0xaaff22 } ));
    sun.add(tube);
    tube.position.y -= 2;
    scene.add(sun);
    sun.position.set(x,y,-9);
    return sun;
}

function addMilkBottle(x, y) {
    var geom = new THREE.CylinderGeometry( 0.5, 0.5, 2, 30);
    var tube = new THREE.Mesh(geom, new THREE.MeshPhongMaterial( { color: 0xffffff } ));
    var cap = new THREE.Mesh(new THREE.CylinderGeometry( 0.2, 0.2, 0.4, 8  ), new THREE.MeshPhongMaterial( { color: 0x332233 } ));
    tube.position.set(x,y,-9);
    cap.position.y += 1;
    tube.add(cap);
    scene.add(tube);
    return tube;
}

function makeIceCream(x, y) {
    temp.Set(x,y);
    var t_shape = createPolygonShape([new b2Vec2(-1,-1+10/6),new b2Vec2(1,-1+10/6),new b2Vec2(0,-10/6-2)]);
    var bd = new Box2D.b2BodyDef();
    bd.set_type(Box2D.b2_dynamicBody);
    bd.set_position(temp);
    var body = world.CreateBody(bd);
    var shape = new Box2D.b2CircleShape();
    shape.set_m_radius(1);
    body.CreateFixture(shape, 5.0);
    body.CreateFixture(t_shape, 5.0);
    return makeModel(x, y, "ice_cream", body);
}

function makeCowHead(x, y) {
    temp.Set(x,y);
    var bd = new Box2D.b2BodyDef();
    bd.set_type(Box2D.b2_dynamicBody);
    bd.set_position(temp);
    var body = world.CreateBody(bd);
    var shape = new Box2D.b2CircleShape();
    shape.set_m_radius(0.5);
    body.CreateFixture(shape, 5.0);
    body.CreateFixture(mini_shape, 1.0);
    body.CreateFixture(horn_shape_1, 1.0);
    body.CreateFixture(horn_shape_2, 1.0);
    return makeModel(x, y, "cow_head", body);
}

function electroBall() {
    var geometry = new THREE.Geometry();
    geometry.colors = [];
    function addRay() {
        var acc = new THREE.Vector3();
        acc.set(0,0,0);
        for (var i = 0; i < 1000; i++) {
            if (acc.length() > 2) break;
            var dir = new THREE.Vector3();
            dir.x = Math.random() * 2 - 1;
            dir.y = Math.random() * 2 - 1;
            dir.z = Math.random() * 2 - 1;
            dir.normalize();
            var c1 = new THREE.Color();
            var c2 = new THREE.Color();
            c1.setHSL(2/3, 0.5, 1-acc.length()/4);
            geometry.vertices.push(acc.clone());
            acc.addScaledVector(dir, 0.1);
            c2.setHSL(2/3, 0.7, 1-acc.length()/4);
            geometry.vertices.push(acc.clone());
            geometry.colors.push(c1);
            geometry.colors.push(c2);
        }
    }
    for (var i = 0; i < 10; i++) {
        addRay();
    }
    return geometry;
}

var ball1 = electroBall();
var ball2 = electroBall();
var ball3 = electroBall();

// var sprite = new THREE.TextureLoader().load( "nova.png" );
var sprite = new THREE.TextureLoader().load( "star.png" );

var decorations = [];

function addRay(x,y) {
    var geometry = new THREE.Geometry();
    geometry.colors = [];
    for (var i = 0; i < 100; i++) {
        var v = new THREE.Vector3(i/10,0,0);
        v.dy = i*(Math.random()-0.5)/1000;
        geometry.vertices.push(v);
    }
    /*
    var ray = new THREE.LineSegments(geom, new THREE.LineBasicMaterial( {  opacity: 0.6, linewidth: 1, vertexColors: geom.colors } ));
    ray.material.transparent = true;
    */
    var material = new THREE.PointsMaterial( { size: 3, map: sprite, /* vertexColors: THREE.VertexColors, */ transparent: true } );
    material.blending = THREE.AdditiveBlending;
    material.depthTest = false;
    var ray = new THREE.Points( geometry, material );
    scene.add(ray);
    
    ray.update = function () {
        geometry.vertices.forEach(v => v.y += v.dy);
        geometry.verticesNeedUpdate = true;
        material.opacity -= 0.01;
        return material.opacity > 0;
    }
    // setInterval(remake, 1000/60);
    ray.position.set(x,y,-9);
    decorations.push(ray);
    return ray;
}

function addElectric(x, y) {
    var geom = ball1;
    var lines1 = new THREE.LineSegments(geom, new THREE.LineBasicMaterial( {  opacity: 0.6, linewidth: 1, vertexColors: geom.colors } ));
    lines1.material.transparent = true;
    scene.add(lines1);
    lines1.position.set(x, y, -9);
    var geom = ball2;
    var lines2 = new THREE.LineSegments(geom, new THREE.LineBasicMaterial( {  opacity: 0.6, linewidth: 1, vertexColors: geom.colors } ));
    lines2.material.transparent = true;
    scene.add(lines2);
    lines2.position.set(x, y, -9);
    var geom = ball3;
    var lines3 = new THREE.LineSegments(geom, new THREE.LineBasicMaterial( {  opacity: 0.6, linewidth: 1, vertexColors: geom.colors } ));
    lines3.material.transparent = true;
    scene.add(lines3);
    lines3.position.set(x, y, -9);
    var ival = setInterval(() => { e_light.intensity = Math.random()*10; lines1.rotateX(Math.random()); lines2.rotateY(Math.random()); lines3.rotateZ(Math.random()); }, 100);
    setTimeout(function () {
        clearInterval(ival);
        scene.remove(lines1);
        scene.remove(lines2);
        scene.remove(lines3);
        e_light.intensity = 0;
    }, 1000);
    e_light.position.set( x, y, -5 );
}

function makeQuakeCloud() {
    var obj = new THREE.Object3D();
    var geom = ball1;
    var lines1 = new THREE.LineSegments(geom, new THREE.LineBasicMaterial( {  opacity: 0.6, linewidth: 1, vertexColors: geom.colors } ));
    lines1.material.transparent = true;
    obj.add(lines1);
    var geom = ball2;
    var lines2 = new THREE.LineSegments(geom, new THREE.LineBasicMaterial( {  opacity: 0.6, linewidth: 1, vertexColors: geom.colors } ));
    lines2.material.transparent = true;
    obj.add(lines2);
    var geom = ball3;
    var lines3 = new THREE.LineSegments(geom, new THREE.LineBasicMaterial( {  opacity: 0.6, linewidth: 1, vertexColors: geom.colors } ));
    lines3.material.transparent = true;
    obj.add(lines3);
    obj.doUpdate = () => { lines1.rotateX(Math.random()); lines2.rotateY(Math.random()); lines3.rotateZ(Math.random()); };
    return obj;
}

var quake_cloud = makeQuakeCloud();

function changeColor(flower) {
    var h = Math.random();
    flower.obj_leafs.forEach(leaf => leaf.material.color.setHSL(h, 0.5, 0.7));
    flower.obj_info.color = flower.obj_leafs[0].material.color.getHex();
}

function addFlower(x,y,z, info) {
    var mesh = addSphere(x, y, z || 0, 0.5, 0xffff11);
    var vec = new THREE.Vector3(1, 0, 0);
    var h = Math.random();
    if (!info) info = {};
    mesh.obj_leafs = [];
    for (var i = 0; i < 10; i++) {
        var leaf = addSphere(vec.x, vec.y, -9, 1, 0xffffaa);
        if (info.color) leaf.material.color.setHex(info.color);
        else {
            leaf.material.color.setHSL(h, 0.5, 0.7);
            // info.color = leaf.material.color.getHex();
        }
        leaf.position.copy(vec);
        leaf.scale.set(1,0.3,0.3);
        leaf.rotation.set(0,0,Math.PI/5*i);
        mesh.add(leaf);
        mesh.obj_leafs.push(leaf);
        vec.applyEuler(new THREE.Euler(0,0,Math.PI/5));
    }
    mesh.obj_info = info;
    mesh.scale.set(1,1,0.3);
    return mesh;
}

function makeSmallHead(x, y) {
    temp.Set(x,y);
    var bd = new Box2D.b2BodyDef();
    bd.set_type(Box2D.b2_dynamicBody);
    bd.set_position(temp);
    var body = world.CreateBody(bd);
    var shape = new Box2D.b2CircleShape();
    shape.set_m_radius(0.25);
    body.CreateFixture(shape, 5.0);
    // body.CreateFixture(mini_shape, 1.0);
    return makeModel(x, y, "small_head", body);
}

function makeEye() {
    var s1 = addSphere(0, 0, 0, 0.15, 0xffffff, 10);
    var s2 = addSphere(0, 0, 0.1, 0.06, 0x1f1f1f, 10);
    s1.add(s2);
    // scene.add(s1);
    return s1;
    /*
    setInterval(function () {
        s1.rotateX(0.03);
        s1.rotateY(0.02);
        s1.rotateZ(0.01);
    }, 20);
    */
}

function updateBody(obj) {
    var bpos = obj.physics.GetPosition();
    var angle = obj.physics.GetAngle();
    obj.position.set(bpos.get_x(), bpos.get_y(), -9);
    obj.rotation.setFromVector3(new THREE.Vector3(obj.rotation.x,obj.rotation.y,angle));
}

var load_type = {
    roof: makeRoof,
    box: makeBox,
    bed: makeBed,
    head: makeHead,
    small_head: makeSmallHead,
    button_cylinder: makeButtonCylinder,
    cylinder: makeCylinder,
    small_cylinder: makeSmallCylinder,
    cow_cylinder: makeCowCylinder,
    cow_head: makeCowHead,
    floor: makeFloor,
    pipe: makePipe,
    gold: makeGold,
    junk: makeJunk,
    reactor: makeReactor,
    rain: makeRain,
    ice_cream: makeIceCream,
}

var item_cost = {
    roof: 1000,
    box: 50,
    floor: 500,
    pipe: 200,
    gold: 1000,
    junk: 10,
};

var pool = {
    roof: [],
    box: [],
    head: [],
    small_head: [],
    cow_head: [],
    button_cylinder: [],
    cylinder: [],
    small_cylinder: [],
    cow_cylinder: [],
    floor: [],
    pipe: [],
    gold: [],
    junk: [],
    junkbox: [],
    reactor: [],
    glue: [],
    ice_cream: [],
    bed: [],
    rain: [],
};

var m_pool = {
    ice_cream: [],
    coins: [],
    glue: [],
    milk: [],
    flower: [],
    mark: [],
};

var logo;

function clearTitle() {
    scene.remove(logo);
    map.visible = false;
    elem("#panel").hidden = false;
    elem("#start_menu").hidden = true;
    mode = "level";
}

var loader = new THREE.TextureLoader();
var texture1 = loader.load( "blueprint1.png" );
texture1.wrapS = texture1.wrapT = THREE.RepeatWrapping;
texture1.repeat.set( 6, 12 );
texture1.offset.x = 0;
texture1.offset.y = 0.5;

function loadModel() {
    var loader = new THREE.ColladaLoader();
    loader.options.convertUpAxis = true;
    loader.load( './builder.dae', function ( collada ) {
        
        if (mode != "title") return;

        logo = collada.scene.children[2].children[0];
        logo.scale.set(5,5,5);
        logo.rotateX(Math.PI/2);
        logo.updateMatrix();
        logo.material.needsUpdate = true;
        logo.material.map = texture1;
        var bg = new THREE.Mesh( new THREE.PlaneGeometry( 300, 300 ), new THREE.MeshPhongMaterial( { color: 0xffdd99 } ) );
        logo.add(bg);
        bg.rotateX(-Math.PI/2);
        bg.position.set(0,-0.1,0);
        // bg.receiveShadow = true;
        scene.add(logo);
        logo.castShadow = true;
        // logo.position.set(-8,1,-5);
        logo.position.set(-11,2,-5);
        // setTimeout(() => mode == "title" && clearTitle(), 10000);

    } );
}

// Chair for school

function makeChair(x,y) {
    temp.Set(x,y);
    var bd = new Box2D.b2BodyDef();
    bd.set_type(Box2D.b2_dynamicBody);
    bd.set_position(temp);
    var shape = new Box2D.b2PolygonShape();
    shape.SetAsBox(0.7, 0.1);
    var body = world.CreateBody(bd);
    body.CreateFixture(shape, 50.0);
    shape.SetAsBox(0.1, 0.5, new b2Vec2(-0.5, -0.5), 0);
    body.CreateFixture(shape, 50.0);
    shape.SetAsBox(0.1, 0.5, new b2Vec2(0.5, -0.5), 0);
    body.CreateFixture(shape, 50.0);
    
    return makeModel(x, y, "chair", body);
}

models.chair = function (x,y) {
    var box = addBox(x, y, 1.4, 0.2, 0xC19A6B);
    var box2 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1, 1),  new THREE.MeshPhongMaterial( { color: 0xC19A6B } ));
    box2.position.set(-0.5,-0.5,0);
    box.add(box2);
    var box3 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1,1),  new THREE.MeshPhongMaterial( { color: 0xC19A6B } ));
    box3.position.set(0.5,-0.5,0);
    box.add(box3);
    return box;
}

pool.chair = [];
load_type.chair = makeChair;

/// glass

function makeGlass(x,y) {
    temp.Set(x,y);
    var bd = new Box2D.b2BodyDef();
    bd.set_type(Box2D.b2_dynamicBody);
    bd.set_position(temp);
    var shape = new Box2D.b2PolygonShape();
    shape.SetAsBox(0.5, 0.5);
    var body = world.CreateBody(bd);
    body.CreateFixture(shape, 3.0);
    
    return makeModel(x, y, "glass", body);
}

models.glass = function (x,y) {
    var box = addBox(x, y, 1, 1, 0x777777);
    box.material.transparent = true;
    box.material.opacity = 0.5;
    box.castShadow = false;
    return box;
}

pool.glass = [];
load_type.glass = makeGlass;

// rock

function makeRock(x,y) {
    temp.Set(x,y);
    var bd = new Box2D.b2BodyDef();
    bd.set_type(Box2D.b2_dynamicBody);
    bd.set_position(temp);
    var shape = new Box2D.b2PolygonShape();
    shape.SetAsBox(1, 1);
    var body = world.CreateBody(bd);
    body.CreateFixture(shape, 0.5);
    
    return makeModel(x, y, "rock", body);
}

models.rock = function (x,y) {
    var box = addBox(x, y, 2, 2, 0x777777);
    return box;
}

pool.rock = [];
load_type.rock = makeRock;

// Bomb

function dynamicBody(x,y) {
    temp.Set(x,y);
    var bd = new Box2D.b2BodyDef();
    bd.set_type(Box2D.b2_dynamicBody);
    bd.set_position(temp);
    return world.CreateBody(bd);
}

function makeBomb(x,y) {
    var body = dynamicBody(x,y);
    var shape = new Box2D.b2CircleShape();
    shape.set_m_radius(2);
    body.CreateFixture(shape, 1);
    var shape = new Box2D.b2PolygonShape();
    shape.SetAsBox(1, 1, new b2Vec2(0, 2), 0);
    body.CreateFixture(shape, 1);
    
    return makeModel(x, y, "bomb", body);
}

models.bomb = function (x,y) {
    var box = addSphere(x, y, -9, 2, 0x222222);
    var knob = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 2, 30), new THREE.MeshPhongMaterial( { color: 0x222222 } ));
    knob.position.set(0,2,0);
    box.add(knob);
    return box;
}

pool.bomb = [];
load_type.bomb = makeBomb;

// tree trunk

function makeTrunk(x,y) {
    var body = dynamicBody(x,y);
    var shape = new Box2D.b2PolygonShape();
    shape.SetAsBox(0.75, 3);
    body.CreateFixture(shape, 3);
    
    return makeModel(x, y, "trunk", body);
}

models.trunk = function (x,y) {
    var box = addCylinder(x, y, 1.5, 6, 0x964B00);
    return box;
}

pool.trunk = [];
load_type.trunk = makeTrunk;

// tree leaves

function makeLeaves(x,y) {
    var body = dynamicBody(x,y);
    var shape = new Box2D.b2CircleShape();
    shape.set_m_radius(3);
    body.CreateFixture(shape, 1);
    var shape = new Box2D.b2PolygonShape();
    shape.SetAsBox(0.75, 3);
    body.CreateFixture(shape, 1);
    
    return makeModel(x, y, "leaves", body);
}

models.leaves = function (x,y) {
    var box = addSphere(x, y, -9, 3, 0x22ff22);
    box.scale.set(1,1,0.3)
    return box;
}

pool.leaves = [];
load_type.leaves = makeLeaves;


// circular saw

function makeSaw(x,y) {
    var body = dynamicBody(x,y);
    var shape = new Box2D.b2CircleShape();
    shape.set_m_radius(1);
    var fd = new Box2D.b2FixtureDef();
    fd.set_density(10);
    fd.set_friction(1);
    fd.set_restitution(0.1);
    fd.set_shape(shape);
    body.CreateFixture(fd);
    
    return makeModel(x, y, "saw", body);
}

models.saw = function (x,y) {
    var geom = new THREE.CylinderGeometry(1, 1, 0.2, 300);
    geom.rotateX(Math.PI/2);
    geom.vertices.forEach(v => v.multiplyScalar(((Math.atan2(v.x, v.y)*12+10000*Math.PI) % Math.PI)*0.1 + 0.9));
    var mesh = new THREE.Mesh(geom, new THREE.MeshPhongMaterial( { color: 0x666666, specular: 0x888888 } ));
    return mesh;
}

pool.saw = [];
load_type.saw = makeSaw;

pool.revolute = [];

/////////////////

function makeMonsterHead(x,y) {
    var body = dynamicBody(x,y);
    var shape = new Box2D.b2CircleShape();
    shape.set_m_radius(1.0);
    body.CreateFixture(shape, 5.0);
    body.CreateFixture(big_horn_shape_1, 1.0);
    body.CreateFixture(big_horn_shape_2, 1.0);
    
    return makeModel(x, y, "monster_head", body);
}

models.monster_head = function (x,y) {
    var obj = addSphere(x, y, -9, 0.5, 0x222222);
    var e1 = makeEye();
    e1.position.set(0.3,0.1,0.3);
    e1.material.color.setHex(0xff1111);
    obj.add(e1);
    var e2 = makeEye();
    e2.material.color.setHex(0xff1111);
    e2.position.set(-0.3,0.1,0.3);
    obj.add(e2);
    var m = addMouth();
    m.position.set(0,-0.2,0.5);
    m.rotateX(Math.PI);
    obj.add(m);
    obj.mouth = m;
    var geometry = new THREE.CylinderGeometry( 0, Math.sqrt((1 - Math.pow(Math.cos(horn_angle),2)) + Math.pow(Math.sin(horn_angle),2)), 1+Math.sin(horn_angle), 30 );
    var material = new THREE.MeshPhongMaterial( { color: 0x444444 } );
    geometry.translate(0,Math.cos(horn_angle),0);
    var horn1 = new THREE.Mesh( geometry, material );
    horn1.rotateZ(Math.PI/6);
    horn1.castShadow = horn1.receiveShadow = true;
    obj.add(horn1);
    var horn2 = new THREE.Mesh( geometry, material );
    horn2.rotateZ(-Math.PI/6);
    horn2.castShadow = horn2.receiveShadow = true;
    obj.add(horn2);
    obj.scale.set(2,2,2);
    return obj;
}

pool.monster_head = [];
load_type.monster_head = makeMonsterHead;

//////////////////

function makeWormBody(x,y) {
    var body = dynamicBody(x,y);
    var shape = new Box2D.b2CircleShape();
    shape.set_m_radius(1.0);
    body.CreateFixture(shape, 5.0);
    
    return makeModel(x, y, "worm_body", body);
}

models.worm_body = (x,y) => addSphere(x, y, -9, 1, 0x222222);

pool.worm_body = [];
load_type.worm_body = makeWormBody;

function makeWorm(x,y,n,s) {
    var worm = [];
    worm.push(makeMonsterHead(x,y));
    for (var i = 0; i < n; i++) worm.push(makeWormBody(x+2*(i+1),y));
    bodies.forEach((b,i) => b.index = i);
    var wjs = [];
    for (var i = 0; i < n; i++) {
        var inf = {body1: worm[i].index, body2: worm[i+1].index, type: "revolute", x: 1, y: 0};
        var joint = loadRevolute(inf);
        joint.physics.SetMotorSpeed(0.01);
        joint.physics.EnableLimit(true);
        joint.physics.SetLimits(-Math.PI/3, Math.PI/3);
        joints.push(joint);
        wjs.push(joint);
    }
    worm[0].reset = s => wjs.forEach(a => a.physics.SetMotorSpeed((Math.random()-0.5)*s))
}

function makeWorm2(x,y,n,s) {
    var worm = [];
    worm.push(makeMonsterHead(x,y));
    for (var i = 0; i < n; i++) worm.push(makeWormBody(x+2*(i+1),y));
    worm.push(makeMonsterHead(x+2*(n+1),y));
    bodies.forEach((b,i) => b.index = i);
    var wjs = [];
    for (var i = 0; i < worm.length-1; i++) {
        var inf = {body1: worm[i].index, body2: worm[i+1].index, type: "revolute", x: 1, y: 0};
        var joint = loadRevolute(inf);
        joint.physics.SetMotorSpeed(0.01);
        joint.physics.EnableLimit(true);
        joint.physics.SetLimits(-Math.PI/3, Math.PI/3);
        joints.push(joint);
        wjs.push(joint);
    }
    var w = {
        reset: s => wjs.forEach(a => a.physics.SetMotorSpeed((Math.random()-0.5)*s))
    }
    setInterval(() => w.reset(s), 500)
    return w;
}

function addCover() {
    var cover = new THREE.Object3D();
    var mat = new THREE.MeshPhongMaterial({color:0xffffff});
    mat.transparent = true;
    mat.opacity = 0.3;
    var p1 = new THREE.Mesh(new THREE.PlaneGeometry(300, 140), mat);
    var p2 = new THREE.Mesh(new THREE.PlaneGeometry(300, 140), mat);
    p1.position.set(0,-80,0);
    p2.position.set(0,80,0);
    var p3 = new THREE.Mesh(new THREE.PlaneGeometry(140, 20), mat);
    var p4 = new THREE.Mesh(new THREE.PlaneGeometry(140, 20), mat);
    p3.position.set(-80,0,0);
    p4.position.set(80,0,0);
    [p1,p2,p3,p4].forEach(p => cover.add(p));
    cover.position.set(0,0,1);
    map.add(cover);
    return cover;
}

function poppingObject(obj) {
    obj.reset = function () {
        obj.time = 0;
        obj.speed = Math.floor(Math.random()*2) + 2;
    };
    obj.reset();
    obj.update = function () {
        obj.time += obj.speed;
        obj.position.z = 5*(obj.time < 100 ? obj.time/100 : 1-(obj.time-100)/100)-1;
        if (obj.time > 200) removeCollectible(obj);
    };
}

function addLillibro(x,y) {
    var obj = new THREE.Object3D();
    var head = addHead(0,0);
    var body = addCylinder(0,0,1,2,0xff00ff);
    head.position.set(0,0.5,0);
    body.position.set(0,-1,0);
    obj.add(head); obj.add(body);
    obj.position.set(x,y,0);
    obj.rotateX(Math.PI/2);
    poppingObject(obj);
    return obj;
}

m_pool.lillibro = [];

var product_model = {
    ice_cream: (x,y) => { var obj = addIceCream(x,y); obj.scale.set(0.4,0.4,0.4); return obj; },
    glue: (x,y) => { var obj = addGlueBottle(x,y); obj.scale.set(0.4,0.4,0.4); return obj; },
    flower: (x,y) => { var obj = addFlower(x,y); obj.scale.set(0.4,0.4,0.4); return obj; },
    milk: (x,y) => addMilkBottle(x,y),
    lillibro: (x,y) => addLillibro(x,y),
    happy: (x,y) => addHead(x,y),
    sad: (x,y) => { var obj = addHead(x,y); obj.mouth.morphTargetInfluences[0] = 0.2; return obj; },
    reactor: (x,y) => { var obj = addReactor(x,y); obj.scale.set(0.4,0.4,0.4); obj.rotateX(Math.PI/2); poppingObject(obj); return obj; },
    weather: (x,y) => {
        var obj = addCylinder(x,y,3,5,0xeeffee);
        obj.scale.set(0.4,0.4,0.4);
        obj.rotateX(Math.PI/2);
        obj.obj_type = "weather";
        poppingObject(obj);
        return obj;
    },
}

m_pool.weather = [];
m_pool.reactor = [];
m_pool.happy = [];
m_pool.sad = [];

function miniModel(type, scale) {
    product_model[type] = (x,y) => { var obj = models[type](x,y); obj.scale.set(scale, scale, scale); return obj; }
    m_pool[type] = [];
}

miniModel("roof", 0.4);
miniModel("bomb", 0.4);
miniModel("pipe", 1);
miniModel("glass", 1);
miniModel("floor", 0.4);

function makeWater(x, y) {
    temp.Set(x,y);
    var bd = new Box2D.b2BodyDef();
    bd.set_type(Box2D.b2_dynamicBody);
    bd.set_position(temp);
    var body = world.CreateBody(bd);
    var shape = new Box2D.b2CircleShape();
    shape.set_m_radius(0.1);
    body.CreateFixture(shape, 20.0);
    return makeModel(x, y, "water", body);
}

pool.water = [];
load_type.water = makeWater;

models.water = function (x,y) {
    var obj = addSphere(x, y, -9, 0.3, 0x6677ff);
    obj.material.transparent = true;
    obj.material.opacity = 0.4;
    obj.material.color.setHSL(2/3, 0.9+Math.random()*0.1, Math.random()*0.2+0.6);
    obj.receiveShadow = false;
    obj.castShadow = false;
    return obj;
}

/////////////////////

function makeDevice(x,y) {
    var body = dynamicBody(x,y);
    var shape = new Box2D.b2PolygonShape();
    shape.SetAsBox(2, 2);
    body.CreateFixture(shape, 50);
    
    return makeModel(x, y, "device", body);
}

models.device = (x,y) => { var res = addBox(x, y, 1, 1, 0xffaa22); res.scale.set(4,4,1); return res; }

pool.device = [];
load_type.device = makeDevice;

//////////////

function makeBeam(x,y) {
    var body = dynamicBody(x,y);
    var shape = new Box2D.b2PolygonShape();
    shape.SetAsBox(20, 0.2);
    body.CreateFixture(shape, 50);
    
    return makeModel(x, y, "beam", body);
}

models.beam = (x,y) => addBox(x, y, 40, 0.4, 0xffaa22)

pool.beam = [];
load_type.beam = makeBeam;

/////////////////////

function makeDevice2(x,y) {
    var body = dynamicBody(x,y);
    var shape = new Box2D.b2PolygonShape();
    shape.SetAsBox(2, 2);
    body.CreateFixture(shape, 50);
    var shape = new Box2D.b2PolygonShape();
    
    shape.SetAsBox(Math.sqrt(2), Math.sqrt(2), new b2Vec2(0,2), Math.PI/4);
    body.CreateFixture(shape, 50);
    
    return makeModel(x, y, "device2", body);
}

models.device2 = (x,y) => {
    var res = addBox(x, y, 1, 1, 0xffaa22);
    var res2 = addBox(x, y, Math.sqrt(0.5), Math.sqrt(0.5), 0xffaa22);
    res2.rotateZ(Math.PI/4);
    res2.position.set(0,0.5,0);
    res.add(res2);
    res.scale.set(4,4,1);
    return res;
}

pool.device2 = [];
load_type.device2 = makeDevice2;

///

function makeLillibro(x,y) {
    var body = dynamicBody(x,y);
    var shape = new Box2D.b2PolygonShape();
    shape.SetAsBox(0.5, 1);
    body.CreateFixture(shape, 5);
    var shape = new Box2D.b2CircleShape();
    shape.set_m_radius(0.5);
    shape.set_m_p(new b2Vec2(0,1.5));
    body.CreateFixture(shape, 5);
    return makeModel(x, y, "lillibro", body);
}

models.lillibro = function (x,y) {
    var obj = new THREE.Object3D();
    var head = addHead(0,0);
    var body = addCylinder(0,0,1,2,0xff00ff);
    head.position.set(0,1.5,0);
    body.position.set(0,0,0);
    obj.add(head); obj.add(body);
    obj.position.set(x,y,0);
    // obj.rotateX(Math.PI/2);
    return obj;
}

pool.lillibro = [];
load_type.lillibro = makeLillibro;

///

function makeWheel(x,y) {
    var body = dynamicBody(x,y);

    var shape = new Box2D.b2CircleShape();
    shape.set_m_radius(1);
    body.CreateFixture(shape, 5);
    return makeModel(x, y, "wheel", body);
}

models.wheel = addWheel;

pool.wheel = [];
load_type.wheel = makeWheel;

///

function makeWagon(x,y) {
    var body = dynamicBody(x,y);

    var shape = new Box2D.b2PolygonShape();
    shape.SetAsBox(3, 0.5);
    body.CreateFixture(shape, 5);
    
    var shape = new Box2D.b2PolygonShape();
    shape.SetAsBox(0.5, 2, new b2Vec2(3.5,2.5), 0);
    body.CreateFixture(shape, 5);
    
    var shape = new Box2D.b2PolygonShape();
    shape.SetAsBox(0.5, 2, new b2Vec2(-3.5,2.5), 0);
    body.CreateFixture(shape, 5);
    
    return makeModel(x, y, "wagon", body);
}

models.wagon = function (x,y) {
    var obj = new THREE.Object3D();
    var bottom = addBox(0,0, 6, 1, 0x0022ff);
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

pool.wagon = [];
load_type.wagon = makeWagon;

///

function makeHexagon(x,y) {
    var body = dynamicBody(x,y)

    var lst = []
    for (var i = 0; i < 6; i++) {
        var a = 2*Math.PI / 6 * i
        lst.push(new b2Vec2(Math.cos(a),Math.sin(a)))
    }
    var shape = createPolygonShape(lst)
    body.CreateFixture(shape, 5)
    
    return makeModel(x, y, "hexagon", body)
}

models.hexagon = function (x,y) {
    var geometry = new THREE.CylinderGeometry(1, 1, 2, 6)
    geometry.rotateX(Math.PI/2)
    geometry.rotateZ(Math.PI/6)
    
    // var material = new THREE.MeshStandardMaterial( { color: 0xffee11,  emissive: 0xffee11, metalness: 0.9, roughness: 0.1 } );
    var material = new THREE.MeshPhongMaterial( { color: 0xffee11,  specular: 0xffee11 } );
    material.shininess = 100;
    var obj = new THREE.Mesh(geometry, material)
    return obj;
}

pool.hexagon = [];
load_type.hexagon = makeHexagon;

//////////////

function makeGlueItem(x,y) {
    var body = dynamicBody(x,y);
    var shape = new Box2D.b2PolygonShape();
    shape.SetAsBox(1, 2, new b2Vec2(0, -2), 0);
    body.CreateFixture(shape, 5);
    
    var shape = new Box2D.b2PolygonShape();
    shape.SetAsBox(0.5, 0.8);
    body.CreateFixture(shape, 5);
    
    return makeModel(x, y, "glue_item", body);
}

models.glue_item = (x,y) => { var res = addGlueBottle(x, y); res.position.set(x, y, -9); return res; }

pool.glue_item = [];
load_type.glue_item = makeGlueItem;



function removeExtraBody(obj) {
    if (!extra_bodies.find(a => a == obj)) return;
    extra_bodies = extra_bodies.filter(a => a != obj);
    scene.remove(obj);
    world.DestroyBody(obj.physics);
}

function removeBody(obj) {
    if (!bodies.find(a => a == obj)) return;
    scene.remove(obj);
    world.DestroyBody(obj.physics);
    pool[obj.obj_type].push(obj);
    bodies.forEach((a,i) => a.index = i);
    bodies = bodies.filter(a => a != obj);
    joints.filter(a => a.obj_body1 == obj.index || a.obj_body2 == obj.index).forEach(a => scene.remove(a));
    joints = joints.filter(a => a.obj_body1 != obj.index && a.obj_body2 != obj.index);
    var c = (num) => num < obj.index ? num : num-1;
    joints.forEach(a => { a.obj_body1 = c(a.obj_body1); a.obj_body2 = c(a.obj_body2); if (a.obj_body1 == a.obj_body2) console.log("??????"); }); 
}

function removeJoint(obj) {
    if (!joints.find(a => a == obj)) return;
    joints = joints.filter(a => a != obj);
    scene.remove(obj);
    world.DestroyJoint(obj.physics);
}
