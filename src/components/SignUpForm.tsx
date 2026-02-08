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
    addressStreet: '',
    addressCity: '',
    addressState: '',
    addressZip: '',
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

    if (!form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.addressStreet.trim()) {
      onError('Please fill in required fields (name, email, phone, and street address).')
      setIsSubmitting(false)
      return
    }

    if (!captchaToken) {
      onError('Please complete the CAPTCHA before submitting.')
      setIsSubmitting(false)
      return
    }

    try {
      // Concatenate address fields
      const addressParts = [
        form.addressStreet,
        form.addressCity,
        form.addressState,
        form.addressZip
      ].filter(part => part.trim());
      const fullAddress = addressParts.length > 0 ? addressParts.join(', ') : undefined;

      await addGardenerPublic({
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        address: fullAddress,
        experience: form.experience || undefined,
        notes: form.notes || undefined,
        captchaToken,
      })

      setForm({
        name: '',
        email: '',
        phone: '',
        addressStreet: '',
        addressCity: '',
        addressState: '',
        addressZip: '',
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

          <FormField label="Phone" description="Required">
            <Input
              value={form.phone}
              onChange={handleChange('phone')}
              placeholder="Phone number"
              ariaRequired
            />
          </FormField>

          <FormField label="Address" description="Required">
            <SpaceBetween size="s">
              <Input
                value={form.addressStreet}
                onChange={handleChange('addressStreet')}
                placeholder="Street address"
                ariaRequired
              />
              <Input
                value={form.addressCity}
                onChange={handleChange('addressCity')}
                placeholder="City"
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <Input
                  value={form.addressState}
                  onChange={handleChange('addressState')}
                  placeholder="State"
                />
                <Input
                  value={form.addressZip}
                  onChange={handleChange('addressZip')}
                  placeholder="ZIP"
                />
              </div>
            </SpaceBetween>
          </FormField>

          <FormField label="Gardening experience">
            <Input
              value={form.experience}
              onChange={handleChange('experience')}
              placeholder="e.g., beginner, experienced, etc."
            />
          </FormField>

          <FormField label="Additional information">
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
