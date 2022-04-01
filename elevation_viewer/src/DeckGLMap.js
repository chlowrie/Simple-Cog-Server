import './App.css';

import React from 'react'
import { useState, useEffect, useRef } from 'react'
import mapboxgl from '!mapbox-gl' // eslint-disable-line import/no-webpack-loader-syntax

import DeckGL from '@deck.gl/react';
import { TerrainLayer } from '@deck.gl/geo-layers';

import { init_viewport } from './data/startup'


const MAPBOX_TOKEN = process.env.mapbox_token;

const BASE_TERRAIN_IMAGE = 'http://127.0.0.1:8000/get_rgb_tile/{z}/{x}/{y}.png';
const SURFACE_IMAGE = `https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}@2x.png?access_token=${MAPBOX_TOKEN}`;
const INITIAL_VIEW_STATE = {
  longitude: 0,
  latitude: 0,
  zoom: 2,
  pitch: 0,
  bearing: 0,
  maxPitch: 85
};


const SCALE = 0.01
const ELEVATION_DECODER = {
  rScaler: 65536 * SCALE,
  gScaler: 256 * SCALE,
  bScaler: 1 * SCALE,
  offset: -10000
};

export default function Map({
  texture = SURFACE_IMAGE,
  wireframe = false,
   initialViewState = INITIAL_VIEW_STATE
}) {
  const layer = new TerrainLayer({
    id: 'terrain',
    meshMaxError: 0.1,
    strategy: 'no-overlap',
    elevationDecoder: ELEVATION_DECODER,
    elevationData: BASE_TERRAIN_IMAGE,
    texture,
    wireframe,
    color: [255, 255, 255]
  });

  return <DeckGL
    initialViewState={initialViewState}
    controller={true}
    layers={[layer]} />;
}
