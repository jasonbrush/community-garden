import { useState, useRef } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'
import {
  Form,
  FormField,
  Input,
  Textarea,
  Button,
  SpaceBetween,
} from '@cloudscape-design/components'
import { addGardenerPublic } from '../api/gardeners'

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY

type SignUpFormProps = {
  onSuccess: () => void
  onError: (message: string) => void
}

export function SignUpForm({ onSuccess, onError }: SignUpFormProps) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    experience: '',
    notes: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const recaptchaRef = useRef<any>(null)

  const handleChange = (field: string) => (e: { detail: { value: string } }) => {
    setForm(prev => ({ ...prev, [field]: e.detail.value }))
  }

  const handleSubmit = async (e?: React.FormEvent | { preventDefault?: () => void }) => {
    e?.preventDefault?.()
    setIsSubmitting(true)

    if (!form.name.trim() || !form.email.trim()) {
      onError('Please fill in required fields (name and email).')
      setIsSubmitting(false)
      return
    }

    if (!captchaToken) {
      onError('Please complete the CAPTCHA before submitting.')
      setIsSubmitting(false)
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
      onSuccess()
    } catch (error: any) {
      console.error(error)
      if (error?.code === '23505') {
        onError('This email has already signed up.')
      } else {
        onError(error?.message ?? 'Something went wrong.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Form
        actions={
          <SpaceBetween direction="horizontal" size="xs">
            <Button
              variant="primary"
              onClick={() => handleSubmit()}
              disabled={isSubmitting}
              loading={isSubmitting}
              loadingText="Submitting…"
            >
              Join waitlist
            </Button>
          </SpaceBetween>
        }
      >
        <SpaceBetween size="l">
          <FormField label="Name" description="Required">
            <Input
              value={form.name}
              onChange={handleChange('name')}
              placeholder="Your name"
              ariaRequired
            />
          </FormField>

          <FormField label="Email" description="Required">
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
  )
}
