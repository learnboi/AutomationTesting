import { useEffect, useState } from 'react'
import { sendPasswordResetEmail } from 'firebase/auth'
import { AlertCircle, ArrowRight, ChevronLeft, Heart, LogOut, MapPin, Package, UserRound } from 'lucide-react'
import { auth, firebaseConfigured } from './firebase'

type AccountProps = {
  currentUser?: any
  orders: any[]
  saveUser: (user: any) => void
  go: (path: string) => void
  notify: (message: string, kind?: 'success' | 'error') => void
  onLogout: () => void | Promise<void>
}

const Button = ({ children, variant = 'primary', ...props }: any) => <button {...props} className={`btn ${variant} ${props.className || ''}`}>{children}</button>

export function Forgot({ go, notify }: { go: (path: string) => void; notify: (message: string, kind?: 'success' | 'error') => void }) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    const normalizedEmail = email.trim().toLowerCase()
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      setError('Enter a valid email address.')
      return
    }
    if (!auth || !firebaseConfigured) {
      setError('Firebase Authentication is not configured for this deployment.')
      return
    }
    setBusy(true)
    try {
      await sendPasswordResetEmail(auth, normalizedEmail)
      setSent(true)
      notify('Password reset email sent.')
    } catch (resetError) {
      const code = (resetError as { code?: string })?.code
      setError(code === 'auth/user-not-found' ? 'We could not find an account with that email.' : 'Unable to send the reset email. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return <section className="simple-page"><div className="simple-box"><div className="auth-heading"><span className="eyebrow">ACCOUNT RECOVERY</span><h1>Reset your password</h1><p>{sent ? 'Check your inbox for a secure Firebase password reset link.' : 'Enter your account email and we’ll send you a secure reset link.'}</p></div>{sent ? <Button className="full" onClick={() => go('/login')}>Back to sign in <ArrowRight size={16} /></Button> : <form onSubmit={submit}><label>Email address<input type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" /></label>{error && <div className="form-error"><AlertCircle size={16} />{error}</div>}<Button type="submit" className="full" disabled={busy}>{busy ? 'Sending…' : 'Send reset email'} <ArrowRight size={16} /></Button></form>}<button className="back-link centered" onClick={() => go('/login')}><ChevronLeft size={16} /> Back to sign in</button></div></section>
}

export function Account({ currentUser, orders, saveUser, go, notify, onLogout }: AccountProps) {
  const [tab, setTab] = useState('overview')
  const [profile, setProfile] = useState({ name: currentUser?.name || '', email: currentUser?.email || '', phone: currentUser?.phone || '' })
  const [address, setAddress] = useState({ recipient: currentUser?.name || '', phone: currentUser?.phone || '', street: '', city: '', state: '', postal: '' })

  useEffect(() => {
    if (!currentUser) return
    setProfile({ name: currentUser.name, email: currentUser.email, phone: currentUser.phone })
    setAddress(value => ({ ...value, recipient: currentUser.name, phone: currentUser.phone }))
  }, [currentUser?.id, currentUser?.name, currentUser?.email, currentUser?.phone])

  if (!currentUser) return <section className="section empty-page"><span className="empty-icon"><UserRound /></span><h1>Sign in to view your account.</h1><Button onClick={() => go('/login')}>Sign in <ArrowRight size={16} /></Button></section>

  const mine = orders.filter(order => order.userId === currentUser.id)
  const saveProfile = () => {
    if (!profile.name.trim() || !/^\S+@\S+\.\S+$/.test(profile.email)) {
      notify('Please check your profile details.', 'error')
      return
    }
    saveUser({ ...currentUser, ...profile })
    notify('Profile updated')
  }
  const addAddress = () => {
    if (!address.recipient || !address.street || !address.city || !address.state || !address.postal) {
      notify('Complete all address fields first.', 'error')
      return
    }
    saveUser({ ...currentUser, addresses: [...currentUser.addresses, { ...address, id: `a${Date.now()}`, isDefault: !currentUser.addresses.length }] })
    setAddress({ ...address, street: '', city: '', state: '', postal: '' })
    notify('Address saved')
  }

  return <section className="section account-page"><div className="account-welcome"><div><span className="eyebrow">YOUR CARTOVA</span><h1>Hello, {currentUser.name.split(' ')[0]}.</h1></div><span className="account-avatar">{currentUser.name.slice(0, 2).toUpperCase()}</span></div><div className="account-layout"><aside className="account-nav">{[['overview', 'Overview', UserRound], ['orders', 'My orders', Package], ['addresses', 'Addresses', MapPin], ['profile', 'Profile', UserRound]].map(([id, label, Icon]: any) => <button className={tab === id ? 'active' : ''} key={id} onClick={() => setTab(id)}><Icon size={17} /> {label}</button>)}<button className="account-logout" onClick={onLogout}><LogOut size={17} /> Sign out</button></aside><div className="account-main">{tab === 'overview' && <><div className="account-stats"><div><Package /><b>{mine.length}</b><small>Orders placed</small></div><div><Heart /><b>{currentUser.wishlist.length}</b><small>Saved items</small></div><div><MapPin /><b>{currentUser.addresses.length}</b><small>Saved addresses</small></div></div><div className="account-panel"><div className="panel-head"><div><span className="eyebrow">RECENT ACTIVITY</span><h2>Your latest orders</h2></div></div>{mine.length ? mine.slice(-3).reverse().map(order => <div className="order-row" key={order.id}><span className="order-icon"><Package size={18} /></span><span><b>#{order.id}</b><small>{new Date(order.date).toLocaleDateString('en-IN')}</small></span><em className="confirmed">{order.status}</em></div>) : <div className="small-empty"><Package /><p>Your first order is waiting to happen.</p><Button variant="soft" onClick={() => go('/shop')}>Start shopping</Button></div>}</div></>}{tab === 'orders' && <div className="account-panel"><div className="panel-head"><div><span className="eyebrow">YOUR HISTORY</span><h2>My orders</h2></div></div>{mine.length ? mine.slice().reverse().map(order => <div className="order-row" key={order.id}><span className="order-icon"><Package size={18} /></span><span><b>#{order.id}</b><small>{new Date(order.date).toLocaleDateString('en-IN')}</small></span><em className="confirmed">{order.status}</em></div>) : <div className="small-empty"><Package /><p>No orders yet.</p></div>}</div>}{tab === 'addresses' && <div className="account-panel"><div className="panel-head"><div><span className="eyebrow">DELIVERY DETAILS</span><h2>My addresses</h2></div></div>{currentUser.addresses.map((savedAddress: any) => <div className="address-card" key={savedAddress.id}><MapPin size={18} /><span><b>{savedAddress.recipient} {savedAddress.isDefault && <em>Default</em>}</b><small>{savedAddress.street}, {savedAddress.city}, {savedAddress.state} {savedAddress.postal}</small><small>{savedAddress.phone}</small></span></div>)}<div className="add-address"><h3>Add a new address</h3><div className="form-grid address-fields"><label>Recipient<input value={address.recipient} onChange={event => setAddress({ ...address, recipient: event.target.value })} /></label><label>Phone<input value={address.phone} onChange={event => setAddress({ ...address, phone: event.target.value })} /></label><label className="wide">Street<input value={address.street} onChange={event => setAddress({ ...address, street: event.target.value })} /></label><label>City<input value={address.city} onChange={event => setAddress({ ...address, city: event.target.value })} /></label><label>State<input value={address.state} onChange={event => setAddress({ ...address, state: event.target.value })} /></label><label>Postal code<input value={address.postal} onChange={event => setAddress({ ...address, postal: event.target.value })} /></label></div><Button onClick={addAddress}>Save address</Button></div></div>}{tab === 'profile' && <div className="account-panel"><div className="panel-head"><div><span className="eyebrow">ACCOUNT DETAILS</span><h2>My profile</h2></div></div><div className="profile-fields"><label>Full name<input value={profile.name} onChange={event => setProfile({ ...profile, name: event.target.value })} /></label><label>Email<input value={profile.email} readOnly /></label><label>Phone<input value={profile.phone} onChange={event => setProfile({ ...profile, phone: event.target.value })} /></label></div><Button onClick={saveProfile}>Save changes</Button></div>}</div></div></section>
}

