import { useState } from 'react'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { AlertCircle, ArrowRight, ChevronLeft, Eye, EyeOff } from 'lucide-react'
import { auth, firebaseConfigured } from './firebase'

type AuthProps = {
  mode: 'login' | 'register'
  go: (path: string) => void
  notify: (message: string, kind?: 'success' | 'error') => void
}

function firebaseMessage(error: unknown) {
  const code = (error as { code?: string })?.code
  if (code === 'auth/email-already-in-use') return 'An account with this email already exists.'
  if (code === 'auth/invalid-credential' || code === 'auth/invalid-login-credentials') return 'Email or password is incorrect.'
  if (code === 'auth/user-not-found' || code === 'auth/wrong-password') return 'Email or password is incorrect.'
  if (code === 'auth/weak-password') return 'Password must be at least 6 characters.'
  if (code === 'auth/too-many-requests') return 'Too many attempts. Please try again later.'
  if (code === 'auth/invalid-email') return 'Enter a valid email address.'
  return 'Authentication failed. Please try again.'
}

export default function Auth({ mode, go, notify }: AuthProps) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '', terms: false, remember: true })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')

    const email = form.email.trim().toLowerCase()
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Enter a valid email address.')
      return
    }
    if (!auth || !firebaseConfigured) {
      setError('Firebase Authentication is not configured for this deployment.')
      return
    }
    if (mode === 'register') {
      if (!form.name.trim() || !form.phone.trim()) {
        setError('Please fill in all required fields.')
        return
      }
      if (form.password.length < 8 || !/\d/.test(form.password)) {
        setError('Password must be at least 8 characters and include a number.')
        return
      }
      if (form.password !== form.confirm) {
        setError('Passwords do not match.')
        return
      }
      if (!form.terms) {
        setError('Please accept the terms to continue.')
        return
      }
    }

    setBusy(true)
    try {
      if (mode === 'login') {
        const credential = await signInWithEmailAndPassword(auth, email, form.password)
        notify(`Welcome back, ${credential.user.displayName?.split(' ')[0] || 'back'}!`)
        go('/account')
      } else {
        const credential = await createUserWithEmailAndPassword(auth, email, form.password)
        await updateProfile(credential.user, { displayName: form.name.trim() })
        localStorage.setItem(`cartova_profile_${credential.user.uid}`, JSON.stringify({ phone: form.phone.trim() }))
        notify('Your Cartova account is ready!')
        go('/account')
      }
    } catch (submitError) {
      setError(firebaseMessage(submitError))
    } finally {
      setBusy(false)
    }
  }

  return <section className="auth-page"><div className="auth-aside"><button className="logo light" onClick={() => go('/')}><span>c</span> cartova</button><div><span className="eyebrow">EVERYDAY SHOPPING</span><h1>Good things,<br /><i>coming right up.</i></h1><p>Thoughtful products for a life well lived.</p></div><small>Cartova · Everyday shopping, made simple.</small></div><div className="auth-content"><button className="back-link" onClick={() => go('/')}><ChevronLeft size={16} /> Back to store</button><div className="auth-box"><div className="auth-heading"><span className="eyebrow">{mode === 'login' ? 'WELCOME BACK' : 'JOIN CARTOVA'}</span><h2>{mode === 'login' ? 'Sign in to your account' : 'Create your account'}</h2><p>{mode === 'login' ? 'Pick up where you left off.' : 'Save favourites, track orders and checkout faster.'}</p></div><form onSubmit={submit}>{mode === 'register' && <label>Full name<input data-testid="register-name" value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} placeholder="Your full name" /></label>}<label>Email address<input data-testid={mode === 'login' ? 'login-email' : 'register-email'} type="email" value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} placeholder="you@example.com" /></label>{mode === 'register' && <label>Phone number<input data-testid="register-phone" value={form.phone} onChange={event => setForm({ ...form, phone: event.target.value })} placeholder="10-digit mobile number" /></label>}<label>Password<div className="password-field"><input data-testid={mode === 'login' ? 'login-password' : 'register-password'} type={showPassword ? 'text' : 'password'} value={form.password} onChange={event => setForm({ ...form, password: event.target.value })} placeholder="Your password" /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>{mode === 'register' && <><label>Confirm password<div className="password-field"><input data-testid="register-confirm-password" type={showConfirm ? 'text' : 'password'} value={form.confirm} onChange={event => setForm({ ...form, confirm: event.target.value })} placeholder="Re-enter your password" /><button type="button" aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'} onClick={() => setShowConfirm(!showConfirm)}>{showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label><label className="check-label"><input type="checkbox" checked={form.terms} onChange={event => setForm({ ...form, terms: event.target.checked })} /> I agree to Cartova’s terms and policies.</label></>}{mode === 'login' && <div className="auth-row"><label className="check-label"><input type="checkbox" checked={form.remember} onChange={event => setForm({ ...form, remember: event.target.checked })} /> Remember me</label><button type="button" className="text-link" onClick={() => go('/forgot-password')}>Forgot password?</button></div>}{error && <div className="form-error"><AlertCircle size={16} />{error}</div>}<button data-testid={mode === 'login' ? 'login-submit' : 'register-submit'} type="submit" className="btn primary full" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'} {!busy && <ArrowRight size={16} />}</button></form><p className="auth-switch">{mode === 'login' ? <>New to Cartova? <button onClick={() => go('/register')}>Create an account</button></> : <>Already have an account? <button onClick={() => go('/login')}>Sign in</button></>}</p></div></div></section>
}

