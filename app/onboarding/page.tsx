"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import {
    Building2,
    MapPin,
    FileText,
    CheckCircle2,
    ArrowRight,
    ArrowLeft,
    Upload,
    ChevronDown,
    AlertCircle
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import fileService from "@/data/services/fileService"
import authService from "@/data/services/authService"
import useAuthStore from "@/data/store/useAuthStore"

// ─── Indian States & Cities ────────────────────────────────────────────────
const INDIA_STATES_CITIES: Record<string, string[]> = {
    "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Rajahmundry", "Tirupati", "Kadapa", "Kakinada", "Anantapur"],
    "Arunachal Pradesh": ["Itanagar", "Naharlagun", "Pasighat", "Tezpur", "Bomdila"],
    "Assam": ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon", "Tinsukia", "Tezpur", "Dhubri", "Bongaigaon", "Karimganj"],
    "Bihar": ["Patna", "Gaya", "Muzaffarpur", "Bhagalpur", "Darbhanga", "Arrah", "Purnia", "Begusarai", "Katihar", "Munger"],
    "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Korba", "Durg", "Rajnandgaon", "Jagdalpur", "Ambikapur", "Raigarh"],
    "Goa": ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda", "Bicholim", "Valpoi"],
    "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Junagadh", "Gandhinagar", "Anand", "Nadiad", "Morbi", "Mehsana"],
    "Haryana": ["Faridabad", "Gurgaon", "Panipat", "Ambala", "Yamunanagar", "Rohtak", "Hisar", "Karnal", "Sonipat", "Panchkula"],
    "Himachal Pradesh": ["Shimla", "Solan", "Dharamsala", "Mandi", "Kullu", "Hamirpur", "Una", "Baddi", "Palampur"],
    "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar", "Phusro", "Hazaribagh", "Giridih", "Ramgarh"],
    "Karnataka": ["Bengaluru", "Mysuru", "Mangaluru", "Hubli", "Dharwad", "Belagavi", "Davanagere", "Ballari", "Tumkur", "Shivamogga", "Kalaburagi", "Udupi"],
    "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Kollam", "Thrissur", "Alappuzha", "Palakkad", "Malappuram", "Kannur", "Kottayam", "Pathanamthitta", "Manjeri"],
    "Madhya Pradesh": ["Bhopal", "Indore", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Ratlam", "Satna", "Dewas", "Murwara"],
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Thane", "Aurangabad", "Solapur", "Kolhapur", "Nanded", "Sangli", "Amravati", "Malegaon", "Latur"],
    "Manipur": ["Imphal", "Thoubal", "Bishnupur", "Churachandpur", "Senapati"],
    "Meghalaya": ["Shillong", "Tura", "Nongstoin", "Jowai", "Baghmara"],
    "Mizoram": ["Aizawl", "Lunglei", "Saiha", "Champhai", "Kolasib"],
    "Nagaland": ["Kohima", "Dimapur", "Mokokchung", "Wokha", "Zunheboto"],
    "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Brahmapur", "Sambalpur", "Puri", "Balasore", "Bhadrak", "Baripada", "Jharsuguda"],
    "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali", "Hoshiarpur", "Gurdaspur", "Ferozepur", "Phagwara"],
    "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Bikaner", "Ajmer", "Bhilwara", "Alwar", "Sikar", "Bharatpur"],
    "Sikkim": ["Gangtok", "Namchi", "Mangan", "Gyalshing"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Tirupur", "Vellore", "Erode", "Dindigul", "Thanjavur", "Nagercoil"],
    "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam", "Ramagundam", "Mahbubnagar", "Nalgonda", "Adilabad", "Suryapet"],
    "Tripura": ["Agartala", "Udaipur", "Dharmanagar", "Kailasahar", "Belonia"],
    "Uttar Pradesh": ["Lucknow", "Kanpur", "Agra", "Varanasi", "Meerut", "Allahabad", "Bareilly", "Aligarh", "Moradabad", "Saharanpur", "Ghaziabad", "Noida", "Jhansi", "Mathura"],
    "Uttarakhand": ["Dehradun", "Haridwar", "Roorkee", "Haldwani", "Rudrapur", "Kashipur", "Rishikesh", "Kotdwar"],
    "West Bengal": ["Kolkata", "Asansol", "Siliguri", "Durgapur", "Bardhaman", "Malda", "Barasat", "Krishnanagar", "Jalpaiguri", "Howrah"],
    "Andaman and Nicobar Islands": ["Port Blair", "Diglipur", "Rangat"],
    "Chandigarh": ["Chandigarh"],
    "Dadra and Nagar Haveli and Daman and Diu": ["Daman", "Diu", "Silvassa"],
    "Delhi": ["New Delhi", "Delhi"],
    "Jammu and Kashmir": ["Srinagar", "Jammu", "Anantnag", "Sopore", "Baramulla", "Udhampur"],
    "Ladakh": ["Leh", "Kargil"],
    "Lakshadweep": ["Kavaratti"],
    "Puducherry": ["Puducherry", "Karaikal", "Mahé", "Yanam"],
}

const ALL_STATES = Object.keys(INDIA_STATES_CITIES).sort()

// ─── Validation Regexes ────────────────────────────────────────────────────
const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/
const fssaiRegex = /^[0-9]{14}$/

// ─── Helpers ───────────────────────────────────────────────────────────────
/** Auto-capitalizes first letter of each word (Title Case) */
const toTitleCase = (value: string) =>
    value.replace(/\b\w/g, (char) => char.toUpperCase())

/** Strip everything except digits, then limit to 10 digits */
const sanitizePhone = (value: string) =>
    value.replace(/\D/g, "").slice(0, 10)

// ─── Steps ────────────────────────────────────────────────────────────────
const steps = [
    { id: "owner", title: "Owner Details", icon: CheckCircle2 },
    { id: "store", title: "Store Details", icon: Building2 },
    { id: "business", title: "Business Info", icon: FileText },
    { id: "legal", title: "Legal Details", icon: MapPin },
]

type ErrorMap = Partial<Record<string, string>>

const inputCls = (errors: ErrorMap, field: string) =>
    cn(
        "w-full px-5 py-4 rounded-xl border outline-none transition-all text-[#1A1A1A] font-medium",
        errors[field]
            ? "border-red-400 focus:ring-2 focus:ring-red-200 bg-red-50/40"
            : "border-[#E9ECEF] focus:ring-2 focus:ring-[#FF6B00]/10 focus:border-[#FF6B00]"
    )

const selectCls = (errors: ErrorMap, field: string) =>
    cn(
        "w-full px-5 py-4 rounded-xl border appearance-none outline-none transition-all bg-white font-medium",
        errors[field]
            ? "border-red-400 focus:ring-2 focus:ring-red-200 bg-red-50/40"
            : "border-[#E9ECEF] focus:ring-2 focus:ring-[#FF6B00]/10 focus:border-[#FF6B00]"
    )

const ErrorMsg = ({ errors, field }: { errors: ErrorMap; field: string }) =>
    errors[field] ? (
        <p className="flex items-center gap-1.5 text-xs text-red-500 font-semibold mt-1.5">
            <AlertCircle size={12} />
            {errors[field]}
        </p>
    ) : null

// Phone field with +91 prefix — defined outside to keep stable identity
const PhoneField = ({
    field,
    label,
    required = false,
    value,
    errors,
    onChange,
}: {
    field: string
    label: string
    required?: boolean
    value: string
    errors: ErrorMap
    onChange: (digits: string) => void
}) => {
    const digits = value.startsWith("+91") ? value.slice(3) : value
    return (
        <div className="space-y-2">
            <label className="text-sm font-bold text-[#495057]">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className={cn(
                "flex items-center rounded-xl border overflow-hidden transition-all",
                errors[field]
                    ? "border-red-400 ring-2 ring-red-200"
                    : "border-[#E9ECEF] focus-within:ring-2 focus-within:ring-[#FF6B00]/10 focus-within:border-[#FF6B00]"
            )}>
                <span className="px-4 py-4 bg-[#F1F3F5] text-[#495057] font-bold text-sm border-r border-[#E9ECEF] whitespace-nowrap select-none">
                    +91
                </span>
                <input
                    type="tel"
                    maxLength={10}
                    value={digits}
                    onChange={e => onChange(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    className="flex-1 px-4 py-4 outline-none bg-transparent font-medium text-[#1A1A1A] placeholder:text-[#ADB5BD]"
                    placeholder="10-digit number"
                />
            </div>
            <ErrorMsg errors={errors} field={field} />
        </div>
    )
}

export default function OnboardingPage() {
    const router = useRouter()
    const [currentStep, setCurrentStep] = useState(0)
    const [loading, setLoading] = useState(false)
    const [userId, setUserId] = useState<string | null>(null)
    const licenseInputRef = useRef<HTMLInputElement>(null)
    const gstInputRef = useRef<HTMLInputElement>(null)
    const [uploading, setUploading] = useState<{ [key: string]: boolean }>({})
    const [errors, setErrors] = useState<ErrorMap>({})

    const [formData, setFormData] = useState({
        // Owner Details
        ownerName: "",
        alternateContact: "+91",
        whatsappNumber: "+91",
        // Store Details
        businessName: "",
        storeDisplayName: "",
        address: "",
        state: "",
        city: "",
        pincode: "",
        landmark: "",
        // Business Info
        yearsInBusiness: "",
        monthlyPurchaseVolume: "",
        // Legal Details
        gst: "",
        fssai: "",
        licenseUrl: "",
        gstCertificateUrl: "",
        agreed: false,
    })

    // Cities available for selected state
    const availableCities = formData.state ? (INDIA_STATES_CITIES[formData.state] || []) : []

    useEffect(() => {
        const id = localStorage.getItem("userId")
        if (!id) {
            router.push("/register")
            return
        }
        setUserId(id)
    }, [])

    // ─── Per-field helpers ──────────────────────────────────────────────────
    const setField = (field: string, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        setErrors(prev => ({ ...prev, [field]: "" }))
    }

    const handleTitleCase = (field: string, value: string) => {
        setField(field, toTitleCase(value))
    }

    const handlePhone = (field: "alternateContact" | "whatsappNumber", raw: string) => {
        // Always keep +91 prefix intact
        const digits = raw.startsWith("+91") ? raw.slice(3) : raw
        const cleaned = sanitizePhone(digits)
        setField(field, "+91" + cleaned)
    }

    const handleStateChange = (state: string) => {
        setFormData(prev => ({ ...prev, state, city: "" }))
        setErrors(prev => ({ ...prev, state: "", city: "" }))
    }

    // ─── Step Validation ───────────────────────────────────────────────────
    const validateStep = (step: number): boolean => {
        const newErrors: ErrorMap = {}

        if (step === 0) {
            if (!formData.ownerName.trim()) newErrors.ownerName = "Owner name is required."
            const altDigits = formData.alternateContact.slice(3)
            if (altDigits && altDigits.length !== 10)
                newErrors.alternateContact = "Enter exactly 10 digits after +91."
            const waDigits = formData.whatsappNumber.slice(3)
            if (!waDigits || waDigits.length !== 10)
                newErrors.whatsappNumber = "WhatsApp number must be 10 digits."
        }

        if (step === 1) {
            if (!formData.businessName.trim()) newErrors.businessName = "Business name is required."
            if (!formData.storeDisplayName.trim()) newErrors.storeDisplayName = "Store display name is required."
            if (!formData.address.trim()) newErrors.address = "Address is required."
            if (!formData.state) newErrors.state = "Please select a state."
            if (!formData.city) newErrors.city = "Please select a city."
            if (!formData.pincode.trim()) newErrors.pincode = "Pincode is required."
            else if (!/^[0-9]{6}$/.test(formData.pincode)) newErrors.pincode = "Pincode must be exactly 6 digits."
        }

        if (step === 3) {
            const gstVal = formData.gst.trim().toUpperCase()
            if (gstVal && !gstRegex.test(gstVal)) newErrors.gst = "Invalid GSTIN format. Example: 22AAAAA0000A1Z5"
            if (!formData.fssai.trim()) newErrors.fssai = "FSSAI License Number is required."
            else if (!fssaiRegex.test(formData.fssai.trim())) newErrors.fssai = "FSSAI must be exactly 14 digits."
            if (!formData.agreed) newErrors.agreed = "You must agree to the terms & conditions."
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleNext = () => {
        if (!validateStep(currentStep)) return
        if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1)
    }

    const handleBack = () => {
        if (currentStep > 0) setCurrentStep(currentStep - 1)
    }

    // ─── File Upload ───────────────────────────────────────────────────────
    const handleFileChange = async (
        e: React.ChangeEvent<HTMLInputElement>,
        field: "licenseUrl" | "gstCertificateUrl"
    ) => {
        const file = e.target.files?.[0]
        if (!file) return
        setUploading(prev => ({ ...prev, [field]: true }))
        try {
            const data = await fileService.upload(file)
            setFormData(prev => ({ ...prev, [field]: data.url }))
        } catch (error) {
            console.error("Upload error:", error)
            toast.error("Upload failed. Please try again.")
        } finally {
            setUploading(prev => ({ ...prev, [field]: false }))
        }
    }

    // ─── Submit ────────────────────────────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validateStep(3)) return
        setLoading(true)
        try {
            await authService.updateOnboarding({
                userId,
                alternateContact: formData.alternateContact,
                whatsappNumber: formData.whatsappNumber,
                businessDetails: {
                    businessName: formData.businessName,
                    storeDisplayName: formData.storeDisplayName,
                    ownerName: formData.ownerName,
                    yearsInBusiness: formData.yearsInBusiness,
                    monthlyPurchaseVolume: formData.monthlyPurchaseVolume,
                    location: {
                        address: formData.address,
                        city: formData.city,
                        state: formData.state,
                        pincode: formData.pincode,
                        landmark: formData.landmark,
                    },
                    legal: {
                        gst: formData.gst.toUpperCase(),
                        fssai: formData.fssai,
                        licenseUrl: formData.licenseUrl,
                        gstCertificateUrl: formData.gstCertificateUrl,
                    },
                },
            })

            if (useAuthStore.getState().user) {
                useAuthStore.getState().setUser({
                    ...useAuthStore.getState().user,
                    status: "under_review",
                    businessDetails: {
                        ...useAuthStore.getState().user.businessDetails,
                        businessName: formData.businessName,
                        location: {
                            address: formData.address,
                            city: formData.city,
                            state: formData.state,
                            pincode: formData.pincode,
                            landmark: formData.landmark,
                        },
                    },
                })
            }

            localStorage.setItem("status", "under_review")
            router.push("/retailer/status")
        } catch (error) {
            console.error(error)
            toast.error("Something went wrong. Please check your internet connection and try again.")
        } finally {
            setLoading(false)
        }
    }

    // inputCls, selectCls, ErrorMsg, PhoneField are defined outside this component (above)

    // ─── Render ────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-[#F8F9FA] flex">
            {/* Sidebar Branding */}
            <div className="hidden lg:flex w-1/3 bg-[#1B2D1F] p-12 flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF6B00]/10 blur-[100px] rounded-full -mr-32 -mt-32" />

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-12">
                        <img src="/loginlogo.png" alt="Logo" className="w-10 h-10" />
                        <span className="text-2xl font-bold text-white">Shrimpbite</span>
                    </div>

                    <h1 className="text-4xl font-bold text-white mb-6 leading-tight">
                        Complete your <br />
                        <span className="text-[#FFB800]">business profile</span>
                    </h1>
                    <p className="text-white/60 text-lg leading-relaxed">
                        Provide your business details to start selling premium shrimp on our platform.
                        This information helps us verify and set up your store.
                    </p>
                </div>

                <div className="relative z-10 space-y-8">
                    {steps.map((step, idx) => (
                        <div key={step.id} className="flex items-center gap-4">
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                                idx < currentStep
                                    ? "bg-green-500 text-white"
                                    : idx === currentStep
                                        ? "bg-[#FF6B00] text-white"
                                        : "bg-white/10 text-white/40"
                            )}>
                                {idx < currentStep ? <CheckCircle2 size={20} /> : <step.icon size={20} />}
                            </div>
                            <div>
                                <p className={cn(
                                    "font-bold text-sm",
                                    idx === currentStep ? "text-white" : idx < currentStep ? "text-green-400" : "text-white/40"
                                )}>{step.title}</p>
                                {idx < currentStep && (
                                    <p className="text-green-400/60 text-xs">Completed</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Form */}
            <div className="flex-1 flex flex-col p-8 lg:p-20 overflow-y-auto">
                <div className="max-w-2xl w-full mx-auto">
                    <div className="mb-12 lg:hidden">
                        <p className="text-[#FF6B00] font-bold text-sm uppercase tracking-widest mb-2">Step {currentStep + 1} of 4</p>
                        <h2 className="text-3xl font-bold text-[#1A1A1A]">{steps[currentStep].title}</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-10" noValidate>

                        {/* ── Step 0: Owner Details ── */}
                        {currentStep === 0 && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="mb-6 hidden lg:block">
                                    <p className="text-[#FF6B00] font-bold text-xs uppercase tracking-widest mb-1">Step 1 of 4</p>
                                    <h2 className="text-3xl font-bold text-[#1A1A1A]">Owner Details</h2>
                                </div>

                                {/* Owner Name */}
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-[#495057]">
                                        Owner Full Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        value={formData.ownerName}
                                        onChange={e => handleTitleCase("ownerName", e.target.value)}
                                        className={inputCls(errors, "ownerName")}
                                        placeholder="e.g. Kevin Alben"
                                    />
                                    <ErrorMsg errors={errors} field="ownerName" />
                                </div>

                                {/* Phone fields */}
                                <div className="grid grid-cols-2 gap-6">
                                    <PhoneField
                                        field="alternateContact"
                                        label="Alternate Contact"
                                        value={formData.alternateContact}
                                        errors={errors}
                                        onChange={digits => setField("alternateContact", "+91" + digits)}
                                    />
                                    <PhoneField
                                        field="whatsappNumber"
                                        label="WhatsApp Number"
                                        required
                                        value={formData.whatsappNumber}
                                        errors={errors}
                                        onChange={digits => setField("whatsappNumber", "+91" + digits)}
                                    />
                                </div>
                            </div>
                        )}

                        {/* ── Step 1: Store Details ── */}
                        {currentStep === 1 && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="mb-6 hidden lg:block">
                                    <p className="text-[#FF6B00] font-bold text-xs uppercase tracking-widest mb-1">Step 2 of 4</p>
                                    <h2 className="text-3xl font-bold text-[#1A1A1A]">Store Details</h2>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    {/* Business Name */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-[#495057]">
                                            Business Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            value={formData.businessName}
                                            onChange={e => handleTitleCase("businessName", e.target.value)}
                                            className={inputCls(errors, "businessName")}
                                            placeholder="Gourmet Seafoods"
                                        />
                                        <ErrorMsg errors={errors} field="businessName" />
                                    </div>

                                    {/* Store Display Name */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-[#495057]">
                                            Store Display Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            value={formData.storeDisplayName}
                                            onChange={e => handleTitleCase("storeDisplayName", e.target.value)}
                                            className={inputCls(errors, "storeDisplayName")}
                                            placeholder="Public shop name"
                                        />
                                        <ErrorMsg errors={errors} field="storeDisplayName" />
                                    </div>
                                </div>

                                {/* Address */}
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-[#495057]">
                                        Store Address <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        value={formData.address}
                                        onChange={e => setField("address", e.target.value)}
                                        className={inputCls(errors, "address")}
                                        placeholder="Full shop address (door no., street, area)"
                                    />
                                    <ErrorMsg errors={errors} field="address" />
                                </div>

                                {/* State → City (cascading) */}
                                <div className="grid grid-cols-2 gap-6">
                                    {/* State Dropdown */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-[#495057]">
                                            State <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={formData.state}
                                                onChange={e => handleStateChange(e.target.value)}
                                                className={selectCls(errors, "state")}
                                            >
                                                <option value="">— Select State —</option>
                                                {ALL_STATES.map(s => (
                                                    <option key={s} value={s}>{s}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#495057] pointer-events-none" size={18} />
                                        </div>
                                        <ErrorMsg errors={errors} field="state" />
                                    </div>

                                    {/* City Dropdown (enabled only after state is selected) */}
                                    <div className="space-y-2">
                                        <label className={cn("text-sm font-bold", formData.state ? "text-[#495057]" : "text-[#ADB5BD]")}>
                                            City <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={formData.city}
                                                onChange={e => setField("city", e.target.value)}
                                                disabled={!formData.state}
                                                className={cn(
                                                    selectCls(errors, "city"),
                                                    !formData.state && "opacity-50 cursor-not-allowed bg-[#F8F9FA]"
                                                )}
                                            >
                                                <option value="">— Select City —</option>
                                                {availableCities.map(c => (
                                                    <option key={c} value={c}>{c}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#495057] pointer-events-none" size={18} />
                                        </div>
                                        {!formData.state && (
                                            <p className="text-xs text-[#ADB5BD]">Select a state first</p>
                                        )}
                                        <ErrorMsg errors={errors} field="city" />
                                    </div>
                                </div>

                                {/* Pincode & Landmark */}
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-[#495057]">
                                            Pincode <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            maxLength={6}
                                            value={formData.pincode}
                                            onChange={e => setField("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))}
                                            className={inputCls(errors, "pincode")}
                                            placeholder="6-digit pincode"
                                        />
                                        <ErrorMsg errors={errors} field="pincode" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-[#495057]">Landmark (optional)</label>
                                        <input
                                            value={formData.landmark}
                                            onChange={e => setField("landmark", e.target.value)}
                                            className={inputCls(errors, "landmark")}
                                            placeholder="Near SBI Bank, etc."
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── Step 2: Business Info ── */}
                        {currentStep === 2 && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="mb-6 hidden lg:block">
                                    <p className="text-[#FF6B00] font-bold text-xs uppercase tracking-widest mb-1">Step 3 of 4</p>
                                    <h2 className="text-3xl font-bold text-[#1A1A1A]">Business Info</h2>
                                    <p className="text-[#868E96] text-sm mt-1">Optional information to help us understand your business better.</p>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-[#495057]">Years in Business</label>
                                        <input
                                            value={formData.yearsInBusiness}
                                            onChange={e => setField("yearsInBusiness", e.target.value)}
                                            className={inputCls(errors, "yearsInBusiness")}
                                            placeholder="e.g. 5 years"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-[#495057]">Estimated Monthly Purchase Volume</label>
                                        <input
                                            value={formData.monthlyPurchaseVolume}
                                            onChange={e => setField("monthlyPurchaseVolume", e.target.value)}
                                            className={inputCls(errors, "monthlyPurchaseVolume")}
                                            placeholder="e.g. 500 kg"
                                        />
                                    </div>
                                </div>

                                <div className="p-5 bg-blue-50 border border-blue-100 rounded-2xl">
                                    <p className="text-sm text-blue-700 font-medium">
                                        💡 This step is fully optional. You can click <strong>Next Step</strong> to proceed directly to Legal Details.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* ── Step 3: Legal Details ── */}
                        {currentStep === 3 && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="mb-6 hidden lg:block">
                                    <p className="text-[#FF6B00] font-bold text-xs uppercase tracking-widest mb-1">Step 4 of 4</p>
                                    <h2 className="text-3xl font-bold text-[#1A1A1A]">Legal Details</h2>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    {/* GST Number */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-[#495057]">GSTIN Number</label>
                                        <input
                                            value={formData.gst}
                                            onChange={e => setField("gst", e.target.value.toUpperCase())}
                                            maxLength={15}
                                            className={cn(inputCls(errors, "gst"), "uppercase tracking-wider font-mono")}
                                            placeholder="22AAAAA0000A1Z5"
                                        />
                                        <p className="text-xs text-[#ADB5BD]">15-character GSTIN (optional)</p>
                                        <ErrorMsg errors={errors} field="gst" />
                                    </div>

                                    {/* FSSAI */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-[#495057]">
                                            FSSAI License Number <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            value={formData.fssai}
                                            onChange={e => setField("fssai", e.target.value.replace(/\D/g, "").slice(0, 14))}
                                            maxLength={14}
                                            className={cn(inputCls(errors, "fssai"), "font-mono tracking-wider")}
                                            placeholder="14-digit number"
                                        />
                                        <p className="text-xs text-[#ADB5BD]">Must be exactly 14 digits</p>
                                        <ErrorMsg errors={errors} field="fssai" />
                                    </div>
                                </div>

                                {/* File Uploads */}
                                <div className="grid grid-cols-2 gap-6">
                                    {/* Business License */}
                                    <div className="space-y-2 text-center">
                                        <label className="text-sm font-bold text-[#495057]">Upload Business License</label>
                                        <input
                                            type="file"
                                            ref={licenseInputRef}
                                            className="hidden"
                                            accept=".pdf,image/*"
                                            onChange={e => handleFileChange(e, "licenseUrl")}
                                        />
                                        <div
                                            onClick={() => licenseInputRef.current?.click()}
                                            className={cn(
                                                "border border-dashed rounded-xl p-6 transition-all cursor-pointer group mt-2 flex flex-col items-center justify-center min-h-[120px]",
                                                formData.licenseUrl ? "bg-green-50 border-green-300" : "border-[#DEE2E6] hover:border-[#FF6B00] hover:bg-[#FFFBF8]"
                                            )}
                                        >
                                            {uploading["licenseUrl"] ? (
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#FF6B00]" />
                                            ) : formData.licenseUrl ? (
                                                <>
                                                    <CheckCircle2 className="text-green-500 mb-1" size={24} />
                                                    <p className="text-[10px] text-green-600 font-bold uppercase">Uploaded ✓</p>
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="mx-auto text-[#868E96] group-hover:text-[#FF6B00] transition-colors" size={22} />
                                                    <p className="text-xs text-[#868E96] mt-2 font-bold">PDF or Image</p>
                                                    <p className="text-[10px] text-[#ADB5BD]">Click to browse</p>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* GST Certificate */}
                                    <div className="space-y-2 text-center">
                                        <label className="text-sm font-bold text-[#495057]">Upload GST Certificate</label>
                                        <input
                                            type="file"
                                            ref={gstInputRef}
                                            className="hidden"
                                            accept=".pdf,image/*"
                                            onChange={e => handleFileChange(e, "gstCertificateUrl")}
                                        />
                                        <div
                                            onClick={() => gstInputRef.current?.click()}
                                            className={cn(
                                                "border border-dashed rounded-xl p-6 transition-all cursor-pointer group mt-2 flex flex-col items-center justify-center min-h-[120px]",
                                                formData.gstCertificateUrl ? "bg-green-50 border-green-300" : "border-[#DEE2E6] hover:border-[#FF6B00] hover:bg-[#FFFBF8]"
                                            )}
                                        >
                                            {uploading["gstCertificateUrl"] ? (
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#FF6B00]" />
                                            ) : formData.gstCertificateUrl ? (
                                                <>
                                                    <CheckCircle2 className="text-green-500 mb-1" size={24} />
                                                    <p className="text-[10px] text-green-600 font-bold uppercase">Uploaded ✓</p>
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="mx-auto text-[#868E96] group-hover:text-[#FF6B00] transition-colors" size={22} />
                                                    <p className="text-xs text-[#868E96] mt-2 font-bold">PDF or Image</p>
                                                    <p className="text-[10px] text-[#ADB5BD]">Click to browse</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Terms Checkbox */}
                                <label className={cn(
                                    "flex items-start gap-4 p-6 rounded-2xl border cursor-pointer transition-all group",
                                    errors.agreed
                                        ? "border-red-400 bg-red-50/40"
                                        : formData.agreed
                                            ? "border-green-300 bg-green-50/40"
                                            : "border-[#DEE2E6] hover:border-[#FF6B00]"
                                )}>
                                    <input
                                        type="checkbox"
                                        checked={formData.agreed}
                                        onChange={e => {
                                            setField("agreed", e.target.checked)
                                        }}
                                        className="w-6 h-6 rounded border-[#DEE2E6] accent-[#FF6B00] mt-0.5 flex-shrink-0"
                                    />
                                    <div className="flex-1">
                                        <p className="font-bold text-[#1A1A1A]">I agree to Shrimpbite Partner Terms & Supply Policies</p>
                                        <p className="text-sm text-[#868E96] mt-0.5">I certify that all information provided is accurate and legally valid.</p>
                                    </div>
                                </label>
                                <ErrorMsg errors={errors} field="agreed" />
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="pt-10 flex items-center justify-between border-t border-[#E9ECEF]">
                            <button
                                type="button"
                                onClick={handleBack}
                                className={cn(
                                    "flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all",
                                    currentStep === 0 ? "opacity-0 pointer-events-none" : "text-[#495057] hover:bg-[#F1F3F5]"
                                )}
                            >
                                <ArrowLeft size={18} />
                                Back
                            </button>

                            {currentStep < steps.length - 1 ? (
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#1B2D1F] text-white font-bold hover:bg-[#2A3E2D] hover:shadow-xl transition-all"
                                >
                                    Next Step
                                    <ArrowRight size={18} />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={cn(
                                        "flex items-center gap-2 px-10 py-3.5 rounded-xl bg-[#FF6B00] text-white font-bold shadow-lg shadow-[#FF6B00]/20 hover:scale-[1.02] active:scale-[0.98] transition-all",
                                        loading && "opacity-50 cursor-not-allowed"
                                    )}
                                >
                                    {loading ? "Submitting..." : "Submit Application"}
                                    {!loading && <CheckCircle2 size={18} />}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
