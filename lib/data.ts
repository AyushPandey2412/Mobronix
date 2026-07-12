import type {
  Model,
  ModelCategory,
  Question,
  PhotoSlot,
  Enquiry,
  Review,
  EnquiryStatus,
} from "./types";
import { ENQUIRY_STATUS_LABELS, TRACKING_STEPS } from "./enquiryStatus";

export const SERIES = [
  "All",
  "Air Series",
  "17 Series",
  "16 Series",
  "15 Series",
  "14 Series",
  "13 Series",
  "12 Series",
  "11 Series",
  "X Series",
  "SE Series",
];

export const MAC_SERIES = [
  "All",
  "MacBook Air",
  "MacBook Pro 13\"",
  "MacBook Pro 14\"",
  "MacBook Pro 16\"",
];

export const MODELS: Model[] = [
  { id: "17promax", name: "iPhone 17 Pro Max", series: "17 Series", category: "iphone" as const, storages: { "128GB": 95000, "256GB": 105000, "512GB": 120000 } },
  { id: "17pro", name: "iPhone 17 Pro", series: "17 Series", category: "iphone" as const, storages: { "128GB": 85000, "256GB": 95000, "512GB": 108000 } },
  { id: "17", name: "iPhone 17", series: "17 Series", category: "iphone" as const, storages: { "128GB": 65000, "256GB": 73000, "512GB": 85000 } },
  { id: "17e", name: "iPhone 17e", series: "17 Series", category: "iphone" as const, storages: { "128GB": 48000, "256GB": 55000 } },
  { id: "air", name: "iPhone Air", series: "Air Series", category: "iphone" as const, storages: { "128GB": 78000, "256GB": 88000, "512GB": 98000 } },
  { id: "16promax", name: "iPhone 16 Pro Max", series: "16 Series", category: "iphone" as const, storages: { "128GB": 80000, "256GB": 90000, "512GB": 100000 } },
  { id: "16pro", name: "iPhone 16 Pro", series: "16 Series", category: "iphone" as const, storages: { "128GB": 70000, "256GB": 78000, "512GB": 88000 } },
  { id: "16plus", name: "iPhone 16 Plus", series: "16 Series", category: "iphone" as const, storages: { "128GB": 58000, "256GB": 65000, "512GB": 75000 } },
  { id: "16", name: "iPhone 16", series: "16 Series", category: "iphone" as const, storages: { "128GB": 50000, "256GB": 57000, "512GB": 65000 } },
  { id: "16e", name: "iPhone 16e", series: "16 Series", category: "iphone" as const, storages: { "128GB": 40000, "256GB": 46000 } },
  { id: "15promax", name: "iPhone 15 Pro Max", series: "15 Series", category: "iphone" as const, storages: { "128GB": 65000, "256GB": 72000, "512GB": 82000 } },
  { id: "15pro", name: "iPhone 15 Pro", series: "15 Series", category: "iphone" as const, storages: { "128GB": 55000, "256GB": 62000, "512GB": 70000 } },
  { id: "15plus", name: "iPhone 15 Plus", series: "15 Series", category: "iphone" as const, storages: { "128GB": 45000, "256GB": 51000, "512GB": 58000 } },
  { id: "15", name: "iPhone 15", series: "15 Series", category: "iphone" as const, storages: { "128GB": 40000, "256GB": 45000, "512GB": 52000 } },
  { id: "14promax", name: "iPhone 14 Pro Max", series: "14 Series", category: "iphone" as const, storages: { "128GB": 50000, "256GB": 56000, "512GB": 64000 } },
  { id: "14pro", name: "iPhone 14 Pro", series: "14 Series", category: "iphone" as const, storages: { "128GB": 43000, "256GB": 48000, "512GB": 55000 } },
  { id: "14plus", name: "iPhone 14 Plus", series: "14 Series", category: "iphone" as const, storages: { "128GB": 36000, "256GB": 41000, "512GB": 47000 } },
  { id: "14", name: "iPhone 14", series: "14 Series", category: "iphone" as const, storages: { "128GB": 32000, "256GB": 36000, "512GB": 42000 } },
  { id: "se2022", name: "iPhone SE 2022", series: "SE Series", category: "iphone" as const, storages: { "64GB": 18000, "128GB": 21000 } },
  { id: "13promax", name: "iPhone 13 Pro Max", series: "13 Series", category: "iphone" as const, storages: { "128GB": 38000, "256GB": 43000, "512GB": 50000 } },
  { id: "13pro", name: "iPhone 13 Pro", series: "13 Series", category: "iphone" as const, storages: { "128GB": 33000, "256GB": 37000, "512GB": 43000 } },
  { id: "13mini", name: "iPhone 13 Mini", series: "13 Series", category: "iphone" as const, storages: { "128GB": 24000, "256GB": 27000 } },
  { id: "13", name: "iPhone 13", series: "13 Series", category: "iphone" as const, storages: { "128GB": 27000, "256GB": 30000, "512GB": 35000 } },
  { id: "12promax", name: "iPhone 12 Pro Max", series: "12 Series", category: "iphone" as const, storages: { "128GB": 28000, "256GB": 32000, "512GB": 37000 } },
  { id: "12pro", name: "iPhone 12 Pro", series: "12 Series", category: "iphone" as const, storages: { "128GB": 24000, "256GB": 27000, "512GB": 32000 } },
  { id: "12mini", name: "iPhone 12 Mini", series: "12 Series", category: "iphone" as const, storages: { "128GB": 18000, "256GB": 21000 } },
  { id: "12", name: "iPhone 12", series: "12 Series", category: "iphone" as const, storages: { "128GB": 21000, "256GB": 24000, "512GB": 28000 } },
  { id: "se2020", name: "iPhone SE 2020", series: "SE Series", category: "iphone" as const, storages: { "64GB": 10000, "128GB": 12000 } },
  { id: "11promax", name: "iPhone 11 Pro Max", series: "11 Series", category: "iphone" as const, storages: { "64GB": 20000, "256GB": 24000 } },
  { id: "11pro", name: "iPhone 11 Pro", series: "11 Series", category: "iphone" as const, storages: { "64GB": 17000, "256GB": 20000 } },
  { id: "11", name: "iPhone 11", series: "11 Series", category: "iphone" as const, storages: { "64GB": 13000, "128GB": 15000, "256GB": 17000 } },
  { id: "xsmax", name: "iPhone XS Max", series: "X Series", category: "iphone" as const, storages: { "64GB": 11000, "256GB": 13000 } },
  { id: "xs", name: "iPhone XS", series: "X Series", category: "iphone" as const, storages: { "64GB": 9000, "256GB": 11000 } },
  { id: "xr", name: "iPhone XR", series: "X Series", category: "iphone" as const, storages: { "64GB": 8000, "128GB": 9500, "256GB": 11000 } },
  { id: "x", name: "iPhone X", series: "X Series", category: "iphone" as const, storages: { "64GB": 7000, "256GB": 8500 } },
];

export const QUESTIONS: Question[] = [
  { type: "single", q: "Does the phone power on?", sub: "Basic power check", opts: [
    { label: "Yes", factor: 1.0 },
    { label: "No", factor: 0.3 },
  ] },
  { type: "single", q: "Can you make and receive calls?", sub: "Calling functionality", opts: [
    { label: "Yes", factor: 1.0 },
    { label: "No", factor: 0.85 },
  ] },
  { type: "single", q: "How old is the device?", sub: "Approximate age since purchase", opts: [
    { label: "0–3 months", factor: 1.05 },
    { label: "3–6 months", factor: 1.02 },
    { label: "6–9 months", factor: 0.98 },
    { label: "9–12 months", factor: 0.94 },
    { label: "More than 12 months (Out of Warranty)", factor: 0.88 },
  ] },
  { type: "single", q: "Is the screen original?", sub: "Original Apple display vs replaced", opts: [
    { label: "Yes", factor: 1.0 },
    { label: "No", factor: 0.85 },
    { label: "Not Sure", factor: 0.92 },
  ] },
  { type: "single", q: "Is the screen working properly?", sub: "Touch response and display", opts: [
    { label: "Yes", factor: 1.0 },
    { label: "No", factor: 0.5 },
  ] },
  { type: "single", q: "Screen condition", sub: "Select the option that best matches", opts: [
    { label: "No issues (Clean condition)", factor: 1.0 },
    { label: "Minor scratches", factor: 0.95 },
    { label: "Major scratches", factor: 0.88 },
    { label: "Cracked screen / Lines / Spots", factor: 0.65 },
    { label: "Touch glass replaced", factor: 0.8 },
    { label: "Duplicate display installed / unknown display", factor: 0.7 },
    { label: "Blank display", factor: 0.5 },
  ] },
  { type: "multi", q: "Body condition", sub: "Select all that apply", exclusive: "No issues (Clean condition)", opts: [
    { label: "No issues (Clean condition)", factor: 1.0 },
    { label: "Minor dents", factor: 0.95 },
    { label: "Major dents", factor: 0.85 },
    { label: "Color faded / worn out", factor: 0.93 },
    { label: "Back glass damaged", factor: 0.85 },
    { label: "Frame (enclosure) damaged", factor: 0.8 },
    { label: "Camera glass damaged", factor: 0.85 },
    { label: "Device bent", factor: 0.6 },
    { label: "Duplicate back glass installed", factor: 0.85 },
  ] },
  { type: "matrix", q: "Device functions", sub: "Select Yes or No for each function", items: [
    { label: "Wi-Fi", yesFactor: 1.0, noFactor: 0.85 },
    { label: "Bluetooth", yesFactor: 1.0, noFactor: 0.92 },
    { label: "Speaker", yesFactor: 1.0, noFactor: 0.88 },
    { label: "Earpiece Speaker", yesFactor: 1.0, noFactor: 0.9 },
    { label: "Face ID", yesFactor: 1.0, noFactor: 0.85 },
    { label: "GPS", yesFactor: 1.0, noFactor: 0.93 },
    { label: "Flashlight", yesFactor: 1.0, noFactor: 0.96 },
    { label: "Wireless Charging", yesFactor: 1.0, noFactor: 0.93 },
    { label: "Normal Charging", yesFactor: 1.0, noFactor: 0.7 },
    { label: "Panic Error Present", yesFactor: 0.7, noFactor: 1.0 },
    { label: "SIM Lock", yesFactor: 0.6, noFactor: 1.0 },
    { label: "Power Button", yesFactor: 1.0, noFactor: 0.85 },
    { label: "Volume Buttons", yesFactor: 1.0, noFactor: 0.93 },
    { label: "Silent Switch", yesFactor: 1.0, noFactor: 0.96 },
    { label: "Vibration", yesFactor: 1.0, noFactor: 0.95 },
  ] },
  { type: "single", q: "Rear camera condition", sub: "Back camera check", opts: [
    { label: "Working properly (No issues)", factor: 1.0 },
    { label: "Spots, lines, blur or color issues", factor: 0.85 },
    { label: "Not working", factor: 0.7 },
    { label: 'Camera shows "Unknown Part" message', factor: 0.75 },
  ] },
  { type: "single", q: "Front camera condition", sub: "Selfie camera check", opts: [
    { label: "Working properly (No issues)", factor: 1.0 },
    { label: "Spots, lines, blur or color issues", factor: 0.92 },
    { label: "Not working", factor: 0.85 },
    { label: 'Camera shows "Unknown Part" message', factor: 0.88 },
  ] },
  { type: "single", q: "Battery type", sub: "Is the battery original?", opts: [
    { label: "Original / Genuine", factor: 1.0 },
    { label: "Duplicate / Unknown", factor: 0.85 },
    { label: "Used / Replaced", factor: 0.9 },
    { label: "Battery Swollen", factor: 0.5 },
  ] },
  { type: "single", q: "Battery health", sub: "Settings → Battery → Battery Health", opts: [
    { label: "96%–100%", factor: 1.0 },
    { label: "91%–95%", factor: 0.97 },
    { label: "86%–90%", factor: 0.93 },
    { label: "81%–85%", factor: 0.88 },
    { label: "Below 80%", factor: 0.78 },
  ] },
  { type: "multi", q: "Accessories available", sub: "Select all that you have", opts: [
    { label: "Original Bill / Invoice (IMEI Match)", factor: 1.02 },
    { label: "Original Box", factor: 1.02 },
    { label: "Original Charger Adapter", factor: 1.02 },
    { label: "Charging Cable", factor: 1.02 },
  ] },
];

export const PHOTO_SLOTS: PhotoSlot[] = [
  { id: "front", label: "Front View", hint: "Clear photo of the front screen, switched on" },
  { id: "back", label: "Back View", hint: "Clear photo of the back panel" },
  { id: "settings", label: "Settings → About", hint: "Screenshot showing model, storage & serial number" },
  { id: "left", label: "Left Side", hint: "Side with volume buttons & SIM tray" },
  { id: "right", label: "Right Side", hint: "Side with the power button" },
];

// Single source of truth lives in lib/types (TRACKING_STEPS) so admin + customer
// always render the same stage for a given tracking_step.
export const TRACK_STEPS: string[] = [...TRACKING_STEPS];

export const TRACK_SHORT = ["New", "Contacted", "Pickup", "Inspect", "Price", "Paid", "Done", "Cancelled"];

export const TRACK_DESC: Record<string, string> = {
  "New": "Your enquiry has been received and is in our queue.",
  "Contacted": "Our spokesperson has contacted you or will call shortly to verify device details.",
  "Pickup Scheduled": "Our executive will visit your home or office during the confirmed slot.",
  "Inspection": "Your device is being inspected in person before final confirmation.",
  "Price Confirmed": "Final price confirmed with you based on inspection and condition.",
  "Payment Completed": "Payment has been completed.",
  "Completed": "The sale is complete.",
  "Cancelled": "This enquiry has been cancelled.",
};

export const SLOTS = [
  "Today, 4–6 PM",
  "Today, 6–8 PM",
  "Tomorrow, 10 AM–12 PM",
  "Tomorrow, 2–4 PM",
];

export const EXECUTIVES = ["Rohit Sharma", "Vikas Pawar", "Sandeep Kulkarni", "Imran Sheikh"];

export const REVIEWS: Review[] = [
  { name: "Aditi R.", city: "Andheri", rating: 5, text: "Quote matched what I got paid. Pickup was on time and the executive was polite." },
  { name: "Mohit V.", city: "Vashi", rating: 5, text: "Sold my old iPhone 13 in under an hour, paid via UPI on the spot." },
  { name: "Fatima K.", city: "Thane", rating: 4, text: "Smooth process end to end. Price dropped slightly after inspection but they explained why clearly." },
];

export const SEED_ENQUIRIES: Enquiry[] = [
  { id: "ENQ73210", name: "Aarav Shah", mobile: "9821034567", address: "B-204, Lotus Heights, Andheri West", pincode: "400058", model: "iPhone 15 Pro", storage: "256GB", amount: 58000, slot: "Today, 4–6 PM", pay: "UPI", step: 0, status: "new", note: "", createdAt: "2026-06-21T10:12:00", answers: {}, history: [{ ts: "2026-06-21T10:12:00", action: "Enquiry submitted" }] },
  { id: "ENQ73198", name: "Priya Nair", mobile: "9988776655", address: "Flat 12, Sea Pearl CHS, Vashi", pincode: "400703", model: "iPhone 14", storage: "128GB", amount: 30500, slot: "Tomorrow, 10 AM–12 PM", pay: "Cash", step: 4, status: "price_confirmed", note: "Customer confirmed price on call, screen has minor scratches.", createdAt: "2026-06-20T15:40:00", answers: {}, history: [{ ts: "2026-06-20T15:40:00", action: "Enquiry submitted" }, { ts: "2026-06-20T17:05:00", action: "Status changed to Price Confirmed" }] },
  { id: "ENQ73150", name: "Karan Mehta", mobile: "9112233445", address: "203, Riverside Towers, Thane West", pincode: "400601", model: "iPhone 13", storage: "128GB", amount: 25500, slot: "Today, 6–8 PM", pay: "UPI", step: 2, status: "pickup_scheduled", note: "Executive assigned: Rohit Sharma.", createdAt: "2026-06-19T09:05:00", answers: {}, exec: "Rohit Sharma", history: [{ ts: "2026-06-19T09:05:00", action: "Enquiry submitted" }, { ts: "2026-06-19T11:30:00", action: "Status changed to Pickup Scheduled" }] },
  { id: "ENQ73088", name: "Sneha Iyer", mobile: "9871122334", address: "45/2, Powai Garden, Powai", pincode: "400076", model: "iPhone 16 Pro Max", storage: "256GB", amount: 88500, slot: "Tomorrow, 2–4 PM", pay: "Cash", step: 4, status: "completed", note: "Paid in cash on inspection, device matched description.", createdAt: "2026-06-17T13:20:00", answers: {}, history: [{ ts: "2026-06-17T13:20:00", action: "Enquiry submitted" }, { ts: "2026-06-17T16:10:00", action: "Status changed to Completed, step set to Payment Completed" }] },
];


export const MACBOOK_MODELS: Model[] = [
  // MacBook Air (M-series)
  { id: "mba-m4", name: "MacBook Air 13\" M4", series: "MacBook Air", category: "macbook", chips: ["M4"], storages: { "M4": { "256GB": 85000, "512GB": 95000, "1TB": 110000 } } },
  { id: "mba-m3", name: "MacBook Air 13\" M3", series: "MacBook Air", category: "macbook", chips: ["M3"], storages: { "M3": { "256GB": 72000, "512GB": 82000, "1TB": 94000 } } },
  { id: "mba15-m3", name: "MacBook Air 15\" M3", series: "MacBook Air", category: "macbook", chips: ["M3"], storages: { "M3": { "256GB": 78000, "512GB": 88000, "1TB": 100000 } } },
  { id: "mba-m2", name: "MacBook Air 13\" M2", series: "MacBook Air", category: "macbook", chips: ["M2"], storages: { "M2": { "256GB": 60000, "512GB": 70000, "1TB": 80000 } } },
  { id: "mba15-m2", name: "MacBook Air 15\" M2", series: "MacBook Air", category: "macbook", chips: ["M2"], storages: { "M2": { "256GB": 65000, "512GB": 74000, "1TB": 85000 } } },
  { id: "mba-m1", name: "MacBook Air M1", series: "MacBook Air", category: "macbook", chips: ["M1"], storages: { "M1": { "256GB": 42000, "512GB": 52000, "1TB": 62000 } } },
  { id: "mba-intel", name: "MacBook Air (Intel, 2020)", series: "MacBook Air", category: "macbook", storages: { "256GB": 25000, "512GB": 32000, "1TB": 40000 } },
  // MacBook Pro 13"
  { id: "mbp13-m2", name: "MacBook Pro 13\" M2", series: "MacBook Pro 13\"", category: "macbook", chips: ["M2"], storages: { "M2": { "256GB": 55000, "512GB": 65000, "1TB": 75000 } } },
  { id: "mbp13-m1", name: "MacBook Pro 13\" M1", series: "MacBook Pro 13\"", category: "macbook", chips: ["M1"], storages: { "M1": { "256GB": 46000, "512GB": 56000 } } },
  // MacBook Pro 14"
  { id: "mbp14-m4pro", name: "MacBook Pro 14\" M4 Pro", series: "MacBook Pro 14\"", category: "macbook", chips: ["M4 Pro"], storages: { "M4 Pro": { "512GB": 130000, "1TB": 148000 } } },
  { id: "mbp14-m4", name: "MacBook Pro 14\" M4", series: "MacBook Pro 14\"", category: "macbook", chips: ["M4"], storages: { "M4": { "512GB": 108000, "1TB": 120000 } } },
  { id: "mbp14-m3pro", name: "MacBook Pro 14\" M3 Pro", series: "MacBook Pro 14\"", category: "macbook", chips: ["M3 Pro"], storages: { "M3 Pro": { "512GB": 115000, "1TB": 130000 } } },
  { id: "mbp14-m3", name: "MacBook Pro 14\" M3", series: "MacBook Pro 14\"", category: "macbook", chips: ["M3"], storages: { "M3": { "512GB": 95000, "1TB": 108000 } } },
  { id: "mbp14-m2pro", name: "MacBook Pro 14\" M2 Pro", series: "MacBook Pro 14\"", category: "macbook", chips: ["M2 Pro"], storages: { "M2 Pro": { "512GB": 98000, "1TB": 112000 } } },
  { id: "mbp14-m1pro", name: "MacBook Pro 14\" M1 Pro", series: "MacBook Pro 14\"", category: "macbook", chips: ["M1 Pro"], storages: { "M1 Pro": { "512GB": 82000, "1TB": 95000 } } },
  // MacBook Pro 16"
  { id: "mbp16-m4pro", name: "MacBook Pro 16\" M4 Pro", series: "MacBook Pro 16\"", category: "macbook", chips: ["M4 Pro"], storages: { "M4 Pro": { "512GB": 155000, "1TB": 175000 } } },
  { id: "mbp16-m3pro", name: "MacBook Pro 16\" M3 Pro", series: "MacBook Pro 16\"", category: "macbook", chips: ["M3 Pro"], storages: { "M3 Pro": { "512GB": 135000, "1TB": 150000 } } },
  { id: "mbp16-m2pro", name: "MacBook Pro 16\" M2 Pro", series: "MacBook Pro 16\"", category: "macbook", chips: ["M2 Pro"], storages: { "M2 Pro": { "512GB": 118000, "1TB": 132000 } } },
  { id: "mbp16-m1pro", name: "MacBook Pro 16\" M1 Pro", series: "MacBook Pro 16\"", category: "macbook", chips: ["M1 Pro"], storages: { "M1 Pro": { "512GB": 95000, "1TB": 110000 } } },
];


export const MAC_QUESTIONS: Question[] = [
  { type: "single", q: "Does the MacBook power on?", sub: "Basic power check", opts: [
    { label: "Yes", factor: 1.0 },
    { label: "No", factor: 0.25 },
  ] },
  { type: "single", q: "How old is the device?", sub: "Approximate age since purchase", opts: [
    { label: "0–6 months", factor: 1.03 },
    { label: "6–12 months", factor: 0.97 },
    { label: "1–2 years", factor: 0.90 },
    { label: "2–3 years", factor: 0.82 },
    { label: "More than 3 years", factor: 0.72 },
  ] },
  { type: "single", q: "Display condition", sub: "Check for dead pixels, lines, yellowing", opts: [
    { label: "No issues (Perfect)", factor: 1.0 },
    { label: "Minor scratches (under screen protector)", factor: 0.97 },
    { label: "Dead pixels / lines / spots", factor: 0.72 },
    { label: "Cracked screen", factor: 0.55 },
  ] },
  { type: "single", q: "Keyboard condition", sub: "All keys working?", opts: [
    { label: "All keys working perfectly", factor: 1.0 },
    { label: "1–2 keys not working", factor: 0.88 },
    { label: "Multiple keys not working", factor: 0.72 },
  ] },
  { type: "multi", q: "Body condition", sub: "Select all that apply", exclusive: "No issues (Clean condition)", opts: [
    { label: "No issues (Clean condition)", factor: 1.0 },
    { label: "Minor scratches / scuffs", factor: 0.95 },
    { label: "Deep dents", factor: 0.85 },
    { label: "Cracked casing", factor: 0.70 },
    { label: "Trackpad damaged", factor: 0.85 },
  ] },
  { type: "matrix", q: "Functions check", sub: "Select Yes or No for each", items: [
    { label: "Wi-Fi", yesFactor: 1.0, noFactor: 0.85 },
    { label: "Bluetooth", yesFactor: 1.0, noFactor: 0.92 },
    { label: "Speakers", yesFactor: 1.0, noFactor: 0.88 },
    { label: "Camera", yesFactor: 1.0, noFactor: 0.93 },
    { label: "USB-C / Thunderbolt ports", yesFactor: 1.0, noFactor: 0.85 },
    { label: "MagSafe charging", yesFactor: 1.0, noFactor: 0.88 },
    { label: "Touch ID", yesFactor: 1.0, noFactor: 0.90 },
  ] },
  { type: "single", q: "Battery health", sub: "System Report → Power → Cycle Count", opts: [
    { label: "Under 200 cycles (Excellent)", factor: 1.0 },
    { label: "200–400 cycles (Good)", factor: 0.95 },
    { label: "400–600 cycles (Fair)", factor: 0.88 },
    { label: "Over 600 cycles (Replace soon)", factor: 0.78 },
    { label: "Not sure", factor: 0.92 },
  ] },
  { type: "multi", q: "Accessories available", sub: "Select all that you have", opts: [
    { label: "Original box", factor: 1.02 },
    { label: "Original charger (USB-C / MagSafe)", factor: 1.02 },
    { label: "Original invoice / bill", factor: 1.02 },
  ] },
];

export function getModel(id: string | null) {
  if (!id) return undefined;
  return [...MODELS, ...MACBOOK_MODELS].find((m) => m.id === id);
}

// ─── Async accessors for the SEO landing pages + category wizard ─────────────
// Return the local seed data with a derived slug / is_active default so the
// landing routes (which expect Supabase-shaped models) work in fallback mode.
// Kept async so callers can `await` them uniformly whether or not Supabase is wired.
function withSlug(m: Model): Model {
  return {
    ...m,
    slug: m.slug ?? m.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    is_active: m.is_active ?? true,
  };
}

export async function getModels(category?: ModelCategory): Promise<Model[]> {
  const all = [...MODELS, ...MACBOOK_MODELS].map(withSlug);
  return category ? all.filter((m) => (m.category ?? "iphone") === category) : all;
}

export async function getModelBySlug(slug: string): Promise<Model | undefined> {
  const all = await getModels();
  return all.find((m) => m.slug === slug || m.id === slug);
}

export async function getQuestions(category?: ModelCategory): Promise<Question[]> {
  return category === "macbook" ? MAC_QUESTIONS : QUESTIONS;
}

export async function getReviews(): Promise<Review[]> {
  return REVIEWS;
}

const STATUS_CLASS: Record<EnquiryStatus, string> = {
  new: "warning",
  contacted: "info",
  pickup_scheduled: "info",
  inspection: "warning",
  price_confirmed: "warning",
  payment_completed: "success",
  completed: "success",
  cancelled: "neutral",
};

const STATUS_LABEL: Record<EnquiryStatus, string> = ENQUIRY_STATUS_LABELS;

export function statusIntent(s: EnquiryStatus) {
  return STATUS_CLASS[s] ?? "neutral";
}
export function statusLabel(s: EnquiryStatus) {
  return STATUS_LABEL[s] ?? s;
}

// ─── Homepage content arrays ─────────────────────────────────────────────────
// Exported so both the server page.tsx and HomePageClient can import them.

import { BadgeIndianRupee, PhoneCall, Truck, PackageCheck, ScanLine, Wallet } from "lucide-react"

export const STEPS = [
  { icon: BadgeIndianRupee, title: "Check your price", text: "Select your model, storage and condition to get an instant estimate." },
  { icon: PhoneCall,        title: "We call to confirm", text: "Our spokesperson verifies details and finalises the price with you." },
  { icon: Truck,            title: "We come to you",   text: "An executive visits your home or office to inspect the device in person." },
  { icon: PackageCheck,     title: "Get paid instantly", text: "Receive payment on the spot via UPI, bank transfer, or cash." },
]

export const WHY = [
  { icon: BadgeIndianRupee, title: "Best price",      text: "Highest market value, guaranteed." },
  { icon: Truck,            title: "Free pickup",     text: "Doorstep pickup, no charges." },
  { icon: Wallet,           title: "Instant payment", text: "UPI or cash, paid on the spot." },
  { icon: ScanLine,         title: "IMEI checked",    text: "Safe & verified transactions." },
]

export const TIPS = [
  { title: "Back up & reset",      text: "Back up data and factory reset just before handover for a faster inspection." },
  { title: "Include accessories",  text: "Original charger and box can increase your final offer." },
  { title: "Remove case & guard",  text: "This allows for an accurate condition assessment." },
  { title: "Be accurate",          text: "Honest answers in the condition check keep your quote matching the final offer." },
]

export const FAQS = [
  { q: "How do you decide the price?",   a: "We calculate your price based on model, storage, battery health, and overall condition compared to current market value." },
  { q: "Do you buy damaged iPhones?",    a: "Yes, we accept devices in all conditions — the price will vary based on the damage." },
  { q: "Is payment instant?",            a: "Yes, payment is made instantly via UPI or cash right after inspection at pickup." },
  { q: "What documents are required?",   a: "A government-approved, self-attested ID proof is required to complete the transaction." },
  { q: "What happens to my personal data?", a: "We perform a secure factory reset and data wipe in front of you at the time of pickup." },
]

export const STATS = [
  { value: "12,400+",  label: "Devices purchased" },
  { value: "4.8 / 5", label: "Average rating" },
  { value: "Same-day", label: "Instant payout" },
]
