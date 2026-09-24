import { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, X } from 'lucide-react';

const icon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

function MapEvents({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e) {
            onLocationSelect(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

export default function LocationPickerModal({
    isOpen,
    onClose,
    initialLat,
    initialLng,
    onSave
}: {
    isOpen: boolean;
    onClose: () => void;
    initialLat: number | null;
    initialLng: number | null;
    onSave: (lat: number, lng: number) => void;
}) {
    const [lat, setLat] = useState<number | null>(initialLat);
    const [lng, setLng] = useState<number | null>(initialLng);

    useEffect(() => {
        if (isOpen) {
            setLat(initialLat);
            setLng(initialLng);
        }
    }, [isOpen, initialLat, initialLng]);

    if (!isOpen) return null;

    const defaultCenter: [number, number] = initialLat && initialLng ? [initialLat, initialLng] : [20.5937, 78.9629];

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-bold flex items-center gap-2">
                        <MapPin size={20} className="text-primary" />
                        Set Shop Location on Map
                    </h3>
                    <button onClick={onClose} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-4 bg-gray-50 text-sm text-gray-600 flex justify-between items-center">
                    <p>Click anywhere on the map to place the pin for your shop.</p>
                    <button 
                        onClick={() => {
                            if (navigator.geolocation) {
                                navigator.geolocation.getCurrentPosition(
                                    (pos) => {
                                        setLat(pos.coords.latitude);
                                        setLng(pos.coords.longitude);
                                    }
                                );
                            }
                        }}
                        className="text-xs px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg font-bold"
                    >
                        Use Current GPS
                    </button>
                </div>

                <div className="h-[400px] w-full bg-gray-100 relative">
                    <MapContainer center={defaultCenter} zoom={initialLat ? 15 : 5} style={{ height: '100%', width: '100%' }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <MapEvents onLocationSelect={(l, ln) => { setLat(l); setLng(ln); }} />
                        {lat && lng && <Marker position={[lat, lng]} icon={icon} />}
                    </MapContainer>
                </div>

                <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="text-sm font-mono text-gray-500">
                        {lat && lng ? `${lat.toFixed(6)}, ${lng.toFixed(6)}` : 'No location selected'}
                    </div>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-4 py-2 rounded-lg font-bold text-gray-500 hover:bg-gray-100">
                            Cancel
                        </button>
                        <button 
                            disabled={!lat || !lng}
                            onClick={() => { if(lat && lng) onSave(lat, lng); }} 
                            className="px-6 py-2 rounded-lg font-bold bg-primary text-white disabled:opacity-50"
                        >
                            Save Location
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
