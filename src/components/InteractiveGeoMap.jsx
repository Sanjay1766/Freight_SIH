import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Globe, CloudRain, Ship, ArrowRight, Anchor, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';
import { EAST_COAST_PORT_MATRIX, ORIGIN_PORTS_MATRIX, CANDIDATE_VESSELS, getNauticalDistance } from '../services/optimizerEngine';

export default function InteractiveGeoMap({ selectedPortKey, onPortChange, selectedOriginKey, onOriginChange }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  const [mapTheme, setMapTheme] = useState('dark');
  const [showMonsoonOverlay, setShowMonsoonOverlay] = useState(true);
  const [showVessels, setShowVessels] = useState(true);

  // Real GPS Coordinates [lat, lng]
  const portGeoCoords = useMemo(() => ({
    // Indian East Coast Destination Ports
    Paradip: { lat: 20.2644, lng: 86.6706, name: 'Paradip Port', state: 'Odisha', type: 'dest' },
    Vizag: { lat: 17.6868, lng: 83.2185, name: 'Visakhapatnam Port', state: 'Andhra Pradesh', type: 'dest' },
    Gangavaram: { lat: 17.6186, lng: 83.2384, name: 'Gangavaram Port', state: 'Andhra Pradesh', type: 'dest' },
    Gopalpur: { lat: 19.2625, lng: 84.9083, name: 'Gopalpur Port', state: 'Odisha', type: 'dest' },
    Dhamra: { lat: 20.8175, lng: 86.9608, name: 'Dhamra Port', state: 'Odisha', type: 'dest' },
    SagarSandheads: { lat: 21.0500, lng: 88.0500, name: 'Sagar - Sandheads', state: 'West Bengal', type: 'dest' },
    Haldia: { lat: 22.0238, lng: 88.0673, name: 'Haldia Dock Complex', state: 'West Bengal', type: 'dest' },

    // Global Origin Loading Terminals
    Australia_Newcastle: { lat: -32.9267, lng: 151.7817, name: 'Port of Newcastle', country: 'Australia', type: 'origin' },
    Australia_HayPoint: { lat: -21.2833, lng: 149.3000, name: 'Hay Point (DBCT)', country: 'Australia', type: 'origin' },
    Indonesia_Samarinda: { lat: -0.5021, lng: 117.1537, name: 'Samarinda Anchorage', country: 'Indonesia', type: 'origin' },
    Indonesia_Taboneo: { lat: -3.7333, lng: 114.4833, name: 'Taboneo Anchorage', country: 'Indonesia', type: 'origin' },
    US_Norfolk: { lat: 36.8508, lng: -76.2859, name: 'Norfolk Hampton Roads', country: 'USA', type: 'origin' },
    Mozambique_Maputo: { lat: -25.9692, lng: 32.5732, name: 'Port of Maputo', country: 'Mozambique', type: 'origin' },
    Mozambique_Nacala: { lat: -14.5428, lng: 40.6728, name: 'Port of Nacala', country: 'Mozambique', type: 'origin' },
    Russia_Taman: { lat: 45.1306, lng: 36.7167, name: 'Port of Taman', country: 'Russia', type: 'origin' },
    Russia_UstLuga: { lat: 59.6583, lng: 28.3278, name: 'Port of Ust-Luga', country: 'Russia', type: 'origin' }
  }), []);

  const chokepoints = useMemo(() => [
    { lat: 2.5000, lng: 101.5000, name: 'Malacca Strait' },
    { lat: -5.9000, lng: 105.8000, name: 'Sunda Strait' },
    { lat: -8.5000, lng: 115.7500, name: 'Lombok Strait' },
    { lat: 27.8000, lng: 34.0000, name: 'Suez Canal / Red Sea' },
    { lat: 12.5800, lng: 43.3300, name: 'Bab-el-Mandeb' },
    { lat: -34.8000, lng: 20.0000, name: 'Cape of Good Hope' }
  ], []);

  const activeOriginKey = selectedOriginKey || 'Indonesia_Samarinda';
  const activeDest = portGeoCoords[selectedPortKey] || portGeoCoords.Dhamra;
  const activeOrigin = portGeoCoords[activeOriginKey] || portGeoCoords.Indonesia_Samarinda;
  const activeOriginSpec = ORIGIN_PORTS_MATRIX[activeOriginKey] || ORIGIN_PORTS_MATRIX.Indonesia_Samarinda;
  const activeDestSpec = EAST_COAST_PORT_MATRIX[selectedPortKey] || EAST_COAST_PORT_MATRIX.Dhamra;
  const nauticalDistance = getNauticalDistance(activeOriginSpec.key, activeDestSpec.key);

  // Initialize and Render Map
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    // Safely remove prior leaflet instance and clear container _leaflet_id
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove();
      } catch {
        // ignore cleanup error
      }
      mapInstanceRef.current = null;
    }

    if (container._leaflet_id) {
      container._leaflet_id = null;
    }

    try {
      let tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      let attribution = '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

      if (mapTheme === 'ocean') {
        tileUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
      } else if (mapTheme === 'satellite') {
        tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
        attribution = 'Tiles &copy; Esri';
      }

      const map = L.map(container, {
        center: [16.0, 86.0],
        zoom: 4,
        minZoom: 2,
        maxZoom: 16,
        zoomControl: false
      });

      L.tileLayer(tileUrl, {
        attribution,
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);

      const layerGroup = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;

      // 1. Draw Monsoon Swell Polygon
      if (showMonsoonOverlay) {
        const monsoonCoordinates = [
          [22.5, 87.0],
          [21.5, 91.5],
          [15.0, 93.0],
          [10.0, 88.0],
          [12.0, 81.0],
          [18.0, 83.5]
        ];

        L.polygon(monsoonCoordinates, {
          color: '#0284C7',
          fillColor: '#0284C7',
          fillOpacity: 0.18,
          weight: 1.5,
          dashArray: '4, 4'
        }).bindTooltip('<strong>Bay of Bengal SW Monsoon Swell Zone</strong><br/>Average swell height: 2.8m - 4.2m', {
          permanent: false,
          direction: 'center',
          className: 'custom-monsoon-tooltip'
        }).addTo(layerGroup);
      }

      // 2. Draw Active Sea Route Polyline
      const getRouteWaypoints = (originKey, destCoords) => {
        const o = portGeoCoords[originKey];
        if (!o) return [[0, 0], [destCoords.lat, destCoords.lng]];

        if (originKey.startsWith('Indonesia')) {
          return [
            [o.lat, o.lng],
            [-4.5000, 106.8000],
            [-5.9000, 105.8000],
            [-2.0000, 95.0000],
            [6.0000, 90.0000],
            [14.0000, 87.0000],
            [destCoords.lat, destCoords.lng]
          ];
        }

        if (originKey.startsWith('Australia')) {
          return [
            [o.lat, o.lng],
            [-10.0000, 130.0000],
            [-8.5000, 115.7500],
            [-2.0000, 95.0000],
            [6.0000, 88.0000],
            [15.0000, 86.0000],
            [destCoords.lat, destCoords.lng]
          ];
        }

        if (originKey.startsWith('Mozambique')) {
          return [
            [o.lat, o.lng],
            [-10.0000, 50.0000],
            [2.0000, 68.0000],
            [5.8000, 80.5000],
            [14.0000, 85.0000],
            [destCoords.lat, destCoords.lng]
          ];
        }

        if (originKey.startsWith('Russia') || originKey.startsWith('US')) {
          return [
            [o.lat, o.lng],
            [32.0000, 32.5000],
            [27.8000, 34.0000],
            [12.5800, 43.3300],
            [12.0000, 55.0000],
            [9.0000, 75.0000],
            [6.0000, 81.0000],
            [15.0000, 86.0000],
            [destCoords.lat, destCoords.lng]
          ];
        }

        return [[o.lat, o.lng], [destCoords.lat, destCoords.lng]];
      };

      const routeCoords = getRouteWaypoints(activeOriginKey, activeDest);
      L.polyline(routeCoords, {
        color: '#FF3B00',
        weight: 3.5,
        opacity: 0.9,
        dashArray: '8, 6',
        lineCap: 'round'
      }).addTo(layerGroup);

      // 3. Add Destination Ports Pins (Indian East Coast)
      Object.entries(EAST_COAST_PORT_MATRIX).forEach(([key, port]) => {
        const geo = portGeoCoords[key];
        if (!geo) return;
        const isSelected = selectedPortKey === key;

        const markerHtml = `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer;">
            ${isSelected ? '<div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background: rgba(255, 59, 0, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>' : ''}
            <div style="width: ${isSelected ? '22px' : '16px'}; height: ${isSelected ? '22px' : '16px'}; border-radius: 50%; background: #FF3B00; border: 2.5px solid #FFFFFF; box-shadow: 0 0 12px rgba(255, 59, 0, 0.8); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 10px;">
            </div>
            <span style="position: absolute; left: 24px; top: -3px; white-space: nowrap; font-family: sans-serif; font-weight: 800; font-size: ${isSelected ? '12px' : '11px'}; color: ${isSelected ? '#FF3B00' : '#FFFFFF'}; background: rgba(15, 23, 42, 0.85); padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(255, 59, 0, 0.5); text-shadow: 0 1px 3px rgba(0,0,0,0.8);">
              ${key}
            </span>
          </div>
        `;

        const customIcon = L.divIcon({
          className: 'custom-port-marker',
          html: markerHtml,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const marker = L.marker([geo.lat, geo.lng], { icon: customIcon }).addTo(layerGroup);

        const popupContent = `
          <div style="font-family: sans-serif; min-width: 200px; color: #0F172A; padding: 2px;">
            <div style="font-weight: 800; font-size: 14px; color: #FF3B00; border-bottom: 2px solid #E2E8F0; padding-bottom: 4px; margin-bottom: 6px;">
              ${port.name}
            </div>
            <div style="font-size: 11px; margin-bottom: 3px;"><strong>Max Draft:</strong> ${port.maxDraft} m</div>
            <div style="font-size: 11px; margin-bottom: 3px;"><strong>Max LOA:</strong> ${port.maxLOA} m • <strong>Beam:</strong> ${port.maxBeam} m</div>
            <div style="font-size: 11px; margin-bottom: 3px;"><strong>Discharge Rate:</strong> ${(port.dailyDischargeRate / 1000).toFixed(0)}k MT/day</div>
            <div style="font-size: 11px; margin-bottom: 6px;"><strong>Demurrage:</strong> $${Number(port.demurrageRatePerDay || 22000).toLocaleString()}/day</div>
            ${port.requiresLightering ? '<div style="background: #FEF3C7; color: #92400E; font-size: 10px; font-weight: bold; padding: 3px 6px; border-radius: 4px; margin-bottom: 6px;">Requires Sagar-Sandheads Lightering</div>' : ''}
            <button id="btn-select-port-${key}" style="width: 100%; background: #FF3B00; color: white; border: none; padding: 6px 10px; font-size: 11px; font-weight: bold; border-radius: 6px; cursor: pointer;">
              Set as Active Destination
            </button>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.on('popupopen', () => {
          const btn = document.getElementById(`btn-select-port-${key}`);
          if (btn) {
            btn.onclick = () => {
              if (onPortChange) onPortChange(key);
              marker.closePopup();
            };
          }
        });
      });

      // 4. Add Origin Loading Terminals
      Object.entries(ORIGIN_PORTS_MATRIX).forEach(([key, orig]) => {
        const geo = portGeoCoords[key];
        if (!geo) return;
        const isSelected = activeOriginKey === key;

        const markerHtml = `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer;">
            ${isSelected ? '<div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background: rgba(2, 132, 199, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>' : ''}
            <div style="width: ${isSelected ? '20px' : '15px'}; height: ${isSelected ? '20px' : '15px'}; border-radius: 50%; background: #0284C7; border: 2px solid #FFFFFF; box-shadow: 0 0 10px rgba(2, 132, 199, 0.8); display: flex; align-items: center; justify-content: center; color: white;">
            </div>
            <span style="position: absolute; left: 22px; top: -3px; white-space: nowrap; font-family: sans-serif; font-weight: 700; font-size: 10px; color: #38BDF8; background: rgba(15, 23, 42, 0.85); padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(2, 132, 199, 0.5);">
              ${orig.country} - ${orig.name.split('(')[0]}
            </span>
          </div>
        `;

        const customIcon = L.divIcon({
          className: 'custom-origin-marker',
          html: markerHtml,
          iconSize: [22, 22],
          iconAnchor: [11, 11]
        });

        const marker = L.marker([geo.lat, geo.lng], { icon: customIcon }).addTo(layerGroup);

        const popupContent = `
          <div style="font-family: sans-serif; min-width: 190px; color: #0F172A; padding: 2px;">
            <div style="font-weight: 800; font-size: 13px; color: #0284C7; border-bottom: 2px solid #E2E8F0; padding-bottom: 4px; margin-bottom: 6px;">
              ${orig.name} (${orig.country})
            </div>
            <div style="font-size: 11px; margin-bottom: 3px;"><strong>Max Draft:</strong> ${orig.maxDraft} m • <strong>Max LOA:</strong> ${orig.maxLOA} m</div>
            <div style="font-size: 11px; margin-bottom: 3px;"><strong>Loading Rate:</strong> ${(orig.dailyLoadingRate / 1000).toFixed(0)}k MT/day</div>
            <div style="font-size: 11px; margin-bottom: 6px;"><strong>Port Tariff:</strong> $${orig.portTariffPerTon}/MT</div>
            <button id="btn-select-origin-${key}" style="width: 100%; background: #0284C7; color: white; border: none; padding: 6px 10px; font-size: 11px; font-weight: bold; border-radius: 6px; cursor: pointer;">
              Set as Active Origin
            </button>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.on('popupopen', () => {
          const btn = document.getElementById(`btn-select-origin-${key}`);
          if (btn) {
            btn.onclick = () => {
              if (onOriginChange) onOriginChange(key);
              marker.closePopup();
            };
          }
        });
      });

      // 5. Add Chokepoints
      chokepoints.forEach((cp) => {
        const markerHtml = `
          <div style="display: flex; align-items: center; gap: 4px;">
            <div style="width: 8px; height: 8px; border-radius: 50%; background: #F59E0B; border: 1.5px solid #FFFFFF;"></div>
            <span style="font-family: monospace; font-size: 9px; font-weight: bold; color: #FCD34D; background: rgba(15, 23, 42, 0.85); padding: 1px 4px; border-radius: 3px; border: 1px solid #78350F;">
              ${cp.name}
            </span>
          </div>
        `;

        const customIcon = L.divIcon({
          className: 'custom-chokepoint-marker',
          html: markerHtml,
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        });

        L.marker([cp.lat, cp.lng], { icon: customIcon }).bindTooltip(`<strong>Strategic Maritime Chokepoint:</strong> ${cp.name}`, {
          className: 'custom-chokepoint-tooltip'
        }).addTo(layerGroup);
      });

      // 6. Add Live AIS Candidate Fleet Vessels
      if (showVessels) {
        const vesselGPS = [
          { lat: 4.5000, lng: 97.5000 },
          { lat: 19.5000, lng: 87.2000 },
          { lat: 1.3000, lng: 104.2000 },
          { lat: 7.2000, lng: 82.5000 },
          { lat: 21.0000, lng: 88.1000 },
          { lat: 11.5000, lng: 92.5000 },
          { lat: -5.5000, lng: 106.2000 },
          { lat: 17.5000, lng: 83.8000 }
        ];

        CANDIDATE_VESSELS.forEach((v, idx) => {
          const pos = vesselGPS[idx] || { lat: 15.0, lng: 85.0 };

          const markerHtml = `
            <div style="display: flex; align-items: center; gap: 3px; cursor: pointer;">
              <div style="width: 10px; height: 10px; border-radius: 50%; background: #10B981; border: 1.5px solid #FFFFFF; box-shadow: 0 0 6px #10B981;"></div>
              <span style="font-family: monospace; font-size: 8px; font-weight: bold; color: #6EE7B7; background: rgba(15, 23, 42, 0.9); padding: 1px 4px; border-radius: 3px; border: 1px solid rgba(16, 185, 129, 0.4);">
                ${v.name.split(' ')[1] || v.name} (${v.vesselClass})
              </span>
            </div>
          `;

          const customIcon = L.divIcon({
            className: 'custom-vessel-marker',
            html: markerHtml,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          });

          const vMarker = L.marker([pos.lat, pos.lng], { icon: customIcon }).addTo(layerGroup);

          const dailyRateStr = v.baseDailyRate ? Number(v.baseDailyRate).toLocaleString() : (v.dailyCharterRateMultiplier ? Number(Math.round(22000 * v.dailyCharterRateMultiplier)).toLocaleString() : '22,000');
          const dwtStr = Number(v.dwt || 75000).toLocaleString();

          vMarker.bindPopup(`
            <div style="font-family: sans-serif; font-size: 11px; color: #0F172A;">
              <strong style="color: #10B981; font-size: 12px;">${v.name}</strong><br/>
              <strong>Class:</strong> ${v.vesselClass} (${dwtStr} DWT)<br/>
              <strong>Draft:</strong> ${v.draft}m • <strong>LOA:</strong> ${v.loa}m<br/>
              <strong>Speed:</strong> ${v.speedKnots} kn • <strong>Daily Charter:</strong> $${dailyRateStr}/d
            </div>
          `);
        });
      }
    } catch (e) {
      console.error('Leaflet map initialization error:', e);
    }

    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch {
          // ignore cleanup error
        }
        mapInstanceRef.current = null;
      }
    };
  }, [selectedPortKey, activeOriginKey, mapTheme, showMonsoonOverlay, showVessels, activeDest, chokepoints, onOriginChange, onPortChange, portGeoCoords]);

  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  const handleResetView = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.setView([16.0, 86.0], 4);
  };

  return (
    <div className="card-clean p-6 relative">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-extrabold text-slate-900 font-heading">
              Real-World Interactive Maritime Sea Lanes & Fleet AIS Radar
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real GPS open-ocean bathymetric routing from 5 global origin hubs to all 7 Indian East Coast receiving ports
          </p>
        </div>

        {/* Map View & Layer Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          
          {/* Base Layer Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-[11px] font-bold">
            <button
              onClick={() => setMapTheme('dark')}
              className={`px-2.5 py-1 rounded-lg transition-all ${mapTheme === 'dark' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Dark Matter
            </button>
            <button
              onClick={() => setMapTheme('ocean')}
              className={`px-2.5 py-1 rounded-lg transition-all ${mapTheme === 'ocean' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Nautical Blue
            </button>
            <button
              onClick={() => setMapTheme('satellite')}
              className={`px-2.5 py-1 rounded-lg transition-all ${mapTheme === 'satellite' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Satellite
            </button>
          </div>

          <button
            onClick={() => setShowMonsoonOverlay(!showMonsoonOverlay)}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              showMonsoonOverlay
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <CloudRain className={`w-3.5 h-3.5 ${showMonsoonOverlay ? 'text-white' : 'text-blue-600'}`} />
            Monsoon Swell {showMonsoonOverlay ? 'ON' : 'OFF'}
          </button>

          <button
            onClick={() => setShowVessels(!showVessels)}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              showVessels
                ? 'bg-[#FF3B00] text-white shadow-md'
                : 'bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <Ship className={`w-3.5 h-3.5 ${showVessels ? 'text-white' : 'text-[#FF3B00]'}`} />
            Fleet AIS {showVessels ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Active Route Info Strip */}
      <div className="mb-4 p-3 rounded-xl bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF3B00] animate-ping"></span>
          <span>Active Sea Lane:</span>
          <strong className="text-cyan-300 font-bold">{activeOrigin.name} ({activeOriginSpec.country})</strong>
          <ArrowRight className="w-3.5 h-3.5 text-[#FF3B00]" />
          <strong className="text-emerald-400 font-bold">{activeDest.name}</strong>
        </div>
        <div className="flex items-center gap-4 text-slate-300">
          <div>Distance: <span className="text-white font-bold">{Number(nauticalDistance || 2500).toLocaleString()} NM</span></div>
          <div>Transit: <span className="text-[#FF3B00] font-bold">{Number((Number(nauticalDistance || 2500) / (13.5 * 24)).toFixed(1))} Days @ 13.5 kn</span></div>
        </div>
      </div>

      {/* Real-World Leaflet Map Viewport */}
      <div className="relative w-full rounded-2xl overflow-hidden border border-slate-700 shadow-2xl" style={{ height: '460px' }}>
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Floating Zoom and Pan Controls */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5 bg-slate-900/90 p-1.5 rounded-xl border border-slate-700 shadow-xl backdrop-blur-md">
          <button
            onClick={handleZoomIn}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetView}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 flex items-center justify-center transition-colors"
            title="Reset to Bay of Bengal"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Floating Map Legend Overlay */}
        <div className="absolute bottom-4 right-4 z-10 bg-slate-900/95 text-white p-3 rounded-xl border border-slate-700 shadow-xl backdrop-blur-md text-[11px] font-sans space-y-1">
          <div className="font-bold text-slate-300 uppercase tracking-wider text-[9px] mb-1">Live Map Legend</div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#FF3B00] border border-white inline-block"></span>
            <span>Indian East Coast Ports (7 Ports)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#0284C7] border border-white inline-block"></span>
            <span>Global Origin Terminals (5 Origins)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#10B981] border border-white inline-block"></span>
            <span>Live Candidate Fleet AIS</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#F59E0B] border border-white inline-block"></span>
            <span>Strategic Maritime Chokepoints</span>
          </div>
        </div>

      </div>

      {/* Bottom Summary */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-700">
        <div className="flex items-center gap-2 font-bold">
          <Anchor className="w-4 h-4 text-[#FF3B00]" />
          <span>Click any port or origin marker directly on the real map to view dock constraints or re-route the optimization solver.</span>
        </div>
        <span className="font-mono text-[11px] text-slate-500">Interactive OpenStreetMap & CartoDB Engine</span>
      </div>

    </div>
  );
}
