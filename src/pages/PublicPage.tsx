import { useState, useRef } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'
import {
  ContentLayout,
  Form,
  FormField,
  Header,
  Input,
  Textarea,
  Button,
  SpaceBetween,
  Flashbar,
} from '@cloudscape-design/components'
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

  const handleChange = (field: string) => (e: { detail: { value: string } }) => {
    setForm(prev => ({ ...prev, [field]: e.detail.value }))
  }

  const handleSubmit = async (e?: React.FormEvent | { preventDefault?: () => void }) => {
    e?.preventDefault?.()
    setStatus('submitting')
    setErrorMsg(null)

    if (!form.name.trim() || !form.email.trim()) {
      setStatus('error')
      setErrorMsg('Please fill in required fields (name and email).')
      return
    }

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

      if (error?.code === '23505') {
        setErrorMsg('This email has already signed up.')
      } else {
        setErrorMsg(error?.message ?? 'Something went wrong.')
      }
    }
  }

  const flashItems: Array<{ type: 'success' | 'error'; content: string; dismissible: boolean; id?: string; onDismiss?: () => void }> = []
  if (status === 'success') {
    flashItems.push({
      type: 'success',
      content: "Thanks! You've been added to the list.",
      dismissible: true,
      id: 'success',
      onDismiss: () => setStatus('idle'),
    })
  }
  if (status === 'error' && errorMsg) {
    flashItems.push({
      type: 'error',
      content: `Error: ${errorMsg}`,
      dismissible: true,
      id: 'error',
      onDismiss: () => setStatus('idle'),
    })
  }

  return (
    <ContentLayout
      header={
        <Header variant="h1" description="Sign up to be added to the waiting list for a plot.">
          Community Garden Waitlist
        </Header>
      }
      notifications={flashItems.length > 0 ? <Flashbar items={flashItems} /> : undefined}
      maxContentWidth={720}
    >
      <form onSubmit={handleSubmit}>
        <Form
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button
                variant="primary"
                onClick={() => handleSubmit()}
                disabled={status === 'submitting'}
                loading={status === 'submitting'}
                loadingText="Submitting…"
              >
                Join waitlist
              </Button>
            </SpaceBetween>
          }
        >
          <SpaceBetween size="l">
            <FormField label="Name" description="Required" errorText={undefined}>
              <Input
                value={form.name}
                onChange={handleChange('name')}
                placeholder="Your name"
                ariaRequired
              />
            </FormField>

            <FormField label="Email" description="Required" errorText={undefined}>
              <Input
                type="email"
                value={form.email}
                onChange={handleChange('email')}
                placeholder="your@email.com"
                ariaRequired
              />
            </FormField>

            <FormField label="Phone" description="Optional">
              <Input
                value={form.phone}
                onChange={handleChange('phone')}
                placeholder="Phone number"
              />
            </FormField>

            <FormField label="Address" description="Optional">
              <Input
                value={form.address}
                onChange={handleChange('address')}
                placeholder="Street address"
              />
            </FormField>

            <FormField label="Gardening experience" description="Optional">
              <Input
                value={form.experience}
                onChange={handleChange('experience')}
                placeholder="e.g., beginner, experienced, etc."
              />
            </FormField>

            <FormField label="Additional information" description="Optional">
              <Textarea
                value={form.notes}
                onChange={handleChange('notes')}
                placeholder="Any other details you'd like to share"
                rows={4}
              />
            </FormField>

            <FormField
              label="Security verification"
              description="Please complete the CAPTCHA to verify you're human."
            >
              <ReCAPTCHA
                sitekey={RECAPTCHA_SITE_KEY}
                onChange={(token: string | null) => setCaptchaToken(token)}
                ref={recaptchaRef}
              />
            </FormField>
          </SpaceBetween>
        </Form>
      </form>
    </ContentLayout>
  )
}
