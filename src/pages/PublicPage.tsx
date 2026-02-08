import { useState, useRef } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'
import { addGardenerPublic } from '../api/gardeners'

type Status = 'idle' | 'submitting' | 'success' | 'error'

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY

export function PublicPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    experience: '',
    notes: '',
  })
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const recaptchaRef = useRef<any>(null)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('submitting')
    setErrorMsg(null)

    if (!captchaToken) {
      setStatus('error')
      setErrorMsg('Please complete the CAPTCHA before submitting.')
      return
    }

    try {
      await addGardenerPublic({
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        address: form.address || undefined,
        experience: form.experience || undefined,
        notes: form.notes || undefined,
        captchaToken,
      })

      setStatus('success')
      setForm({
        name: '',
        email: '',
        phone: '',
        address: '',
        experience: '',
        notes: '',
      })
      setCaptchaToken(null)
      recaptchaRef.current?.reset()
    } catch (error: any) {
      console.error(error)
      setStatus('error')

      // 23505 = Postgres unique_violation (email already exists)[web:338][web:353]
      if (error?.code === '23505') {
        setErrorMsg('This email has already signed up.')
      } else {
        setErrorMsg(error?.message ?? 'Something went wrong.')
      }
    }
  }

  return (
    <main style={{ maxWidth: 600, margin: '0 auto', padding: '2rem' }}>
      <h1>Community Garden Waitlist</h1>
      <p>Sign up to be added to the waiting list for a plot.</p>

      {status === 'success' && (
        <p style={{ color: 'green' }}>
          Thanks! You&apos;ve been added to the list.
        </p>
      )}
      {status === 'error' && (
        <p style={{ color: 'red' }}>Error: {errorMsg}</p>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '0.75rem' }}>
          <label>
            Name*<br />
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              style={{ width: '100%' }}
            />
          </label>
        </div>

        <div style={{ marginBottom: '0.75rem' }}>
          <label>
            Email*<br />
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              style={{ width: '100%' }}
            />
          </label>
        </div>

        <div style={{ marginBottom: '0.75rem' }}>
          <label>
            Phone<br />
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              style={{ width: '100%' }}
            />
          </label>
        </div>

        <div style={{ marginBottom: '0.75rem' }}>
          <label>
            Address<br />
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              style={{ width: '100%' }}
            />
          </label>
        </div>

        <div style={{ marginBottom: '0.75rem' }}>
          <label>
            Gardening experience<br />
            <input
              name="experience"
              value={form.experience}
              onChange={handleChange}
              style={{ width: '100%' }}
            />
          </label>
        </div>

        <div style={{ marginBottom: '0.75rem' }}>
          <label>
            Additional information<br />
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={4}
              style={{ width: '100%' }}
            />
          </label>
        </div>

        <div style={{ marginBottom: '0.75rem' }}>
          <ReCAPTCHA
            sitekey={RECAPTCHA_SITE_KEY}
            onChange={(token: string | null) => setCaptchaToken(token)}
            ref={recaptchaRef}
          />
        </div>

        <button type="submit" disabled={status === 'submitting'}>
          {status === 'submitting' ? 'Submitting…' : 'Join waitlist'}
        </button>
      </form>
    </main>
  )
}