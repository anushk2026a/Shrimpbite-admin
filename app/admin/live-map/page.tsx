"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import adminService from "@/data/services/adminService"
import { Loader2, MapPin, Users, Store } from "lucide-react"
import dynamic from 'next/dynamic'

// Dynamically import the map component with SSR disabled
const LiveMapComponent = dynamic(() => import('@/components/admin/LiveMapComponent'), {
    ssr: false,
    loading: () => <div className="h-[700px] w-full animate-pulse bg-gray-100 rounded-xl flex items-center justify-center font-semibold text-text-muted">Loading Live Map Engine...</div>
})

export default function LiveMapPage() {
    // Fetch all approved retailers (large limit for map)
    const { data: retailersData, isLoading: loadingRetailers } = useQuery({
        queryKey: ["liveMapRetailers"],
        queryFn: async () => {
            return await adminService.getRetailers("approved", 1, 1000, "")
        },
        staleTime: 5 * 60 * 1000,
    })

    // Fetch all users (customers) (large limit for map)
    const { data: usersData, isLoading: loadingUsers } = useQuery({
        queryKey: ["liveMapUsers"],
        queryFn: async () => {
            return await adminService.getUsers(1, 2000, "")
        },
        staleTime: 5 * 60 * 1000,
    })

    const retailers = retailersData?.data || []
    const customers = usersData?.data || []
    
    // Filter out users/retailers that don't have valid coordinates
    const validRetailers = retailers.filter((r: any) => r.businessDetails?.location?.latitude && r.businessDetails?.location?.longitude)
    const validCustomers = customers.filter((c: any) => (c.location?.latitude || c.latitude) && (c.location?.longitude || c.longitude))

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <MapPin className="text-primary" /> Live Coverage Map
                    </h1>
                    <p className="text-text-muted text-sm mt-1">Real-time geospatial view of active retailers and customers.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-border-custom flex items-center gap-4">
                    <div className="p-3 bg-green-100 text-green-600 rounded-full">
                        <Store size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-text-muted font-medium">Mapped Retailers</p>
                        <h3 className="text-2xl font-bold">
                            {loadingRetailers ? <Loader2 className="animate-spin w-4 h-4" /> : `${validRetailers.length} / ${retailers.length}`}
                        </h3>
                        {retailers.length > validRetailers.length && (
                            <p className="text-[10px] text-red-500 font-medium leading-tight mt-1">
                                {retailers.length - validRetailers.length} missing GPS coordinates
                            </p>
                        )}
                    </div>
                </div>
                
                <div className="bg-white p-4 rounded-xl shadow-sm border border-border-custom flex items-center gap-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-text-muted font-medium">Mapped Customers</p>
                        <h3 className="text-2xl font-bold">
                            {loadingUsers ? <Loader2 className="animate-spin w-4 h-4" /> : `${validCustomers.length} / ${customers.length}`}
                        </h3>
                        {customers.length > validCustomers.length && (
                            <p className="text-[10px] text-red-500 font-medium leading-tight mt-1">
                                {customers.length - validCustomers.length} missing GPS coordinates
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white p-2 rounded-2xl border border-border-custom shadow-sm relative">
                <LiveMapComponent retailers={validRetailers} customers={validCustomers} />
            </div>
        </div>
    )
}
