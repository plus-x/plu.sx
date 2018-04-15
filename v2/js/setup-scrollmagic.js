function initScrollMagic()
{
    var controller = new ScrollMagic.Controller(),

        scene = new ScrollMagic.Scene(
        {
            triggerElement: 'body',
            triggerHook: 'onLeave',
            duration: '100%'
        })
        .setPin( 'body' )
        .addTo( controller ),

        prevScrollPos = 0,
        prevTouchY = 0,
        curTouchY = 0,
        touchDirection = 1,
        el = $( '#container' );

    if ( $.PX.isMobile )
    {
        $( document ).bind( 'touchstart', function ( e )
        {
            prevTouchY = e.originalEvent.touches[0].clientY;

            var top = el.scrollTop,
                totalScroll = el.scrollHeight,
                currentScroll = top + el.offsetHeight;

                // If we're at the top or the bottom of the containers
                // scroll, push up or down one pixel.
                // This prevents the scroll from "passing through" to the body.
                if ( top === 0 ) el.scrollTop = 1;
                else if ( currentScroll === totalScroll ) el[0].scrollTop = top - 1;
        });

        $( document ).bind( 'touchmove', function ( e )
        {
           curTouchY = e.originalEvent.changedTouches[0].clientY;

           if ( prevTouchY > curTouchY + 5 ) touchDirection = 1;
           else if ( prevTouchY < curTouchY - 5 ) touchDirection = -1;

           if ( el[0].offsetHeight < el[0].scrollHeight ) e._isScroller = true;
        });

        $( 'body' ).bind( 'touchmove', function( e )
        {
            //In this case, the default behavior is scrolling the body, which
            //would result in an overflow.  Since we don't want that, we preventDefault.
            //if( !e._isScroller ) e.preventDefault();
        });
    }

    scene.on( 'update', function( event )
    {
        var controls = $.PX.ThreeOrbitControls,
            curScrollPos,
            direction;

        if ( $.PX.isMobile )
        {
            curScrollPos = curTouchY;
            direction = touchDirection;
        }
        else
        {
            curScrollPos = event.scrollPos;
            direction = prevScrollPos < curScrollPos ? 1 : -1;

            // Save the current scroll position to prevScrollPos for comparison on next iteration
            prevScrollPos = curScrollPos;
        }

        if ( controls )
        {
            controls.rotateStart.set( 0, curScrollPos );
            controls.rotateEnd.set( 0, curScrollPos - direction/10 );
            controls.rotateDelta.subVectors( controls.rotateEnd, controls.rotateStart ).multiplyScalar( controls.rotateSpeed );

            var element = controls.domElement === document ? controls.domElement.body : controls.domElement;

            // Rotates horizontally
            //controls.sphericalDelta.theta -= ( 2 * Math.PI * controls.rotateDelta.x / element.clientWidth );

            // Rotates vertically
            controls.sphericalDelta.phi -= ( 2 * Math.PI * controls.rotateDelta.y / element.clientHeight );

            controls.rotateStart.copy( controls.rotateEnd );
            controls.update();
        }
    });
}
