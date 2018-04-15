function initLogo()
{
    if ( !Detector.webgl ) Detector.addGetWebGLMessage();

    var plusxLogo_SVGPaths =
        {
            paths: [
                "M77.9,0h27.2l13,20.8L131.4,0h26.7l-26,37.6l27,38.8h-27.3l-14.7-20.8l-14.4,20.8H76.6l26.3-38.7L77.9,0z",
                "M25.8,49.8v26.6h22.5V49.7H74V26.7H48.2V0H25.8v26.6H0v23.1L25.8,49.8z"
            ],
            amounts: [ 30, 30 ],
            colors:  [ 0x00AEEF, 0x00EA00 ],
            center:  { x: 80, y: 30 }
        },

        d33d_SVG = {},

        container = $( '#container' ),

        scene, camera, renderer, controls,
        ambientLight, directionalLight,

        plusxLogo, particleGroup, particles, particle,
        particleData, particleCount = 0,

        mouseX = 0, mouseY = 0,
        windowHalfX = window.innerWidth / 2,
		windowHalfY = window.innerHeight / 2,

        reflectionCube = new THREE.CubeTextureLoader(),

        PI2 = Math.PI * 2;

    init();
    animate();

    function init()
    {
        particleData = {
            SEPARATION: 100,
            AMOUNTX: 50,
            AMOUNTY: 50
        };

        // This is an SVG renderer from D3-3D, used inline in this example:
        // https://threejs.org/examples/?q=geometry#webgl_geometry_extrude_shapes2
        // D3-3D: https://github.com/Niekes/d3-3d
        THREE.D33D_SVG( d33d_SVG );

        // reflectionCube.format = THREE.RGBFormat;
        // reflectionCube.setPath( 'js/vendor/three.js/textures/cube/SwedishRoyalCastle/' )
        // .load( [ 'px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg' ] ),

        scene = new THREE.Scene();
        scene.background = reflectionCube;

        camera = new THREE.PerspectiveCamera( 10, window.innerWidth / window.innerHeight, 1, 80000 );
        camera.position.set( 0, 0, 3000 );

        plusxLogo = new THREE.Group();
        d33d_SVG.addGeoObject( plusxLogo, plusxLogo_SVGPaths );
        plusxLogo.scale.set( 2, 2, 2 );
        scene.add( plusxLogo );

        directionalLight = new THREE.DirectionalLight( 0xffffff, 0.2 );
        directionalLight.position.set( 0.75, 0.75, 1.0 ).normalize();
        scene.add( directionalLight );

        ambientLight = new THREE.AmbientLight( 0x000000, 0.2 );
        scene.add( ambientLight );

        particles = new Array();
        particleGroup = new THREE.Group();
        particleGroup.position.set( 0, -100, 0 );
        particleGroup.scale.set( 0.1, 0.1, 1 );

        var geometry = new THREE.SphereGeometry( 1, 20, 20 ),
            material = new THREE.MeshLambertMaterial( {color: 0xffffff} ),
            i = 0;

        for ( var ix = 0; ix < particleData.AMOUNTX; ix++ )
        {
			for ( var iy = 0; iy < particleData.AMOUNTY; iy++ )
            {
				particle = particles[ i++ ] = new THREE.Mesh( geometry, material );
				particle.position.x = ix * particleData.SEPARATION - (( particleData.AMOUNTX * particleData.SEPARATION ) / 2 );
				particle.position.z = iy * particleData.SEPARATION - (( particleData.AMOUNTY * particleData.SEPARATION ) / 2 );
                particleGroup.add( particle );
			}
		}

        scene.add( particleGroup );

        renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
        renderer.setClearColor( 0x000000, 0.6 ); // the default
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );
        renderer.gammaInput = true;
		renderer.gammaOutput = true;
        container.append( renderer.domElement );

        controls = new THREE.OrbitControls( camera, renderer.domElement );
        controls.enableDamping = true;
        controls.dampingFactor = 0.13;
        controls.maxPolarAngle = 2.5;
        controls.minPolarAngle = 0.5;
        controls.enabled = false;

        document.addEventListener( 'mousemove', onDocumentMouseMove, false );
		document.addEventListener( 'touchstart', onDocumentTouchStart, false );
		document.addEventListener( 'touchmove', onDocumentTouchMove, false );

        window.addEventListener( 'resize', onWindowResize, false );

        $.PX.ThreeRenderer = renderer;
        $.PX.ThreeOrbitControls = controls;
    }

    function onWindowResize()
    {
        windowHalfX = window.innerWidth / 2;
		windowHalfY = window.innerHeight / 2;

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
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

    function animate()
    {
        requestAnimationFrame( animate );
        render();
    }

    function render()
    {
        var i = 0;

        camera.lookAt( scene.position );

        for ( var ix = 0; ix < particleData.AMOUNTX; ix ++ )
        {
			for ( var iy = 0; iy < particleData.AMOUNTY; iy ++ )
            {
				particle = particles[ i++ ];
				particle.position.y = ( Math.sin( ( ix + particleCount ) * 0.3 ) * 50 ) +
					( Math.sin( ( iy + particleCount ) * 0.5 ) * 50 );
				particle.scale.x = particle.scale.y = ( Math.sin( ( ix + particleCount ) * 0.3 ) + 1 ) * 4 +
					( Math.sin( ( iy + particleCount ) * 0.5 ) + 1 ) * 4;
			}
		}

        renderer.render( scene, camera );
        controls.update();
        particleCount += 0.1;
    }
}
