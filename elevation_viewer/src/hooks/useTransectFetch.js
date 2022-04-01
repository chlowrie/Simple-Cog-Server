import { useEffect, useState, useRef } from "react";
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax

export function useTransectFetch(map, mapLoaded, mapContainer) {

    const [startLngLat, setStartLngLat] = useState()
    const [endLngLat, setEndLngLat] = useState()

    useEffect(() => {
        // return
        if (!mapLoaded) return
        map.on('mousedown', mouseDown);
        let start, current, box;



        // Return the xy coordinates of the mouse position
        function mousePos(e) {
            const rect = mapContainer.current.getBoundingClientRect();
            return new mapboxgl.Point(
                e.clientX - rect.left - mapContainer.current.clientLeft,
                e.clientY - rect.top - mapContainer.current.clientTop
            );
        }

        function mouseDown(e) {
            console.log(e)
            if (!e.originalEvent.shiftKey) return;
            // Continue the rest of the function if the shiftkey is pressed.
            // if (!(e.shiftKey && e.button === 0)) return;

            // Disable default drag zooming when the shift key is held down.
            map.dragPan.disable();
            try {
                map.removeSource('transect')
            }
            catch (error) {
                console.log(error)
            }

            // Call functions for the following events
            // map.on('mousemove', onMouseMove);
            map.on('mouseup', onMouseUp);

            // Capture the first xy coordinates
            console.log(e)
            console.log(e.lngLat.lng)
            setStartLngLat(e.lngLat)
            console.log(
                startLngLat,
                endLngLat
            )
        }

        function onMouseUp(e) {
            // Capture the last xy coordinates
            console.log(e)
            setEndLngLat(e.lngLat)
            map.dragPan.enable();
            map.off('mouseup', onMouseUp);
        }

    }, [mapContainer, mapLoaded])

    useEffect(() => {
        console.log(
            startLngLat,
            endLngLat
        )
    }, [
        startLngLat,
        endLngLat
    ])


    return { startLngLat, endLngLat}
}