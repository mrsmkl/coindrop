
function makeText(str) {
    var canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 64;
    var ctx = canvas.getContext("2d");
    ctx.strokeStyle = "black";
    ctx.fillStyle = "green";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "30px Arial";
    ctx.fillRect(0, 0, 256, 64);
    ctx.fillStyle = "white";
    ctx.fillText(str, 128, 32);
    ctx.strokeText(str, 128, 32);
    var tex = new THREE.Texture(canvas);
    tex.needsUpdate = true;
    tex.ctx = ctx;
    return tex;
}


