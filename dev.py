import rio_tiler
from rio_tiler.io import COGReader
from rio_tiler.profiles import img_profiles
from rio_tiler.utils import mapzen_elevation_rgb
import math
from fastapi.responses import Response
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import uvicorn

import numpy as np

app = FastAPI()
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# img = COGReader('SFBay_NOAA_SLR_DEM_Merged_5m_7_30_18_clip_COG.tif')

img = COGReader('San_Francisco_TopoBathy_Elevation_2m_COG.tiff')

def deg2num(lon_deg, lat_deg, zoom):
  lat_rad = math.radians(lat_deg)
  n = 2.0 ** zoom
  xtile = int((lon_deg + 180.0) / 360.0 * n)
  ytile = int((1.0 - math.asinh(math.tan(lat_rad)) / math.pi) / 2.0 * n)
  return (xtile, ytile)

def tile2long(x,z):
    return x/math.pow(2,z)*360-180

def tile2lat(y,z):
    n=math.pi-2*math.pi*y/math.pow(2,z)
    return 180/math.pi * math.atan(0.5*math.exp(n) - math.exp(-n))

def nodata_to_zero(data, nodata):
    return 1-(data==nodata)

def to_rgb(data):
    '''Converts greyscale to RGB for Mapbox Terrain consumption'''
    offset = 10000
    scale = 0.1
    nodata = img.nodata
    
    # Data Prep
    data = (data + offset) / scale
    data = data * nodata_to_zero(data, nodata)
    
    # RGB PNG band creation
    r = np.floor(data / math.pow(256,2)) % 256
    g = np.floor(data / 256) % 256
    b = np.floor(data) % 256
    return np.array([r,g,b]).astype('uint8')

def get_tile(x:int, y:int, z:int):
    return img.tile(x,y,z)

@app.get("/get_raw_tile/{z}/{x}/{y}.png")
def get_raw_tile(z:int, x:int, y:int):
    '''Returns a greyscale PNG elevation tile'''
    options = img_profiles.get('png')
    t = get_tile(x,y,z)
    buff = t.render(img_format='png', **options)
    return Response(content=buff, media_type="ïmage/png")

@app.get("/get_rgb_tile/{z}/{x}/{y}.png")
def get_rgb_tile(z:int, x:int, y:int):
    '''Returns a Mapbox-ready elevation tile'''
    options = img_profiles.get('png')
    print(options)
    fix_data = False
    try:
        t = get_tile(x,y,z)
    except rio_tiler.errors.TileOutsideBounds:
        t = get_tile(0,0,0)
        fix_data = True 
        
    if not fix_data:    
        t.data = to_rgb(t.data[0])
    else:
        t.data = np.zeros([1,256,256])
    # print(t.data)
    buff = t.render(img_format='png', **options)
    return Response(content=buff, media_type="ïmage/png")

@app.get('/get_point_elevation/')
def get_point_elevation(long: float , lat:float):
    z = img.point(long, lat)
    return {'long': long, 'lat': lat, 'z': z[0]}

@app.get('/get_profile_elevations/')
def get_profile_elevations(
        startLng: float, 
        startLat: float,
        endLng: float,
        endLat: float,
        n: float = 100
        ):
    print(startLng, endLng)
    lngPoints = np.linspace(startLng, endLng, n)
    latPoints = np.linspace(startLat, endLat, n )
    perc = np.linspace(0, 100, n)
    lngLats = np.stack([lngPoints, latPoints, perc], axis=1)
    z_s = [{
        **get_point_elevation(lngLat[0], lngLat[1]),
        **{'perc': lngLat[2]}
    } for lngLat in lngLats]
    return z_s
    
    


if __name__ == '__main__':
    uvicorn.run(app, host='127.0.0.1', port=8000)