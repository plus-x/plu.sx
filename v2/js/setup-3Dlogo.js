function initLogo()
{
    if ( !Detector.webgl ) Detector.addGetWebGLMessage();

    var SVG_Obj =
        {
            paths:
            [
                // +x Logo
                "M77.9,0h27.2l13,20.8L131.4,0h26.7l-26,37.6l27,38.8h-27.3l-14.7-20.8l-14.4,20.8H76.6l26.3-38.7L77.9,0z",
                "M25.8,49.8v26.6h22.5V49.7H74V26.7H48.2V0H25.8v26.6H0v23.1L25.8,49.8z"
            ],
            amounts: [ 30, 30 ],
            colors:  [ 0x00AEEF, 0x00EA00 ],
            center:  { x: 80, y: 30 }
        },

        d33d_SVG = {},

        container = document.getElementById( 'container' ),

        scene, camera, renderer, controls,
        particleLight, ambientLight, directionalLight, group,

        SEPARATION = 100, AMOUNTX = 50, AMOUNTY = 50,
        particles, particle, count = 0,

        mouseX = 0, mouseY = 0,
        windowHalfX = window.innerWidth / 2,
		windowHalfY = window.innerHeight / 2,

        reflectionCube = new THREE.CubeTextureLoader()
        .setPath( 'js/vendor/three.js/textures/cube/SwedishRoyalCastle/' )
        .load( [ 'px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg' ] ),

        PI2 = Math.PI * 2,

        scMaterial = new THREE.SpriteCanvasMaterial({
            color: 0xffffff,
            program: function ( context )
            {
                context.beginPath();
                context.arc( 0, 0, 0.5, 0, PI2, true );
                context.fill();
            }
        }),

        i = 0;

    init();
    animate();

    function init()
    {
        // This is an SVG renderer from D3-3D, used inline in this example:
        // https://threejs.org/examples/?q=geometry#webgl_geometry_extrude_shapes2
        // D3-3D: https://github.com/Niekes/d3-3d
        THREE.D33D_SVG( d33d_SVG );

		reflectionCube.format = THREE.RGBFormat;

        scene = new THREE.Scene();

        scene.background = reflectionCube;

        camera = new THREE.PerspectiveCamera( 10, window.innerWidth / window.innerHeight, 1, 80000 );
        camera.position.set( 0, 0, 1900 );

        group = new THREE.Group();
        d33d_SVG.addGeoObject( group, SVG_Obj );
        scene.add( group );

        directionalLight = new THREE.DirectionalLight( 0xffffff, 0.2 );
        directionalLight.position.set( 0.75, 0.75, 1.0 ).normalize();
        scene.add( directionalLight );

        ambientLight = new THREE.AmbientLight( 0x000000, 0.2 );
        scene.add( ambientLight );

        particleLight = new THREE.Mesh( new THREE.SphereBufferGeometry( 4, 8, 8 ), new THREE.MeshBasicMaterial( { color: 0xffffff } ) );
		scene.add( particleLight );

		var pointLight = new THREE.PointLight( 0xffffff, 2, 800 );
		particleLight.add( pointLight );

        //var helper = new THREE.GridHelper( 160, 10 );
        //helper.rotation.x = Math.PI / 2;
        //group.add( helper );

        particles = new Array();

        var geometry = new THREE.SphereGeometry( 5, 32, 32 );
        var material = new THREE.MeshPhongMaterial( {color: 0x333333} );

        for ( var ix = 0; ix < AMOUNTX; ix ++ )
        {
			for ( var iy = 0; iy < AMOUNTY; iy ++ )
            {
				particle = particles[ i ++ ] = new THREE.Mesh( geometry, material );
				particle.position.x = ix * SEPARATION - ( ( AMOUNTX * SEPARATION ) / 2 );
				particle.position.z = iy * SEPARATION - ( ( AMOUNTY * SEPARATION ) / 2 );
				scene.add( particle );
			}
		}

        renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
        renderer.setClearColor( 0x000000, 0.6 ); // the default
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );
        renderer.gammaInput = true;
		renderer.gammaOutput = true;
        container.appendChild( renderer.domElement );

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
        var timer = Date.now() * 0.00025,
            i = 0;

		camera.lookAt( scene.position );

		particleLight.position.x = Math.sin( timer * 7 ) * 300;
		particleLight.position.y = Math.cos( timer * 5 ) * 400;
		particleLight.position.z = Math.cos( timer * 3 ) * 300;

        for ( var ix = 0; ix < AMOUNTX; ix ++ )
        {
			for ( var iy = 0; iy < AMOUNTY; iy ++ )
            {
				particle = particles[ i++ ];
				particle.position.y = ( Math.sin( ( ix + count ) * 0.3 ) * 50 ) +
					( Math.sin( ( iy + count ) * 0.5 ) * 50 );
				particle.scale.x = particle.scale.y = ( Math.sin( ( ix + count ) * 0.3 ) + 1 ) * 4 +
					( Math.sin( ( iy + count ) * 0.5 ) + 1 ) * 4;
			}
		}

        renderer.render( scene, camera );
        controls.update();

        count += 0.1;
    }
}
