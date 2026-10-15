import { useState } from 'react'
import { AlertCircle, ArrowRight, ChevronLeft, Eye, EyeOff } from 'lucide-react'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from './firebase'

type AuthProps = {
  mode: 'login' | 'register'
  users: any[]
  setUsers?: (users: any[]) => void
  setCurrentUserId: (id: string) => void
  go: (path: string) => void
  notify: (message: string, kind?: 'success' | 'error') => void
}

function firebaseMessage(error: unknown) {
  const code = (error as { code?: string })?.code
  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') return 'Email or password is incorrect.'
  if (code === 'auth/email-already-in-use') return 'An account with this email already exists.'
  if (code === 'auth/weak-password') return 'Choose a stronger password.'
  if (code === 'auth/too-many-requests') return 'Too many attempts. Please try again later.'
  return 'We could not complete that request. Please try again.'
}

export default function Auth({ mode, users, setUsers, setCurrentUserId, go, notify }: AuthProps) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '', terms: false, remember: true })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const email = form.email.trim().toLowerCase()
    if (!/^\S+@\S+\.\S+$/.test(email)) { setError('Enter a valid email address.'); return }
    if (mode === 'register') {
      if (!form.name.trim() || !form.phone.trim()) { setError('Please fill in all required fields.'); return }
      if (form.password.length < 8 || !/\d/.test(form.password)) { setError('Password must be at least 8 characters and include a number.'); return }
      if (form.password !== form.confirm) { setError('Passwords do not match.'); return }
      if (!form.terms) { setError('Please accept the terms to continue.'); return }
    }
    setBusy(true)
    try {
      if (mode === 'login') {
        const credential = await signInWithEmailAndPassword(auth, email, form.password)
        const profile = await getDoc(doc(db, 'cartovaUsers', credential.user.uid))
        const user = {
          id: credential.user.uid,
          name: profile.exists() ? profile.data().name : credential.user.displayName || email.split('@')[0],
          email: credential.user.email || email,
          phone: profile.exists() ? profile.data().phone || '' : '',
          password: '',
          role: profile.exists() && profile.data().role === 'admin' ? 'admin' : 'shopper',
          addresses: [], wishlist: [], reviews: {},
        }
        setUsers?.([...users.filter(x => x.id !== user.id), user])
        localStorage.setItem('cartova_session', user.id)
        setCurrentUserId(user.id)
        notify(`Welcome back, ${user.name.split(' ')[0]}!`)
        go(user.role === 'admin' ? '/admin' : '/account')
      } else {
        const credential = await createUserWithEmailAndPassword(auth, email, form.password)
        await updateProfile(credential.user, { displayName: form.name.trim() })
        await setDoc(doc(db, 'cartovaUsers', credential.user.uid), {
          name: form.name.trim(), email, phone: form.phone.trim(), role: 'shopper',
        })
        const user = {
          id: credential.user.uid, name: form.name.trim(), email, phone: form.phone.trim(), password: '',
          role: 'shopper', addresses: [], wishlist: [], reviews: {},
        }
        setUsers?.([...users.filter(x => x.id !== user.id), user])
        localStorage.setItem('cartova_session', user.id)
        setCurrentUserId(user.id)
        notify('Your Cartova account is ready!')
        go('/account')
      }
    } catch (firebaseError) {
      setError(firebaseMessage(firebaseError))
    } finally {
      setBusy(false)
    }
  }

  return <section className="auth-page"><div className="auth-aside"><button className="logo light" onClick={() => go('/')}><span>c</span> cartova</button><div><span className="eyebrow">EVERYDAY SHOPPING</span><h1>Good things,<br /><i>coming right up.</i></h1><p>Thoughtful products for a life well lived.</p></div><small>Cartova · Everyday shopping, made simple.</small></div><div className="auth-content"><button className="back-link" onClick={() => go('/')}><ChevronLeft size={16} /> Back to store</button><div className="auth-box"><div className="auth-heading"><span className="eyebrow">{mode === 'login' ? 'WELCOME BACK' : 'JOIN CARTOVA'}</span><h2>{mode === 'login' ? 'Sign in to your account' : 'Create your account'}</h2><p>{mode === 'login' ? 'Pick up where you left off.' : 'Save favourites, track orders and checkout faster.'}</p></div><form onSubmit={submit}>{mode === 'register' && <label>Full name<input data-testid="register-name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your full name" /></label>}<label>Email address<input data-testid={mode === 'login' ? 'login-email' : 'register-email'} type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" /></label>{mode === 'register' && <label>Phone number<input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="10-digit mobile number" /></label>}<label>Password<div className="password-field"><input data-testid={mode === 'login' ? 'login-password' : 'register-password'} type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Your password" /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>{mode === 'register' && <><label>Confirm password<div className="password-field"><input data-testid="register-confirm-password" type={showConfirm ? 'text' : 'password'} value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} placeholder="Re-enter your password" /><button type="button" aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'} onClick={() => setShowConfirm(!showConfirm)}>{showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label><label className="check-label"><input type="checkbox" checked={form.terms} onChange={e => setForm({ ...form, terms: e.target.checked })} /><span>I agree to Cartova’s terms and policies.</span></label></>}{mode === 'login' && <div className="auth-row"><label className="check-label"><input type="checkbox" checked={form.remember} onChange={e => setForm({ ...form, remember: e.target.checked })} /> Remember me</label><button type="button" className="text-link" onClick={() => go('/forgot-password')}>Forgot password?</button></div>}{error && <div className="form-error"><AlertCircle size={16} />{error}</div>}<button type="submit" className="btn primary full" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'} {!busy && <ArrowRight size={16} />}</button></form><p className="auth-switch">{mode === 'login' ? <>New to Cartova? <button onClick={() => go('/register')}>Create an account</button></> : <>Already have an account? <button onClick={() => go('/login')}>Sign in</button></>}</p></div></div></section>
}
