export type Role = 'patient' | 'doctor' | 'admin'
export type AppointmentStatus = 'Pending' | 'Confirmed' | 'Checked In' | 'In Consultation' | 'Completed' | 'Cancelled' | 'No Show'
export type PaymentStatus = 'Pending' | 'Paid' | 'Failed' | 'Refunded'

export interface User { id: string; role: Role; name: string; email: string; password: string; phone: string; dob: string; gender?: string; address?: string; city?: string; state?: string; pin?: string; emergencyName?: string; emergencyPhone?: string }
export interface Doctor { id: string; name: string; initials: string; specialty: string; qualification: string; experience: number; fee: number; languages: string[]; location: string; rating: number; availability: string; bio: string; availableDays: number[]; blockedDates: string[] }
export interface Appointment { id: string; patientId?: string; patientName: string; patientEmail: string; doctorId: string; date: string; time: string; fee: number; bookedAt: string; status: AppointmentStatus; reason?: string }
export interface RecordItem { id: string; patientId: string; visitDate: string; doctorId: string; summary: string; diagnosis: string; followUp: string; prescriptionId?: string }
export interface Prescription { id: string; patientId: string; doctorId: string; visitDate: string; medication: string; dosage: string; frequency: string; duration: string; instructions: string; followUp: string }
export interface Invoice { id: string; patientId: string; date: string; dueDate: string; description: string; subtotal: number; discount: number; tax: number; total: number; status: PaymentStatus; history?: { status: string; date: string }[] }
export interface Notification { id: string; userId: string; title: string; body: string; type: string; createdAt: string; read: boolean }
export interface Diagnostic { id: string; name: string; category: string; description: string; price: number; prep: string; availability: string }
export interface Package { id: string; name: string; price: number; description: string; services: string[]; eligibility: string }
export interface DiagnosticBooking { id: string; serviceId: string; patientId?: string; patientName: string; date: string; status: string }
export interface PackageBooking { id: string; packageId: string; patientId?: string; patientName: string; date: string; status: string }
export interface ContactMessage { id: string; name: string; email: string; phone: string; subject: string; message: string; createdAt: string }

export const specialties = ['General Medicine', 'Cardiology', 'Dermatology', 'Orthopedics', 'Pediatrics', 'Neurology', 'Gynecology', 'Dentistry', 'Ophthalmology', 'ENT', 'Psychiatry', 'Physiotherapy']

const doctorNames = ['Aarav Mehta', 'Ishita Rao', 'Rohan Kapoor', 'Meera Nair', 'Kabir Shah', 'Ananya Iyer', 'Vikram Sethi', 'Tara Menon', 'Arjun Bhatia', 'Nisha Verma', 'Rahul Desai', 'Sana Khan']
const doctorQuals = ['MBBS, MD', 'MBBS, DNB', 'MBBS, MS', 'MBBS, DM', 'MBBS, MDS', 'MBBS, DCH']
const bios = ['Known for a calm, patient-first approach and clear explanations.', 'Combines evidence-led care with a warm and reassuring bedside manner.', 'Passionate about preventive care and helping families make informed decisions.']

export const seedDoctors: Doctor[] = doctorNames.map((name, i) => ({
  id: `DOC-${String(i + 1).padStart(3, '0')}`, name, initials: name.split(' ').map(x => x[0]).join(''), specialty: specialties[i],
  qualification: doctorQuals[i % doctorQuals.length], experience: 7 + i * 2, fee: 650 + (i % 4) * 150,
  languages: i % 3 === 0 ? ['English', 'Hindi', 'Marathi'] : i % 3 === 1 ? ['English', 'Hindi', 'Tamil'] : ['English', 'Hindi'],
  location: ['Indiranagar, Bengaluru', 'Bandra West, Mumbai', 'Sector 18, Noida'][i % 3], rating: 4.6 + (i % 4) / 10,
  availability: i % 4 === 0 ? 'Mon, Wed, Fri' : 'Mon – Sat', bio: bios[i % bios.length], availableDays: [1, 2, 3, 4, 5, 6], blockedDates: []
}))

const patientNames = ['Priya Sharma', 'Aditya Jain', 'Neha Gupta', 'Vishal Kumar', 'Sneha Patel', 'Karan Malhotra', 'Divya Reddy', 'Manish Joshi']
export const seedUsers: User[] = [
  { id: 'PAT-001', role: 'patient', name: 'Priya Sharma', email: 'patient@medicare.example', password: 'Patient@123', phone: '9876543210', dob: '1994-07-14', gender: 'Female', address: '12 Lake View Road', city: 'Bengaluru', state: 'Karnataka', pin: '560038', emergencyName: 'Rahul Sharma', emergencyPhone: '9876501234' },
  { id: 'DOC-001', role: 'doctor', name: 'Dr. Aarav Mehta', email: 'doctor@medicare.example', password: 'Doctor@123', phone: '9000000001', dob: '1981-03-11' },
  { id: 'ADM-001', role: 'admin', name: 'MediCare Administrator', email: 'admin@medicare.example', password: 'Admin@12345', phone: '9000000002', dob: '1985-01-01' },
  ...patientNames.slice(1).map((name, i) => ({ id: `PAT-${String(i + 2).padStart(3, '0')}`, role: 'patient' as Role, name, email: `${name.toLowerCase().replace(' ', '.')}@example.com`, password: 'Welcome@123', phone: `98765${String(43210 + i).padStart(5, '0')}`, dob: `199${i % 8}-0${(i % 8) + 1}-1${i + 1}` }))
]

export const seedAppointments: Appointment[] = Array.from({ length: 20 }, (_, i) => {
  const day = 15 + (i % 8)
  const date = `2026-10-${String(day).padStart(2, '0')}`
  const statuses: AppointmentStatus[] = ['Confirmed', 'Completed', 'Pending', 'Checked In', 'Cancelled']
  const p = seedUsers[0]
  return { id: `APT-${String(1001 + i)}`, patientId: seedUsers[(i % 8) + 0].id, patientName: i % 3 === 0 ? p.name : seedUsers[(i % 8) + 3]?.name || p.name, patientEmail: p.email, doctorId: seedDoctors[i % seedDoctors.length].id, date, time: `${9 + (i % 7)}:${i % 2 ? '30' : '00'} AM`, fee: seedDoctors[i % seedDoctors.length].fee, bookedAt: '2026-10-10', status: statuses[i % statuses.length], reason: i % 2 ? 'Routine consultation' : 'Annual health review' }
})

export const seedRecords: RecordItem[] = Array.from({ length: 10 }, (_, i) => ({ id: `REC-${String(1001 + i)}`, patientId: seedUsers[i % 8].id, visitDate: `2026-0${(i % 9) + 1}-1${i % 9}`, doctorId: seedDoctors[i % seedDoctors.length].id, summary: 'Patient reviewed comfortably. Vital signs within expected range. Follow-up discussed.', diagnosis: ['Seasonal allergy', 'Routine wellness review', 'Migraine', 'Vitamin deficiency'][i % 4], followUp: `2026-1${(i % 2) + 1}-15`, prescriptionId: i % 2 === 0 ? `RX-${String(1001 + i)}` : undefined }))
export const seedPrescriptions: Prescription[] = Array.from({ length: 10 }, (_, i) => ({ id: `RX-${String(1001 + i)}`, patientId: seedUsers[i % 8].id, doctorId: seedDoctors[i % seedDoctors.length].id, visitDate: `2026-0${(i % 9) + 1}-1${i % 9}`, medication: ['Cetirizine', 'Vitamin D3', 'Paracetamol', 'Omeprazole'][i % 4], dosage: i % 2 ? '1 tablet' : '5 ml', frequency: 'Once daily after meals', duration: '5 days', instructions: 'Take with water. Follow the instructions provided during your visit.', followUp: '2026-11-15' }))
export const seedInvoices: Invoice[] = Array.from({ length: 10 }, (_, i) => { const sub = 700 + i * 175; const discount = i % 3 === 0 ? 100 : 0; const tax = Math.round((sub - discount) * .05); return { id: `INV-${String(2026 + i)}`, patientId: seedUsers[i % 8].id, date: '2026-10-10', dueDate: `2026-10-${String(18 + (i % 8)).padStart(2, '0')}`, description: i % 2 ? 'Consultation & diagnostic service' : 'Specialist consultation', subtotal: sub, discount, tax, total: sub - discount + tax, status: i % 3 === 0 ? 'Paid' : 'Pending', history: i % 3 === 0 ? [{ status: 'Paid', date: '2026-10-11' }] : [] } })

export const diagnostics: Diagnostic[] = [
  ['Complete Blood Count', 'Pathology', 'Measures key blood cell counts for a general health overview.', 450, 'No fasting required.', 'Mon – Sat'], ['Blood Glucose', 'Pathology', 'A simple glucose screening service.', 250, '8–10 hours fasting recommended.', 'Mon – Sat'], ['Lipid Profile', 'Pathology', 'Cholesterol and triglyceride screening.', 850, '8–10 hours fasting required.', 'Mon – Sat'], ['Thyroid Profile', 'Pathology', 'A standard thyroid hormone screening.', 900, 'No special preparation.', 'Mon – Fri'], ['Liver Function Test', 'Pathology', 'A routine panel for liver health markers.', 1100, 'Avoid heavy meals before visit.', 'Mon – Sat'], ['Kidney Function Test', 'Pathology', 'A routine panel for kidney health markers.', 950, 'No special preparation.', 'Mon – Sat'], ['ECG', 'Imaging & Cardiac', 'A resting heart rhythm assessment.', 650, 'Wear comfortable clothing.', 'Mon – Sat'], ['X-ray', 'Imaging & Cardiac', 'Digital X-ray service for selected body areas.', 1200, 'Bring any previous reports if available.', 'Mon – Fri']
].map((x, i) => ({ id: `DIA-${i + 1}`, name: x[0] as string, category: x[1] as string, description: x[2] as string, price: x[3] as number, prep: x[4] as string, availability: x[5] as string }))

export const packages: Package[] = [
  { id: 'PKG-001', name: 'Basic Health Check', price: 1499, description: 'A simple annual snapshot for everyday wellness.', services: ['Complete Blood Count', 'Blood Glucose', 'Doctor consultation'], eligibility: 'Adults 18+' },
  { id: 'PKG-002', name: 'Heart Health Package', price: 2999, description: 'A thoughtful set of checks for cardiovascular wellness.', services: ['Lipid Profile', 'ECG', 'Blood Glucose', 'Cardiology consultation'], eligibility: 'Adults 30+' },
  { id: 'PKG-003', name: "Women's Wellness Package", price: 3499, description: 'Preventive screening designed around women’s health.', services: ['CBC', 'Thyroid Profile', 'Blood Glucose', 'Gynecology consultation'], eligibility: 'Adults 18+' },
  { id: 'PKG-004', name: 'Senior Wellness Package', price: 3999, description: 'A fuller preventive check for older adults.', services: ['Kidney Function Test', 'Liver Function Test', 'ECG', 'General consultation'], eligibility: 'Adults 60+' },
  { id: 'PKG-005', name: 'Comprehensive Health Check', price: 5499, description: 'Our most complete preventive wellness experience.', services: ['CBC', 'Lipid Profile', 'Thyroid Profile', 'Liver Function Test', 'ECG'], eligibility: 'Adults 18+' }
]

export const emptyState = { appointments: [] as Appointment[], records: [] as RecordItem[], prescriptions: [] as Prescription[], invoices: [] as Invoice[], notifications: [] as Notification[], diagnosticBookings: [] as DiagnosticBooking[], packageBookings: [] as PackageBooking[], contacts: [] as ContactMessage[] }
