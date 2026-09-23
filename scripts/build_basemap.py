import json, math
def rnd(c, n=4):
    if isinstance(c[0], (int,float)): return [round(c[0],n), round(c[1],n)]
    return [rnd(x,n) for x in c]

def dedupe(ring):
    out=[ring[0]]
    for p in ring[1:]:
        if p!=out[-1]: out.append(p)
    return out

def clean(geom):
    if geom['type']=='Polygon':
        rings=[dedupe(r) for r in rnd(geom['coordinates'])]
        rings=[r for r in rings if len(r)>=4]
        return {'type':'Polygon','coordinates':rings}
    polys=[]
    for poly in rnd(geom['coordinates']):
        rings=[dedupe(r) for r in poly]
        rings=[r for r in rings if len(r)>=4]
        if rings: polys.append(rings)
    return {'type':'MultiPolygon','coordinates':polys}

def ring_centroid(r):
    a=cx=cy=0.0
    for (x0,y0),(x1,y1) in zip(r[:-1], r[1:]):
        cr=x0*y1-x1*y0; a+=cr; cx+=(x0+x1)*cr; cy+=(y0+y1)*cr
    if abs(a)<1e-12: return r[0]
    a*=0.5; return [cx/(6*a), cy/(6*a)], abs(a)

def centroid(geom):
    polys=[geom['coordinates']] if geom['type']=='Polygon' else geom['coordinates']
    best=None
    for poly in polys:
        c=ring_centroid(poly[0])
        if isinstance(c, tuple):
            if best is None or c[1]>best[1]: best=c
    return [round(best[0][1],4), round(best[0][0],4)]  # lat,lng

def load(f, keep=None):
    d=json.load(open(f))
    feats=[]
    for ft in d['features']:
        p=ft['properties']
        if keep and not keep(p['code']): continue
        g=clean(ft['geometry'])
        feats.append({'type':'Feature','properties':{'n':p['name_eng'],'k':p['name'],'c':centroid(g)},'geometry':g})
    return {'type':'FeatureCollection','features':feats}

# Cities the app pre-loads: Daegu(22), Seoul(11), Busan(21), Incheon(23), Jeju(39), Gyeongju(37020)
detail=lambda c: c[:2] in ('22','11','21','23','39') or c.startswith('37020')
out={
 'provinces': load('skorea_provinces_geo_simple.json'),
 'municipalities': load('skorea_municipalities_geo_simple.json'),
 'districts': load('skorea_submunicipalities_geo_simple.json', detail),
}
s=json.dumps(out, separators=(',',':'), ensure_ascii=False)
open('offlineBasemap.json','w',encoding='utf-8').write(s)
print({k:len(v['features']) for k,v in out.items()}, len(s)//1024,'KB')
