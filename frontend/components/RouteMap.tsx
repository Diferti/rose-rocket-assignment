'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';

interface RouteMapProps {
  origin: {
    latitude: number;
    longitude: number;
    city: string;
    state_province?: string;
  };
  destination: {
    latitude: number;
    longitude: number;
    city: string;
    state_province?: string;
  };
  height?: string;
}

export default function RouteMap({ origin, destination, height = '300px' }: RouteMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(true);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Validate coordinates
    const originLat = Number(origin.latitude);
    const originLng = Number(origin.longitude);
    const destLat = Number(destination.latitude);
    const destLng = Number(destination.longitude);

    if (
      isNaN(originLat) ||
      isNaN(originLng) ||
      isNaN(destLat) ||
      isNaN(destLng) ||
      originLat < -90 ||
      originLat > 90 ||
      originLng < -180 ||
      originLng > 180 ||
      destLat < -90 ||
      destLat > 90 ||
      destLng < -180 ||
      destLng > 180
    ) {
      console.error('Invalid coordinates:', { origin, destination });
      return;
    }

    // Initialize map
    const map = L.map(mapContainerRef.current).setView(
      [(originLat + destLat) / 2, (originLng + destLng) / 2],
      5
    );

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: false, // Remove attribution
      maxZoom: 19,
    }).addTo(map);

    // Fix default marker icon issue
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });

    // Create custom marker with label for origin
    const originIcon = L.divIcon({
      className: 'custom-marker-label',
      html: `
        <div style="
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        ">
          <div style="
            background: #4E3B31;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: bold;
            white-space: nowrap;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            margin-bottom: 4px;
          ">${origin.city}</div>
          <div style="
            width: 0;
            height: 0;
            border-left: 6px solid transparent;
            border-right: 6px solid transparent;
            border-top: 6px solid #4E3B31;
          "></div>
          <div style="
            width: 12px;
            height: 12px;
            background: #4E3B31;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            margin-top: 2px;
          "></div>
        </div>
      `,
      iconSize: [100, 50],
      iconAnchor: [50, 45],
      popupAnchor: [0, -45],
    });

    // Create custom marker with label for destination
    const destIcon = L.divIcon({
      className: 'custom-marker-label',
      html: `
        <div style="
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        ">
          <div style="
            background: #4E3B31;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: bold;
            white-space: nowrap;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            margin-bottom: 4px;
          ">${destination.city}</div>
          <div style="
            width: 0;
            height: 0;
            border-left: 6px solid transparent;
            border-right: 6px solid transparent;
            border-top: 6px solid #4E3B31;
          "></div>
          <div style="
            width: 12px;
            height: 12px;
            background: #4E3B31;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            margin-top: 2px;
          "></div>
        </div>
      `,
      iconSize: [100, 50],
      iconAnchor: [50, 45],
      popupAnchor: [0, -45],
    });

    // Add origin marker with label
    const originMarker = L.marker([originLat, originLng], { icon: originIcon }).addTo(map);
    originMarker.bindPopup(
      `<strong>Origin:</strong><br>${origin.city}${origin.state_province ? `, ${origin.state_province}` : ''}`
    );

    // Add destination marker with label
    const destMarker = L.marker([destLat, destLng], { icon: destIcon }).addTo(map);
    destMarker.bindPopup(
      `<strong>Destination:</strong><br>${destination.city}${destination.state_province ? `, ${destination.state_province}` : ''}`
    );

    mapRef.current = map;

    // Fetch driving route from OSRM
    const fetchRoute = async () => {
      // Check if map is still valid before starting
      if (!mapRef.current || !mapContainerRef.current) {
        console.warn('Map not available for fetching route');
        return;
      }

      try {
        setIsLoadingRoute(true);
        const coordinates = `${originLng},${originLat};${destLng},${destLat}`;
        const response = await axios.get(
          `https://router.project-osrm.org/route/v1/driving/${coordinates}`,
          {
            params: {
              overview: 'full', // Get full route geometry
              geometries: 'geojson',
            },
            timeout: 5000,
          }
        );

        // Check if map is still valid after async operation
        if (!mapRef.current || !mapContainerRef.current) {
          console.warn('Map was removed during route fetch');
          return;
        }

        if (response.data && response.data.routes && response.data.routes.length > 0) {
          const route = response.data.routes[0];
          const geometry = route.geometry;

          // Convert GeoJSON coordinates to Leaflet LatLng array
          // GeoJSON format is [lon, lat], Leaflet expects [lat, lon]
          const routeCoordinates = geometry.coordinates.map((coord: [number, number]) => [
            coord[1], // lat
            coord[0], // lon
          ]);

          // Remove existing route line if any
          if (routeLineRef.current && mapRef.current) {
            mapRef.current.removeLayer(routeLineRef.current);
          }

          // Draw the actual driving route with solid line
          const routeLine = L.polyline(routeCoordinates, {
            color: '#A67C52',
            weight: 4,
            opacity: 0.8,
            smoothFactor: 1,
          }).addTo(mapRef.current);

          routeLineRef.current = routeLine;

          // Fit map to show the entire route
          const bounds = routeLine.getBounds();
          mapRef.current.fitBounds(bounds, { padding: [50, 50] });
        } else {
          // Fallback to straight line if route not found
          drawStraightLine(mapRef.current, originLat, originLng, destLat, destLng);
        }
      } catch (error) {
        console.warn('Failed to fetch route, using straight line:', error);
        // Check if map is still valid before fallback
        if (mapRef.current && mapContainerRef.current) {
          // Fallback to straight line on error
          drawStraightLine(mapRef.current, originLat, originLng, destLat, destLng);
        }
      } finally {
        setIsLoadingRoute(false);
      }
    };

    // Helper function to draw straight line as fallback
    const drawStraightLine = (
      mapInstance: L.Map | null,
      originLat: number,
      originLng: number,
      destLat: number,
      destLng: number
    ) => {
      // Check if map is still valid
      if (!mapInstance || !mapContainerRef.current) {
        console.warn('Map not available for drawing straight line');
        return;
      }

      // Validate coordinates
      if (
        isNaN(originLat) || isNaN(originLng) || isNaN(destLat) || isNaN(destLng) ||
        originLat < -90 || originLat > 90 || destLat < -90 || destLat > 90 ||
        originLng < -180 || originLng > 180 || destLng < -180 || destLng > 180
      ) {
        console.warn('Invalid coordinates for drawing straight line');
        return;
      }

      try {
        const routeLine = L.polyline(
          [[originLat, originLng], [destLat, destLng]],
          {
            color: '#A67C52',
            weight: 3,
            opacity: 0.6,
          }
        ).addTo(mapInstance);

        routeLineRef.current = routeLine;

        // Fit map to show both markers
        const bounds = L.latLngBounds(
          [[originLat, originLng], [destLat, destLng]]
        );
        mapInstance.fitBounds(bounds, { padding: [50, 50] });
      } catch (error) {
        console.error('Error drawing straight line:', error);
      }
    };

    fetchRoute();

    // Cleanup
    return () => {
      if (routeLineRef.current) {
        map.removeLayer(routeLineRef.current);
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [origin, destination]);

  return (
    <div style={{ position: 'relative', height, width: '100%' }}>
      <div
        ref={mapContainerRef}
        style={{ height, width: '100%', borderRadius: '8px', overflow: 'hidden' }}
        className="border border-[#C8A27A]"
      />
      {isLoadingRoute && (
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(78, 59, 49, 0.9)',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 'bold',
            zIndex: 1000,
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
          }}
        >
          Loading route...
        </div>
      )}
    </div>
  );
}
