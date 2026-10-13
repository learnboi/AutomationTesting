import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { emptyState, seedAppointments, seedDoctors, seedInvoices, seedPrescriptions, seedRecords, seedUsers, type Appointment, type Doctor, type Invoice, type Notification, type Prescription, type RecordItem, type User, type DiagnosticBooking, type PackageBooking, type ContactMessage } from './data'

type Store = {
  users: User[]; doctors: Doctor[]; appointments: Appointment[]; records: RecordItem[]; prescriptions: Prescription[]; invoices: Invoice[]; notifications: Notification[]; diagnosticBookings: DiagnosticBooking[]; packageBookings: PackageBooking[]; contacts: ContactMessage[]; currentUser: User | null
  login: (email: string, password: string) => { ok: boolean; message?: string }; logout: () => void; register: (user: User) => { ok: boolean; message?: string }; updateUser: (user: User) => void
  addAppointment: (appointment: Appointment) => { ok: boolean; message?: string }; updateAppointment: (id: string, patch: Partial<Appointment>) => { ok: boolean; message?: string }; cancelAppointment: (id: string) => void
  addNotification: (userId: string, title: string, body: string, type?: string) => void; markNotification: (id: string) => void; markAllNotifications: (userId: string) => void; clearNotifications: (userId: string) => void
  payInvoice: (id: string, success: boolean) => void; addRecord: (record: RecordItem) => void; addPrescription: (prescription: Prescription) => void; bookDiagnostic: (b: DiagnosticBooking) => void; bookPackage: (b: PackageBooking) => void; addContact: (c: ContactMessage) => void; updateDoctor: (d: Doctor) => void
}

const key = (name: string) => `medicare_plus_${name}`
function read<T>(name: string, fallback: T): T { try { const value = localStorage.getItem(key(name)); return value ? JSON.parse(value) : fallback } catch { return fallback } }
function usePersistent<T>(name: string, initial: T) { const [value, setValue] = useState<T>(() => read(name, initial)); useEffect(() => { localStorage.setItem(key(name), JSON.stringify(value)) }, [name, value]); return [value, setValue] as const }

const StoreContext = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = usePersistent<User[]>('users', seedUsers)
  const [doctors, setDoctors] = usePersistent<Doctor[]>('doctors', seedDoctors)
  const [appointments, setAppointments] = usePersistent<Appointment[]>('appointments', seedAppointments)
  const [records, setRecords] = usePersistent<RecordItem[]>('records', seedRecords)
  const [prescriptions, setPrescriptions] = usePersistent<Prescription[]>('prescriptions', seedPrescriptions)
  const [invoices, setInvoices] = usePersistent<Invoice[]>('invoices', seedInvoices)
  const [notifications, setNotifications] = usePersistent<Notification[]>('notifications', emptyState.notifications)
  const [diagnosticBookings, setDiagnosticBookings] = usePersistent<DiagnosticBooking[]>('diagnosticBookings', emptyState.diagnosticBookings)
  const [packageBookings, setPackageBookings] = usePersistent<PackageBooking[]>('packageBookings', emptyState.packageBookings)
  const [contacts, setContacts] = usePersistent<ContactMessage[]>('contacts', emptyState.contacts)
  const [currentId, setCurrentId] = useState<string | null>(() => localStorage.getItem(key('session')))
  const currentUser = users.find(u => u.id === currentId) || null
  const logout = () => { setCurrentId(null); localStorage.removeItem(key('session')) }
  const login = (email: string, password: string) => { const user = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase()); if (!user) return { ok: false, message: 'We could not find an account with that email.' }; if (user.password !== password) return { ok: false, message: 'The password you entered is incorrect.' }; setCurrentId(user.id); localStorage.setItem(key('session'), user.id); return { ok: true } }
  const register = (user: User) => { if (users.some(u => u.email.toLowerCase() === user.email.toLowerCase())) return { ok: false, message: 'An account with this email already exists.' }; setUsers(prev => [...prev, user]); setCurrentId(user.id); localStorage.setItem(key('session'), user.id); return { ok: true } }
  const updateUser = (user: User) => setUsers(prev => prev.map(u => u.id === user.id ? user : u))
  const addNotification = (userId: string, title: string, body: string, type = 'info') => setNotifications(prev => [{ id: `NOT-${Date.now()}`, userId, title, body, type, createdAt: new Date().toISOString(), read: false }, ...prev])
  const addAppointment = (appointment: Appointment) => { const conflict = appointments.some(a => a.doctorId === appointment.doctorId && a.date === appointment.date && a.time === appointment.time && a.status !== 'Cancelled'); if (conflict) return { ok: false, message: 'That time slot was just booked. Please choose another.' }; setAppointments(prev => [appointment, ...prev]); if (appointment.patientId) addNotification(appointment.patientId, 'Appointment booked', `Your visit with ${doctors.find(d => d.id === appointment.doctorId)?.name || 'your doctor'} is confirmed for ${appointment.date}.`, 'appointment'); return { ok: true } }
  const updateAppointment = (id: string, patch: Partial<Appointment>) => { const existing = appointments.find(a => a.id === id); if (!existing) return { ok: false, message: 'Appointment not found.' }; const next = { ...existing, ...patch }; const conflict = appointments.some(a => a.id !== id && a.doctorId === next.doctorId && a.date === next.date && a.time === next.time && a.status !== 'Cancelled'); if (conflict) return { ok: false, message: 'That time slot is no longer available.' }; setAppointments(prev => prev.map(a => a.id === id ? next : a)); if (existing.patientId && patch.date) addNotification(existing.patientId, 'Appointment rescheduled', `Your appointment is now scheduled for ${next.date} at ${next.time}.`, 'appointment'); return { ok: true } }
  const cancelAppointment = (id: string) => { const a = appointments.find(x => x.id === id); setAppointments(prev => prev.map(x => x.id === id ? { ...x, status: 'Cancelled' } : x)); if (a?.patientId) addNotification(a.patientId, 'Appointment cancelled', `Your appointment ${a.id} has been cancelled.`, 'appointment') }
  const payInvoice = (id: string, success: boolean) => setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status: success ? 'Paid' : 'Failed', history: [...(inv.history || []), { status: success ? 'Paid' : 'Failed', date: new Date().toISOString().slice(0, 10) }] } : inv))
  const value = useMemo<Store>(() => ({ users, doctors, appointments, records, prescriptions, invoices, notifications, diagnosticBookings, packageBookings, contacts, currentUser, login, logout, register, updateUser, addAppointment, updateAppointment, cancelAppointment, addNotification, markNotification: id => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n)), markAllNotifications: userId => setNotifications(prev => prev.map(n => n.userId === userId ? { ...n, read: true } : n)), clearNotifications: userId => setNotifications(prev => prev.filter(n => n.userId !== userId)), payInvoice, addRecord: r => setRecords(prev => [r, ...prev]), addPrescription: p => setPrescriptions(prev => [p, ...prev]), bookDiagnostic: b => setDiagnosticBookings(prev => [b, ...prev]), bookPackage: b => setPackageBookings(prev => [b, ...prev]), addContact: c => setContacts(prev => [c, ...prev]), updateDoctor: d => setDoctors(prev => prev.map(x => x.id === d.id ? d : x)) }), [users, doctors, appointments, records, prescriptions, invoices, notifications, diagnosticBookings, packageBookings, contacts, currentUser])
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}
export function useStore() { const value = useContext(StoreContext); if (!value) throw new Error('useStore must be used within StoreProvider'); return value }
