var particleLight = new THREE.Mesh(
        new THREE.SphereBufferGeometry( 4, 8, 8 ),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
    ),
    reflectionCube = new THREE.CubeTextureLoader(),
    pointLight = new THREE.PointLight( 0xffffff, 2, 800 ),
    myGrid = new THREE.GridHelper( 160, 10 ),
    myGroup = new THREE.Group(),

    // Utility variables
    windowHalfX = window.innerWidth / 2,
    windowHalfY = window.innerHeight / 2,
    PI2 = Math.PI * 2,
    mouseX = 0, mouseY = 0;

particleLight.add( pointLight );

reflectionCube.format = THREE.RGBFormat;
reflectionCube.setPath( 'js/vendor/three.js/textures/cube/SwedishRoyalCastle/' )
.load( [ 'px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg' ] );

myGrid.rotation.x = Math.PI / 2;
myGroup.add( helper );

scene.background = reflectionCube;

function createPointsCube()
{
    var particles = 50000,
        geometry = new THREE.BufferGeometry(),
        material, points,
        positions = [],
        colors = [],
        color = new THREE.Color(),
        n = 1000, n2 = n / 2, // particles spread in the cube
        x, y, z, vx, vy, vz;

    for ( var i = 0; i < particles; i ++ )
    {
        // positions
        x = Math.random() * n - n2;
        y = Math.random() * n - n2;
        z = Math.random() * n - n2;

        positions.push( x, y, z );

        // colors
        vx = ( x / n ) + 0.5;
        vy = ( y / n ) + 0.5;
        vz = ( z / n ) + 0.5;

        color.setRGB( vx, vy, vz );
        colors.push( color.r, color.g, color.b );
    }

    geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ));
    geometry.addAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ));
    geometry.computeBoundingSphere();

    material = new THREE.PointsMaterial({ size: 15, vertexColors: THREE.VertexColors });
    points = new THREE.Points( geometry, material );

    return points;
}


// Add everything to the scene
scene.add( particleLight );
scene.add( createPointsCube() );


// Set up event listeners
document.addEventListener( 'mousemove', onDocumentMouseMove, false );
document.addEventListener( 'touchstart', onDocumentTouchStart, false );
document.addEventListener( 'touchmove', onDocumentTouchMove, false );
window.addEventListener( 'resize', onWindowResize, false );

function render()
{
    var timer = Date.now() * 0.00025;

    particleLight.position.x = Math.sin( timer * 7 ) * 300;
    particleLight.position.y = Math.cos( timer * 5 ) * 400;
    particleLight.position.z = Math.cos( timer * 3 ) * 300;
}

function onDocumentMouseMove( event )
{
    mouseX = event.clientX - windowHalfX;
    mouseY = event.clientY - windowHalfY;
}

function onDocumentTouchStart( event )
{
    if ( event.touches.length === 1 )
    {
        event.preventDefault();
        mouseX = event.touches[ 0 ].pageX - windowHalfX;
        mouseY = event.touches[ 0 ].pageY - windowHalfY;
    }
}

function onDocumentTouchMove( event )
{
    if ( event.touches.length === 1 )
    {
        event.preventDefault();
        mouseX = event.touches[ 0 ].pageX - windowHalfX;
        mouseY = event.touches[ 0 ].pageY - windowHalfY;
    }
}

function onWindowResize()
{
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}
