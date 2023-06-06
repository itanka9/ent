import type { Map } from '@2gis/mapgl/types';

export function coarse (x: number) {
    const digits = 6;
    return Math.trunc(x * 10 ** digits) / 10 ** digits
}

export function saveLocation (map: Map) {
    const location = [...map.getCenter(), map.getZoom(), map.getRotation(), map.getPitch()];
    
    history.replaceState({}, document.title, `?p=${location.map(coarse)}`);
}
  
export function restoreLocation (map: Map) {
    const save = () => saveLocation(map);
    map.on('moveend', save);
    map.on('zoomend', save);
    map.on('pitchend', save);
    map.on('rotationend', save);
  
    const params: any = {};
    new URLSearchParams(location.search).forEach((value, key) => {
        params[key] = value
    });

    const p = (params.p || '').split(',').map(Number);
    if (isNaN(p[0])) {
        return;
    }

    map.setCenter([p[0], p[1]]);
    map.setZoom(p[2]);
    map.setRotation(p[3]);
    map.setPitch(p[4]);
}