$(function () {

    var scene = new THREE.Scene();
    var stats = initStats();
    var camera = createAndSetupCamera(); 
    var renderer = createAndSetupRenderer();
    createAndSetupGUI();

    var pointsGroup;
    var cylinder;

    var h = 12;
    var R = 5;

    var ambiLight = new THREE.AmbientLight(0x141414)
    scene.add(ambiLight);

    var light = new THREE.DirectionalLight();
    light.position.set(0, 10, 10);
    scene.add(light);

    addCylinder();

    render();

    function addCylinder(){
        var points = generateCylinderPoints(170);
        pointsGroup = createPointGeometry(points);
        scene.add(pointsGroup);
        const geometry = new THREE.ConvexGeometry(points);

        addUVCoordinates(geometry);

        var texture = THREE.ImageUtils.loadTexture("../assets/textures/table.jpg")
        var material = new THREE.MeshPhongMaterial();
        material.map = texture;
        cylinder = new THREE.Mesh(geometry, material);

        scene.add(cylinder);
    }

    function generateCylinderPoints(pointCount){
        var points = [];
        for (var i = 0; i < pointCount; i++) {
            var x = getRandomInt(-R, R);
            var y = getRandomInt(-h / 2, h / 2);
            var z = getRandomInt(-R, R);

            if (x * x + z * z <= R * R) {
                points.push(new THREE.Vector3(x, y, z));
            } else {
                i--;
            }
        }
        return points;
    }

    function createPointGeometry(points){
        const pointGroup = new THREE.Object3D();
        const material = new THREE.MeshBasicMaterial({ color: 0x0000FF, transparent: false });
        points.forEach(function (point) {
            var spGeom = new THREE.SphereGeometry(0.2);
            var spMesh = new THREE.Mesh(spGeom, material);
            spMesh.position = point;
            pointGroup.add(spMesh);
        });
        
        return pointGroup;
    }

    function addUVCoordinates(geometry) {
        console.log(geometry);
        geometry.faceVertexUvs[0] = [];
        const faces = geometry.faces;

        for (var i = 0; i < faces.length; i++) {
            var v1 = geometry.vertices[faces[i].a],
                v2 = geometry.vertices[faces[i].b],
                v3 = geometry.vertices[faces[i].c];
            
            var u1 = getU(v1.x, v1.z);
                u2 = getU(v2.x, v2.z);
                u3 = getU(v3.x, v3.z);

                if(differenceGreaterOrEqual(0.4, u1, u2) && differenceGreaterOrEqual(0.4, u1, u3)) {
                    u1 >= 0.4 ? u1 -= 1 : u1 += 1;
                }

                if(differenceGreaterOrEqual(0.4, u2, u1) && differenceGreaterOrEqual(0.4, u2, u3)){
                    u2 >= 0.4 ? u2 -= 1 : u2 += 1;
                }
                    
                if(differenceGreaterOrEqual(0.4, u3, u1) && differenceGreaterOrEqual(0.4, u3, u2)){
                    u3 >= 0.4 ? u3 -= 1 : u3 += 1;
                }

            geometry.faceVertexUvs[0][i] = ([
                new THREE.Vector2(u1, v1.y / h + 0.5),
                new THREE.Vector2(u2, v2.y / h + 0.5),
                new THREE.Vector2(u3, v3.y / h + 0.5)
            ]);
        }
        geometry.uvsNeedUpdate = true;
    }

    function render() {
        stats.update();
        cylinder.rotation.y += 0.01;
        pointsGroup.rotation.y += 0.01;
        requestAnimationFrame(render);
        renderer.render(scene, camera);
    }


    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min)) + Math.ceil(min));
    }

    function getU(x, z) {
        return (Math.atan2(x, z) + Math.PI) / (Math.PI * 2)
    }

    function differenceGreaterOrEqual(difference, x, y) {
        return Math.abs(x-y) >= difference;
    }

    function initStats() {
        var stats = new Stats();
        stats.setMode(0);
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.left = '0px';
        stats.domElement.style.top = '0px';
        $("#Stats-output").append(stats.domElement);

        return stats;
    }
    
    function createAndSetupCamera() {
        var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
        camera.position = new THREE.Vector3(15, 7, 18);
        camera.lookAt(new THREE.Vector3(0, 0, 0));

        return camera;
    }

    function createAndSetupRenderer() {
        var webGLRenderer = new THREE.WebGLRenderer();
        webGLRenderer.setClearColorHex(0xEEFFEE, 1.0);
        webGLRenderer.setSize(window.innerWidth, window.innerHeight);
        webGLRenderer.shadowMapEnabled = true;
        $("#WebGL-output").append(webGLRenderer.domElement);

        return webGLRenderer;
    }

    function createAndSetupGUI() {
        var controls = new function () {
            this.redraw = function () {
                scene.remove(pointsGroup);
                scene.remove(cylinder);

                addCylinder();
            };

        }

        var gui = new dat.GUI();
        gui.add(controls, 'redraw');
    }
});

