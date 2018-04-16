function initWebGLScene()
{
    // Shows a warning error message if no webgl support detected
    if ( !Detector.webgl ) Detector.addGetWebGLMessage();

    var container = $( '#container' ),

        // Scene elements
        scene, camera, renderer, controls,
        ambientLight, directionalLight,
        mainParticleWave, plusxLogo;

    init();
    animate();

    function init()
    {
        // Create the main scene
        scene = new THREE.Scene();

        // Set a camera with a deep field of view
        camera = new THREE.PerspectiveCamera( 10, window.innerWidth / window.innerHeight, 1, 80000 );
        camera.position.set( 0, 0, 3000 );

        // Set up some lights
        ambientLight = new THREE.AmbientLight( 0x000000, 0.2 );
        directionalLight = new THREE.DirectionalLight( 0xffffff, 0.2 );
        directionalLight.position.set( 0.75, 0.75, 1.0 ).normalize();

        plusxLogo = function()
        {
            var plusxLogo = new THREE.Group(),
                plusxLogo_SVGPaths =
                {
                    // +x Logo exported from Adobe Illustrator source artwork
                    paths: [
                        "M77.9,0h27.2l13,20.8L131.4,0h26.7l-26,37.6l27,38.8h-27.3l-14.7-20.8l-14.4,20.8H76.6l26.3-38.7L77.9,0z",
                        "M25.8,49.8v26.6h22.5V49.7H74V26.7H48.2V0H25.8v26.6H0v23.1L25.8,49.8z"
                    ],
                    amounts: [ 30, 30 ],
                    colors:  [ 0x00AEEF, 0x00EA00 ],
                    center:  { x: 80, y: 30 }
                },

                d33d_SVG = {};

            // This is an SVG renderer from D3-3D, used inline in this example:
            // https://threejs.org/examples/?q=geometry#webgl_geometry_extrude_shapes2
            // D3-3D: https://github.com/Niekes/d3-3d
            // It just slaps on functions onto the empty d33d_SVG object literal
            THREE.D33D_SVG( d33d_SVG );

            d33d_SVG.addGeoObject( plusxLogo, plusxLogo_SVGPaths );
            plusxLogo.scale.set( 2, 2, 2 );
            return plusxLogo;
        }

        particleWave = function()
        {
            var self = this,
                particles = [], particle, particleSpeed = 0,

                // Settings for the particle wave
                particleData = {
                    SEPARATION: 100,
                    AMOUNTX: 150,
                    AMOUNTY: 50
                },

                geometry = new THREE.SphereGeometry( 1, 6, 6 ),
                material = new THREE.MeshLambertMaterial( {color: 0xffffff} ),
                i = 0;

            this.particleGroup = new THREE.Group();

            init = function()
            {
                // Create all the particles and insert each into the particleGroup
                for ( var ix = 0; ix < particleData.AMOUNTX; ix++ )
                {
        			for ( var iy = 0; iy < particleData.AMOUNTY; iy++ )
                    {
                        // positions
                        x = ix * particleData.SEPARATION - (( particleData.AMOUNTX * particleData.SEPARATION ) / 2 );
                        y = 1
                        z = iy * particleData.SEPARATION - (( particleData.AMOUNTY * particleData.SEPARATION ) / 2 );

                        particle = particles[ i++ ] = new THREE.Mesh( geometry, material );
        				particle.position.x = x;
        				particle.position.z = z;

                        self.particleGroup.add( particle );
        			}
        		}

                self.particleGroup.position.set( 0, -100, 0 );
                self.particleGroup.scale.set( 0.1, 0.1, 1 );
            }

            this.animate = function()
            {
                var i = 0;

                // Creates the wave animation for the particles
                for ( var ix = 0; ix < particleData.AMOUNTX; ix ++ )
                {
        			for ( var iy = 0; iy < particleData.AMOUNTY; iy ++ )
                    {
                        // animate the y position + scale
                        y = ( Math.sin( ( ix + particleSpeed ) * 0.3 ) * 50 ) +
        					( Math.sin( ( iy + particleSpeed ) * 0.5 ) * 50 );
                        scale = ( Math.sin( ( ix + particleSpeed ) * 0.3 ) + 1 ) * 4 +
        					    ( Math.sin( ( iy + particleSpeed ) * 0.5 ) + 1 ) * 4;

        				particle = particles[ i++ ];
        				particle.position.y = y;
        				particle.scale.x = particle.scale.y = scale;
        			}
        		}

                // Controls the speed of the animation
                particleSpeed += 0.1;
            }

            init();
            return this;
        }

        mainParticleWave = new particleWave();

        // Add all our elements to the scene
        scene.add( plusxLogo() );
        scene.add( directionalLight );
        scene.add( ambientLight );
        scene.add( mainParticleWave.particleGroup );

        // Create our renderer
        renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
        renderer.setClearColor( 0x000000, 0.6 ); // Allows transparent background
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );
        renderer.gammaInput = true;
		renderer.gammaOutput = true;

        // Adds the webgl canvas element to the DOM
        container.append( renderer.domElement );

        // Set up the Orbit Controls allowing mouse interactivity
        controls = new THREE.OrbitControls( camera, renderer.domElement );
        controls.enableDamping = true;
        controls.dampingFactor = 0.13;
        controls.maxPolarAngle = 2.5;
        controls.minPolarAngle = 0.5;

        // Since we're connecting the controls to scroll x/y position,
        // with ScrollMagic, disable the orbit controls here
        controls.enabled = false;

        // Set up event listeners
        window.addEventListener( 'resize', onWindowResize, false );

        // Set global references for access in other scripts
        $.PX.ThreeRenderer = renderer;
        $.PX.ThreeOrbitControls = controls;
    }

    // Redraw / render
    function onWindowResize()
    {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
    }

    function animate()
    {
        requestAnimationFrame( animate );
        render();
    }

    function render()
    {
        mainParticleWave.animate();
        renderer.render( scene, camera );
        controls.update();
    }
}
