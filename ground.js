
function constructPoly(lst) {
    var shape = new THREE.Shape();
    shape.moveTo(lst[0].x, lst[0].y);
    lst.filter((p,i) => i != 0).forEach(p => shape.lineTo(p.x, p.y));

    var geom = new THREE.ExtrudeGeometry(shape, {amount:1.5, bevelEnabled: false});
    var mesh = new THREE.Mesh(geom, new THREE.MeshPhongMaterial({ color: 0x23fe43 }));
    mesh.position.z = -9;
    return mesh;
}

function createChainShape(vertices, closedLoop) {
    var shape = new Box2D.b2ChainShape();            
    // var buffer = Box2D.allocate(vertices.length * 8, 'float', Box2D.ALLOC_STACK);
    var buffer = Box2D._malloc(vertices.length * 8);
    
    var offset = 0;
    for (var i=0; i<vertices.length; i++) {
        // Box2D.setValue(buffer+(offset), vertices[i].get_x(), 'float');
        Box2D.HEAPF32[buffer + offset >> 2] = vertices[i].get_x();
        // Box2D.setValue(buffer+(offset+4), vertices[i].get_y(), 'float');
        Box2D.HEAPF32[buffer + (offset+4) >> 2] = vertices[i].get_y();
        offset += 8;
    }
    var ptr_wrapped = Box2D.wrapPointer(buffer, Box2D.b2Vec2);
    if ( closedLoop )
        shape.CreateLoop(ptr_wrapped, vertices.length);
    else
        shape.CreateChain(ptr_wrapped, vertices.length);
    return shape;
}

function smallest(lst, f) {
    if (lst.length == 0) return null;
    var res = lst[0];
    lst.forEach(a => {
        if (f(res) > f(a)) res = a;
    });
    return res;
}

function largest(lst, f) {
    if (lst.length == 0) return null;
    var res = lst[0];
    lst.forEach(a => {
        if (f(res) < f(a)) res = a;
    });
    return res;
}

function groundBody(res) {
    var fixDef = new b2FixtureDef();
    fixDef.set_density(1.0);
    fixDef.set_friction(0.5);
    fixDef.set_restitution(0.2);

    var bodyDef = new b2BodyDef();
    bodyDef.type = b2Body.b2_staticBody;
    var body1 = world.CreateBody(bodyDef);

    var shape = createChainShape(res.map(p => new b2Vec2(p.x, p.y)));
    fixDef.set_shape(shape);
    body1.CreateFixture(fixDef);

    var mesh = constructPoly(res);
    assoc[body1.e] = mesh;
    mesh.obj_type = "ground";
    mesh.obj_info = {};
    mesh.obj_info.points = res;

    mesh.physics = body1;

    return mesh;
}

function makeRandom(bump) {
    var ground = [];
    for (var i = 0; i < 3; i++) ground.push(0);
    for (var i = 0; i < 100; i++) {
        ground.push(Math.random()*bump);
    }
    for (var i = 0; i < 3; i++) ground.push(0);
    // return groundBody(ground);
    
    var len = 5;
    var x = 0;
    var res = ground.map((y,i) => ({x:x+i*len,y:y}));
    res.push({x:(ground.length-1)*len, y:res[0].y-100});
    res.push({x:0, y:res[0].y-100});
    res.push({x:0, y:res[0].y});

    return res;
}

function makeFlat(w) {
    return [{x:0, y:0}, {x:w, y:0}, {x:w, y:-100}, {x:0, y:-100}, {x:0, y:0}];
}

function makeGame(w) {
    var a = -19
    return [{x:-100, y:a}, {x:0, y:-20}, {x:0, y:0}, {x:w, y:0}, {x:w, y:-20}, {x:w+100, y:a}, {x:w+100, y:-100}, {x:-100, y:-100}, {x:-100, y:a}];
}

/*


exports.addUphill = function (world, bump, bias, bias2) {
    var ground = [];
    var level = 0;
    bias = bias || 0;
    bias2 = bias2 || 0;
    for (var i = 0; i < 100; i++) {
        ground.push(level);
        level -= (Math.random()-bias2)*bump;
        bump += bias;
    }
    return exports.add(world, ground);
};

exports.addSewer = function (bias, n, limit) {
    var ground = [];
    var level = 0;
    var bump = 0;
    for (var i = 0; i < n; i++) {
        ground.push({x:i*5, y:level});
        level += bump;
        bump += (Math.random()*2 - 1) * bias;
        bump = Math.max(bump, -limit);
        bump = Math.min(bump, limit);
    }
    return ground;
};

exports.addIncreasingRandom = function (world, bump) {
    var ground = [];
    for (var i = 0; i < 100; i++) {
        ground.push(Math.random()*bump*(i/100));
    }
    return exports.add(world, ground);
};


exports.flat = function () {

    var res = [{x:0, y:0}, {x:500, y:0}];
    return res;
};

exports.blocks = function () {
    var lst = [];
    var x = 0;
    for (var i = 0; i < 100; i++) {
        lst.push({x:x, y:0});
        x += Math.random()*50 + 10;
        lst.push({x:x, y:-Math.random()*2-0.5});
        lst.push({x:x, y:10});
        x += Math.random()*10 + 5;
        lst.push({x:x, y:10});
    }
    return {floor: lst};
};

exports.fromPoints = function (world, lst, far_y) {
    far_y = far_y || 10000;
    var fixDef = new b2FixtureDef();
    fixDef.density = 1.0;
    fixDef.friction = 0.5;
    fixDef.restitution = 0.2;

    var bodyDef = new b2BodyDef();
    bodyDef.type = b2Body.b2_staticBody;

    bodyDef.position.x = 0;
    bodyDef.position.y = 0;
    var body1 = world.CreateBody(bodyDef);

    var res = [{x:0, y:0}];
    var prev = {x:0, y:0};

    lst.forEach(function (p) {
        fixDef.shape = new b2PolygonShape();
        fixDef.shape.SetAsEdge(new b2Vec2(prev.x,prev.y), new b2Vec2(p.x, p.y));
        body1.CreateFixture(fixDef);
        res.push({x:p.x, y:p.y});
        prev = p;
    });

    res.push({x:res[res.length-1].x, y:res[res.length-1].y+far_y});
    res.push({x:res[0].x, y:res[0].y+far_y});
    
    body1.id = uniq++;
    body1.points = res;
    body1.width = lst[lst.length-1].x;
    body1.is_ground = true;

    return body1;
};

exports.ceiling = function (world, lst) {
    var fixDef = new b2FixtureDef();
    fixDef.density = 1.0;
    fixDef.friction = 0.5;
    fixDef.restitution = 0.2;

    var bodyDef = new b2BodyDef();
    bodyDef.type = b2Body.b2_staticBody;

    bodyDef.position.x = 0;
    bodyDef.position.y = 0;
    var body1 = world.CreateBody(bodyDef);

    var res = [lst[0]];
    var prev = lst[0];

    lst.forEach(function (p) {
        fixDef.shape = new b2PolygonShape();
        fixDef.shape.SetAsEdge(new b2Vec2(prev.x,prev.y), new b2Vec2(p.x, p.y));
        body1.CreateFixture(fixDef);
        res.push({x:p.x, y:p.y});
        prev = p;
    });

    res.push({x:res[res.length-1].x, y:res[res.length-1].y-200});
    res.push({x:res[0].x, y:res[0].y-200});
    
    body1.id = uniq++;
    body1.points = res;
    body1.width = lst[lst.length-1].x;
    body1.is_ground = true;

    return body1;
};


exports.load = function (world, name) {
    return exports.fromPoints(world, JSON.parse(localStorage.getItem(name)));
};

*/
