"use client"

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom icons using public CDN to avoid Next.js static serving issues
const createIcon = (color: string) => {
    return new L.Icon({
        iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });
};

const retailerIcon = createIcon('green');
const customerIcon = createIcon('blue');

export default function LiveMapComponent({ retailers, customers }: { retailers: any[], customers: any[] }) {
    const defaultCenter = [20.5937, 78.9629]; // Center of India
    
    return (
        <div className="h-[700px] w-full rounded-xl overflow-hidden border border-border-custom shadow-sm relative z-0">
            <MapContainer center={defaultCenter as [number, number]} zoom={5} style={{ height: '100%', width: '100%', zIndex: 0 }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                {/* Retailers */}
                {retailers.map((r, idx) => {
                    const lat = r.businessDetails?.location?.latitude;
                    const lng = r.businessDetails?.location?.longitude;
                    const radius = r.businessDetails?.location?.deliveryRadius || 10;
                    
                    if (!lat || !lng) return null;
                    
                    return (
                        <div key={`ret-wrapper-${idx}`}>
                            <Marker position={[lat, lng]} icon={retailerIcon}>
                                <Popup>
                                    <strong>{r.businessDetails?.businessName || r.name}</strong><br/>
                                    Role: Retailer (Approved)<br/>
                                    Delivery Radius: {radius} km<br/>
                                    Phone: {r.whatsappNumber || r.phone || 'N/A'}
                                </Popup>
                            </Marker>
                            <Circle 
                                center={[lat, lng]} 
                                pathOptions={{ fillColor: '#22c55e', color: '#16a34a', fillOpacity: 0.2 }} 
                                radius={radius * 1000} 
                            />
                        </div>
                    );
                })}

                {/* Customers */}
                {customers.map((c, idx) => {
                    // Customers store locations in an 'addresses' array. We use the default one, or the first one.
                    const defaultAddress = c.addresses?.find((a: any) => a.isDefault) || c.addresses?.[0];
                    const lat = defaultAddress?.latitude;
                    const lng = defaultAddress?.longitude;
                    
                    if (!lat || !lng) return null;
                    
                    return (
                        <Marker key={`cust-${idx}`} position={[lat, lng]} icon={customerIcon}>
                            <Popup>
                                <strong>{c.fullName || c.name || 'Customer'}</strong><br/>
                                Role: App User<br/>
                                Email: {c.email || 'N/A'}<br/>
                                Phone: {c.phoneNumber || 'N/A'}
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
}
