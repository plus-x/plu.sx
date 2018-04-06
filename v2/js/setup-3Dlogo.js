function initLogo()
{
    function d3threeD( exports )
    {
        var DEGS_TO_RADS = Math.PI / 180, UNIT_SIZE = 100,
            DIGIT_0 = 48,
            DIGIT_9 = 57,
            COMMA = 44,
            SPACE = 32,
            PERIOD = 46,
            MINUS = 45;

        exports.transformSVGPath = function transformSVGPath( pathStr )
        {
            var path = new THREE.ShapePath(),
                idx = 1, len = pathStr.length, activeCmd,
                x = 0, y = 0, nx = 0, ny = 0, firstX = null, firstY = null,
                x1 = 0, x2 = 0, y1 = 0, y2 = 0,
                rx = 0, ry = 0, xar = 0, laf = 0, sf = 0, cx, cy;

            function eatNum()
            {
                var sidx, c, isFloat = false, s;

                // eat delims
                while ( idx < len )
                {
                    c = pathStr.charCodeAt( idx );
                    if ( c !== COMMA && c !== SPACE ) break;
                    idx ++;
                }

                if ( c === MINUS ) sidx = idx ++;
                else sidx = idx;

                // eat number
                while ( idx < len )
                {
                    c = pathStr.charCodeAt( idx );
                    if ( DIGIT_0 <= c && c <= DIGIT_9 ) {
                        idx ++;
                        continue;
                    } else if ( c === PERIOD ) {
                        idx ++;
                        isFloat = true;
                        continue;
                    }
                    s = pathStr.substring( sidx, idx );
                    return isFloat ? parseFloat( s ) : parseInt( s );
                }

                s = pathStr.substring( sidx );
                return isFloat ? parseFloat( s ) : parseInt( s );
            }

            function nextIsNum()
            {
                var c;
                // do permanently eat any delims...
                while ( idx < len ) {
                    c = pathStr.charCodeAt( idx );
                    if ( c !== COMMA && c !== SPACE ) break;
                    idx ++;
                }

                c = pathStr.charCodeAt( idx );

                return ( c === MINUS || ( DIGIT_0 <= c && c <= DIGIT_9 ) );
            }

            var canRepeat;

            activeCmd = pathStr[ 0 ];

            while ( idx <= len )
            {
                canRepeat = true;

                switch ( activeCmd )
                {
                    // moveto commands, become lineto's if repeated
                    case 'M':
                        x = eatNum();
                        y = eatNum();
                        path.moveTo( x, y );
                        activeCmd = 'L';
                        firstX = x;
                        firstY = y;
                        break;
                    case 'm':
                        x += eatNum();
                        y += eatNum();
                        path.moveTo( x, y );
                        activeCmd = 'l';
                        firstX = x;
                        firstY = y;
                        break;
                    case 'Z':
                    case 'z':
                        canRepeat = false;
                        if ( x !== firstX || y !== firstY ) path.lineTo( firstX, firstY );
                        break;
                    // - lines!
                    case 'L':
                    case 'H':
                    case 'V':
                        nx = ( activeCmd === 'V' ) ? x : eatNum();
                        ny = ( activeCmd === 'H' ) ? y : eatNum();
                        path.lineTo( nx, ny );
                        x = nx;
                        y = ny;
                        break;
                    case 'l':
                    case 'h':
                    case 'v':
                        nx = ( activeCmd === 'v' ) ? x : ( x + eatNum() );
                        ny = ( activeCmd === 'h' ) ? y : ( y + eatNum() );
                        path.lineTo( nx, ny );
                        x = nx;
                        y = ny;
                        break;
                    // - cubic bezier
                    case 'C':
                        x1 = eatNum(); y1 = eatNum();
                    case 'S':
                        if ( activeCmd === 'S' ) {
                            x1 = 2 * x - x2;
                            y1 = 2 * y - y2;
                        }
                        x2 = eatNum();
                        y2 = eatNum();
                        nx = eatNum();
                        ny = eatNum();
                        path.bezierCurveTo( x1, y1, x2, y2, nx, ny );
                        x = nx; y = ny;
                        break;
                    case 'c':
                        x1 = x + eatNum();
                        y1 = y + eatNum();
                    case 's':
                        if ( activeCmd === 's' ) {
                            x1 = 2 * x - x2;
                            y1 = 2 * y - y2;
                        }
                        x2 = x + eatNum();
                        y2 = y + eatNum();
                        nx = x + eatNum();
                        ny = y + eatNum();
                        path.bezierCurveTo( x1, y1, x2, y2, nx, ny );
                        x = nx; y = ny;
                        break;
                    // - quadratic bezier
                    case 'Q':
                        x1 = eatNum(); y1 = eatNum();
                    case 'T':
                        if ( activeCmd === 'T' ) {
                            x1 = 2 * x - x1;
                            y1 = 2 * y - y1;
                        }
                        nx = eatNum();
                        ny = eatNum();
                        path.quadraticCurveTo( x1, y1, nx, ny );
                        x = nx;
                        y = ny;
                        break;
                    case 'q':
                        x1 = x + eatNum();
                        y1 = y + eatNum();
                    case 't':
                        if ( activeCmd === 't' ) {
                            x1 = 2 * x - x1;
                            y1 = 2 * y - y1;
                        }
                        nx = x + eatNum();
                        ny = y + eatNum();
                        path.quadraticCurveTo( x1, y1, nx, ny );
                        x = nx; y = ny;
                        break;
                    // - elliptical arc
                    case 'A':
                        rx = eatNum();
                        ry = eatNum();
                        xar = eatNum() * DEGS_TO_RADS;
                        laf = eatNum();
                        sf = eatNum();
                        nx = eatNum();
                        ny = eatNum();
                        if ( rx !== ry ) console.warn( 'Forcing elliptical arc to be a circular one:', rx, ry );
                        // SVG implementation notes does all the math for us! woo!
                        // http://www.w3.org/TR/SVG/implnote.html#ArcImplementationNotes
                        // step1, using x1 as x1'
                        x1 = Math.cos( xar ) * ( x - nx ) / 2 + Math.sin( xar ) * ( y - ny ) / 2;
                        y1 = - Math.sin( xar ) * ( x - nx ) / 2 + Math.cos( xar ) * ( y - ny ) / 2;
                        // step 2, using x2 as cx'
                        var norm = Math.sqrt( ( rx * rx * ry * ry - rx * rx * y1 * y1 - ry * ry * x1 * x1 ) /
                             ( rx * rx * y1 * y1 + ry * ry * x1 * x1 ) );
                        if ( laf === sf ) norm = - norm;
                        x2 = norm * rx * y1 / ry;
                        y2 = norm * -ry * x1 / rx;
                        // step 3
                        cx = Math.cos( xar ) * x2 - Math.sin( xar ) * y2 + ( x + nx ) / 2;
                        cy = Math.sin( xar ) * x2 + Math.cos( xar ) * y2 + ( y + ny ) / 2;
                        var u = new THREE.Vector2( 1, 0 );
                        var v = new THREE.Vector2( ( x1 - x2 ) / rx, ( y1 - y2 ) / ry );
                        var startAng = Math.acos( u.dot( v ) / u.length() / v.length() );
                        if ( ( ( u.x * v.y ) - ( u.y * v.x ) ) < 0 ) startAng = - startAng;
                        // we can reuse 'v' from start angle as our 'u' for delta angle
                        u.x = ( - x1 - x2 ) / rx;
                        u.y = ( - y1 - y2 ) / ry;
                        var deltaAng = Math.acos( v.dot( u ) / v.length() / u.length() );
                        // This normalization ends up making our curves fail to triangulate...
                        if ( ( ( v.x * u.y ) - ( v.y * u.x ) ) < 0 ) deltaAng = - deltaAng;
                        if ( ! sf && deltaAng > 0 ) deltaAng -= Math.PI * 2;
                        if ( sf && deltaAng < 0 ) deltaAng += Math.PI * 2;
                        path.absarc( cx, cy, rx, startAng, startAng + deltaAng, sf );
                        x = nx;
                        y = ny;
                        break;
                    default:
                        throw new Error( 'Wrong path command: ' + activeCmd );
                }

                // just reissue the command
                if ( canRepeat && nextIsNum() ) continue;

                activeCmd = pathStr[ idx ++ ];
            }

            return path;
        };
    }

    var $d3g = {};
    d3threeD( $d3g );

    /// Part from g0v/twgeojson
    /// Graphic Engine and Geo Data Init Functions
    var addGeoObject = function( group, svgObject )
    {
        var paths = svgObject.paths,
            amounts = svgObject.amounts,
            colors = svgObject.colors,
            center = svgObject.center;

        for ( var i = 0; i < paths.length; i ++ )
        {
            var path = $d3g.transformSVGPath( paths[ i ] ),
                color = new THREE.Color( colors[ i ] ),
                material = new THREE.MeshLambertMaterial( {
                    color: color,
                    emissive: color
                }),
                amount = amounts[ i ],
                simpleShapes = path.toShapes( true );

            for ( var j = 0; j < simpleShapes.length; j ++ )
            {
                var simpleShape = simpleShapes[ j ],
                    shape3d = new THREE.ExtrudeBufferGeometry( simpleShape, {
                        amount: amount,
                        bevelEnabled: false
                    }),
                    mesh = new THREE.Mesh( shape3d, material );

                mesh.rotation.x = Math.PI;
                mesh.translateZ( - amount - 1 );
                mesh.translateX( - center.x );
                mesh.translateY( - center.y );

                group.add( mesh );
            }
        }
    };

    var renderer, stats, scene, camera;

    init();
    animate();

    function init()
    {
        var container = document.getElementById( 'container' );

        scene = new THREE.Scene();
        //scene.background = new THREE.Color( 0x000000 );

        camera = new THREE.PerspectiveCamera( 10, window.innerWidth / window.innerHeight, 1, 80000 );
        camera.position.set( 0, 0, 1900 );

        var group = new THREE.Group();
        scene.add( group );

        var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.2 );
        directionalLight.position.set( 0.75, 0.75, 1.0 ).normalize();
        scene.add( directionalLight );

        var ambientLight = new THREE.AmbientLight( 0x000000, 0.2 );
        scene.add( ambientLight );

        //var helper = new THREE.GridHelper( 160, 10 );
        //helper.rotation.x = Math.PI / 2;
        //group.add( helper );

        var obj = initSVGObject();
        addGeoObject( group, obj );

        renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
        renderer.setClearColor( 0x000000, 0.7 ); // the default
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );
        container.appendChild( renderer.domElement );

        var controls = new THREE.OrbitControls( camera, renderer.domElement );

        window.addEventListener( 'resize', onWindowResize, false );
        window.addEventListener( 'orientationchange', onWindowResize, false );

        pxxx = renderer;
    }

    function initSVGObject()
    {
        var obj = {};

        // The geo data from Taipei City, Keelung City, Taipei County in SVG form
        obj.paths =
        [
            // +x Logo
            "M77.9,0h27.2l13,20.8L131.4,0h26.7l-26,37.6l27,38.8h-27.3l-14.7-20.8l-14.4,20.8H76.6l26.3-38.7L77.9,0z",
            "M25.8,49.8v26.6h22.5V49.7H74V26.7H48.2V0H25.8v26.6H0v23.1L25.8,49.8z"
        ];

        obj.amounts = [ 30, 30 ];
        obj.colors =  [ 0x00EA00, 0x00AEEF ];
        obj.center = { x: 80, y: 30 };

        return obj;
    }

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
        //stats.update();
    }

    function render()
    {
        renderer.render( scene, camera );
    }
}
