// Offline vector basemap for South Korea.
// Bundled with the app (src/data/offlineBasemap.json) so the map shows coastlines, province / city /
// district borders and place names with NO internet. It sits *underneath* the online map tiles: when
// tiles are available they cover it, when they are not (offline) it shows through.
// Boundary data: Statistics Korea (KOSTAT 2013) via github.com/southkorea/southkorea-maps.
import L from 'leaflet';

const PANE = 'offlineBase';

interface BasemapProps {
  n: string; // English name
  k: string; // Korean name
  c: [number, number]; // label point [lat, lng]
}

export async function addOfflineBasemap(map: L.Map): Promise<void> {
  const data = (await import('../data/offlineBasemap.json')).default as any;

  if (!map.getPane(PANE)) {
    const pane = map.createPane(PANE);
    pane.style.zIndex = '150'; // below the tile pane (200)
    pane.style.pointerEvents = 'none';
  }

  const mk = (fc: any, cls: string) =>
    L.geoJSON(fc, {
      pane: PANE,
      interactive: false,
      style: () => ({ className: cls, fill: cls === 'ob-land', smoothFactor: 1 }),
    });

  const land = mk(data.provinces, 'ob-land').addTo(map);
  const munis = mk(data.municipalities, 'ob-muni');
  const districts = mk(data.districts, 'ob-dist');
  const labels = L.layerGroup().addTo(map);

  const labelMarker = (p: BasemapProps, cls: string) =>
    L.marker(p.c, {
      pane: PANE,
      interactive: false,
      keyboard: false,
      icon: L.divIcon({
        className: `ob-label ${cls}`,
        html: `<span class="ob-en">${p.n.replace(/</g, '')}</span><span class="ob-ko">${p.k}</span>`,
        iconSize: [0, 0],
      }),
    });

  const refresh = () => {
    const z = map.getZoom();
    const bounds = map.getBounds().pad(0.1);

    if (z >= 9) { if (!map.hasLayer(munis)) munis.addTo(map); } else if (map.hasLayer(munis)) map.removeLayer(munis);
    if (z >= 12) { if (!map.hasLayer(districts)) districts.addTo(map); } else if (map.hasLayer(districts)) map.removeLayer(districts);
    land.bringToBack();

    labels.clearLayers();
    let src: any;
    let cls: string;
    if (z <= 8) { src = data.provinces; cls = 'ob-l-prov'; }
    else if (z <= 11) { src = data.municipalities; cls = 'ob-l-muni'; }
    else { src = data.districts; cls = 'ob-l-dist'; }

    let count = 0;
    for (const f of src.features) {
      const p = f.properties as BasemapProps;
      if (!bounds.contains(p.c)) continue;
      labelMarker(p, cls).addTo(labels);
      if (++count > 60) break;
    }

    // Outside the pre-loaded cities there is no district detail: fall back to city labels
    if (z >= 12 && count === 0) {
      for (const f of data.municipalities.features) {
        const p = f.properties as BasemapProps;
        if (!bounds.contains(p.c)) continue;
        labelMarker(p, 'ob-l-muni').addTo(labels);
        if (++count > 30) break;
      }
    }
  };

  map.on('moveend zoomend', refresh);
  refresh();
}
