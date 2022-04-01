import './App.css';

import React from 'react'
import { useState, useEffect, useRef } from 'react'
// Maphooks
import { useMap } from 'maphooks/useMap'
import mapboxgl from '!mapbox-gl' // eslint-disable-line import/no-webpack-loader-syntax

import {useTransectFetch} from './hooks/useTransectFetch'
import LineGraph from './transectPane'


// import { init_viewport } from './data/startup'

const access_token = process.env.mapboxgl_token;

const BASE_TERRAIN_IMAGE = 'http://127.0.0.1:8000/get_rgb_tile/{z}/{x}/{y}.png';
// const BASE_TERRAIN_IMAGE = 'https://cloudbuild-n3ijarhbga-uw.a.run.app/get_rgb_tile/{z}/{x}/{y}.png';

const bounds = [[-122.5874905983023, 37.34327754514202], [-122.06865608342422, 37.72464131014436]]

const init_viewport = {
  "longitude": (bounds[0][0] + bounds[1][0]) / 2, 
  "latitude": (bounds[0][1] + bounds[1][1]) / 2, 
  "zoom": 15,
  "bearing": 0,
  "pitch": 0,
  "transitionDuration": 500
}

export default function Map() {

  const {
    map,
    mapContainer,
    mapLoaded,
    viewport,
    style,
    setStyle,
    setViewport,
    flyToViewport
} = useMap(
  init_viewport, 
  'mapbox://styles/mapbox/satellite-v9', 
  access_token
)

const {
  startLngLat,
  endLngLat
} = useTransectFetch(map, mapLoaded, mapContainer)

const [zList, setZList] = useState([])

  async function getZ({lng, lat}) {
    let z;
    z = await fetch(`http://127.0.0.1:8000/get_point_elevation/?long=${lng}&lat=${lat}`)
      .then(res => res.json())
    return z
  }

  async function getProfile(startLngLat, endLngLat) {
    let z;
    z = await fetch(`http://127.0.0.1:8000/get_profile_elevations/?startLng=${startLngLat.lng}&startLat=${startLngLat.lat}&endLng=${endLngLat.lng}&endLat=${endLngLat.lat}`)
      .then(res => res.json())
    return z
  }

  useEffect(() => {
    console.log(
      startLngLat,
      endLngLat
    )
    if (startLngLat && endLngLat) {
      const startZ = getProfile(startLngLat, endLngLat)
      console.log(startZ)
      Promise.all([startZ])
        .then((values) => setZList(values[0]))
      
    }
  }, [
    endLngLat]
  )

  useEffect(() => {
    if (!mapLoaded) return
    if (zList.length < 2) return
    console.log([[zList[0].long, zList[0].lat], [zList.at(-1).long, zList.at(-1).lat]])
    map.getSource('transect').setData({
      'type': 'Feature',
      'geometry': {
          'type': 'LineString',
          'coordinates': [[zList[0].long, zList[0].lat], [zList.at(-1).long, zList.at(-1).lat]]
      }
  })
  }, [zList, mapLoaded])

  useEffect(() => {
    // const map = map.current
    if (!map) return
    // map.on('style.load', () => {
    map.on('load', () => {
      map.addSource('custom-dem', {
        'type': 'raster-dem',
        'tiles': [BASE_TERRAIN_IMAGE],
        'tileSize': 256,
        'minzoom': 6,
        'maxzoom': 20
      });
      // add the DEM source as a terrain layer with exaggerated height
      map.setTerrain({ 'source': 'custom-dem', 'exaggeration': 5.0 });
      // const sun_pos = suncalc.getPosition(new Date(), viewport.longitude, viewport.latitude)
      map.addLayer({
        'id': 'sky',
        'type': 'sky',
        'paint': {
          'sky-type': 'atmosphere',
          'sky-atmosphere-sun': [260, 80],
          'sky-atmosphere-sun-intensity': 2,
          'sky-atmosphere-color': 'rgb(102, 162, 196)',
          'sky-atmosphere-halo-color': 'rgba(252, 195, 50, 0.5)'
        }
      });

      map.addSource('transect', {
        type: 'geojson',
        data: {
            'type': 'Feature',
            'geometry': {
                'type': 'LineString',
                'coordinates': []
            }
        }
      })
      map.addLayer({
          'id': 'transect',
          'type': 'line',
          'source': 'transect',
          'paint': {
            'line-color': 'yellow',
            'line-opacity': 0.75,
            'line-width': 5
          }
      })
      map.showTerrainWireframe = true

      // map.on('click', (e) => {
      //   onClick(e)
      // })
    })

  }, [map]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
  <>
    <div ref={mapContainer} className="map-container" />
    <LineGraph data={zList} />
  </>)
}