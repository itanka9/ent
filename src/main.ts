import { load } from '@2gis/mapgl';
import './style.css'
import { restoreLocation } from './url-controller';
import { createButton, createSelect, createSeparator, updateButtons } from './ui';
import { ru } from './locale';
import { treeConfig } from './trees';

const locale: { [key: string]: string } = ru;

const baseUrl = location.origin + location.pathname;

const t = (k: string) => {
    return locale[k] ?? k;
};

const treeTypes = treeConfig.map(item => item.id);

const treeCodes = treeConfig.reduce<{ [key: string]: number}>((codes, item) => {
    codes[item.id] = item.syscode;
    return codes;
}, {})

let mode = 'tree';

load().then(mapgl => {
    const map = new mapgl.Map('map', {
        center: [55.31878, 25.23584],
        zoom: 13,
        key: '4970330e-7f1c-4921-808c-0eb7c4e63001',
        style: 'c080bb6a-8134-4993-93a1-5b4d8c36a59b',
        enableTrackResize: true
    });    

    restoreLocation(map);

    let trees: any[] = JSON.parse(localStorage.getItem('trees') ?? '[]');
    setupTrees(false);

    const dataSource = new mapgl.GeoJsonSource(map, {
        data: {
            type: 'FeatureCollection',
            features: trees
        }
    });

    map.on('click', function (ev) {
        if (mode === 'delete' && ev.targetData && ev.targetData.type === 'geojson') {
            const feature = ev.targetData.feature;
            if (!feature || !feature.properties) {
                return;
            }
            if (removeTree(feature.properties.id)) {
                reloadSource();
            }
        } else if (treeTypes.includes(mode)) {
            trees.push({
                type: 'Feature',
                properties: {
                    id: uid(),
                    syscode: treeCodes[mode],
                    type: mode
                },
                geometry: {
                    type: 'Point',
                    coordinates: ev.lngLat,
                },
            });
            reloadSource();    
        }
    });

    map.on('styleload', () => {
        const select = createSelect((newMode: string) => {
            mode = newMode;
            updateButtons(mode);
        });
    
        for (const treeType of treeTypes) {
            select.addOption(treeType, t(treeType));
           
            // @ts-ignore
            map.addModel(treeType, {
                url: `${baseUrl}/models/${treeType}.glb`
            });            		
            
            map.addLayer({
                id: 'tree-layer-' + treeType,
                filter: ['==', ['get', 'type'], treeType],
                type: 'model',
                style: {
                    scale: 0.67,
                    modelSrc: treeType,
                }
            });
        }

        createSeparator();

        createButton('delete', t('delete'), '', () => {
            mode = 'delete';
            updateButtons(mode);
        });

        createSeparator();

        createButton('', t('clearall'), '', () => {
            if (window.confirm(t('clearall_confirm'))) {
                trees.splice(0, trees.length);
                reloadSource();
            }
        });

        createSeparator();

        createButton('', t('download'), '', download);
        createButton('', t('load'), '', load);

        updateButtons(mode);
    });

    function reloadSource () {
        dataSource.setData({
            type: 'FeatureCollection',
            features: trees
        });
        localStorage.setItem('trees', JSON.stringify(trees));
    }

    function removeTree(id: number) {
        if (isNaN(id)) {
            return false;
        }
        let index = -1;
        for (let i = 0; i < trees.length; i++) {
            if (trees[i].properties.id === id) {
                index = i;
                break;
            }
        }
        if (index !== -1) {
            trees.splice(index, 1);
            return true;
        }
        return false;
    }

    function clearTrees() {
        trees.splice(0, trees.length);
    }

    function download () {
        var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
            type: 'FeatureCollection',
            features: trees
        }));
        var dlAnchorElem = document.createElement('a');
        dlAnchorElem.setAttribute("href", dataStr);
        dlAnchorElem.setAttribute("download", `trees.json`);
        dlAnchorElem.click();
    }

    function load () {
        const input = document.createElement('input');
        input.type = 'file';
        input.addEventListener('change', function () {
            const firstFile = this.files && this.files[0];
            const reader = new FileReader();
            reader.addEventListener('load', function (ev) {
                try {
                    const parsed = JSON.parse(String(ev.target && ev.target.result));
                    clearTrees();
                    for (const f of parsed.features) {
                        if (!f.properties.id) {
                            f.properties.id = uid();
                        }
                        trees.push(f);
                    }
                    setupTrees(true);
                    reloadSource();
                } catch (err) {
                    console.log(err)
                }
            })
            if (!firstFile) {
                return
            }
            reader.readAsText(firstFile);
        }, false);
        document.body.appendChild(input);
        input.click();
    }

    function setupTrees (fitBounds: boolean) {
        const bounds = {
            northEast: [-180, -90],
            southWest: [180, 90]
        }
        for (let i = 0; i < trees.length; i++) {
            const tree = trees[i];
            if (!tree) {
                continue
            }
            if (!tree.properties.id) {
                tree.properties.id = uid();
            }
            if (!tree.properties.syscode && tree.properties.type) {
                tree.properties.syscode = treeCodes[tree.properties.type];
            }
            const coordinates = tree?.geometry?.coordinates;
            if (!coordinates) {
                continue;
            }
            bounds.northEast[0] = Math.max(coordinates[0], bounds.northEast[0]);
            bounds.northEast[1] = Math.max(coordinates[1], bounds.northEast[1]);
            bounds.southWest[0] = Math.min(coordinates[0], bounds.southWest[0]);
            bounds.southWest[1] = Math.min(coordinates[1], bounds.southWest[1]);
        }

        if (fitBounds) {
            map.fitBounds(bounds);
            map.setPitch(30);   
        }
    }

    function uid () {
        return Math.trunc(Math.random() * 10 ** 9);
    }
});

