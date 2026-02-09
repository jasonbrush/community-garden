import { useState, useRef } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'
import {
  Form,
  FormField,
  Input,
  Textarea,
  Button,
  SpaceBetween,
  Select,
} from '@cloudscape-design/components'
import { addGardenerPublic } from '../api/gardeners'

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY

type SignUpFormProps = {
  onSuccess: (isOutsideFranklinHills?: boolean) => void
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
  const [errors, setErrors] = useState<Record<string, string>>({})
  const recaptchaRef = useRef<any>(null)

  const handleChange = (field: string) => (e: { detail: { value: string } }) => {
    setForm(prev => ({ ...prev, [field]: e.detail.value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
    
    // For phone, validate as they type to show errors immediately
    if (field === 'phone' && e.detail.value) {
      const error = validateFieldValue('phone', e.detail.value)
      if (error) {
        setErrors(prev => ({ ...prev, phone: error }))
      }
    }
  }

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '')
    
    // Format as (XXX) XXX-XXXX for 10 digits (US/Canada)
    if (digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
    }
    
    // Format as +1 (XXX) XXX-XXXX for 11 digits starting with 1 (US/Canada with country code)
    if (digits.length === 11 && digits[0] === '1') {
      return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
    }
    
    // For international numbers (12-15 digits), format as +XX... with spaces
    if (digits.length >= 12 && digits.length <= 15) {
      // Add + and space after country code (first 1-3 digits)
      if (digits.length <= 13) {
        return `+${digits.slice(0, 2)} ${digits.slice(2)}`
      } else {
        return `+${digits.slice(0, 3)} ${digits.slice(3)}`
      }
    }
    
    // For other lengths, just return the digits
    return digits
  }

  const validateFieldValue = (field: string, value: string) => {
    let error = ''

    switch (field) {
      case 'name':
        if (!value.trim()) {
          error = 'Name is required'
        }
        break
      case 'email':
        if (!value.trim()) {
          error = 'Email is required'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Please enter a valid email address'
        }
        break
      case 'phone':
        if (!value.trim()) {
          error = 'Phone is required'
        } else {
          // Check if it contains only valid phone characters
          if (!/^[\d\s\-\(\)\+\.]+$/.test(value)) {
            error = 'Phone number can only contain digits, spaces, dashes, parentheses, periods, and +'
          } else {
            const digits = value.replace(/\D/g, '')
            if (digits.length < 10) {
              error = 'Please enter at least 10 digits'
            } else if (digits.length > 15) {
              error = 'Phone number cannot have more than 15 digits'
            }
          }
        }
        break
      case 'addressStreet':
        if (!value.trim()) {
          error = 'Street address is required'
        }
        break
      case 'addressZip':
        if (value && !/^\d{5}(-\d{4})?$/.test(value)) {
          error = 'Please enter a valid ZIP code (e.g., 12345 or 12345-6789)'
        }
        break
    }

    return error
  }

  const validateField = (field: string, value: string) => {
    const error = validateFieldValue(field, value)
    setErrors(prev => ({ ...prev, [field]: error }))
    return error === ''
  }

  const handleBlur = (field: string) => () => {
    // Format phone number on blur
    if (field === 'phone' && form.phone) {
      const formatted = formatPhoneNumber(form.phone)
      setForm(prev => ({ ...prev, phone: formatted }))
      
      // Validate the formatted number
      const error = validateFieldValue('phone', formatted)
      if (error) {
        setErrors(prev => ({ ...prev, phone: error }))
      }
    } else {
      validateField(field, form[field as keyof typeof form])
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Name validation
    const nameError = validateFieldValue('name', form.name)
    if (nameError) newErrors.name = nameError

    // Email validation
    const emailError = validateFieldValue('email', form.email)
    if (emailError) newErrors.email = emailError

    // Phone validation
    const phoneError = validateFieldValue('phone', form.phone)
    if (phoneError) newErrors.phone = phoneError

    // Address validation
    const addressError = validateFieldValue('addressStreet', form.addressStreet)
    if (addressError) newErrors.addressStreet = addressError

    // ZIP validation (if provided)
    if (form.addressZip) {
      const zipError = validateFieldValue('addressZip', form.addressZip)
      if (zipError) newErrors.addressZip = zipError
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e?: React.FormEvent | { preventDefault?: () => void }) => {
    e?.preventDefault?.()
    
    // Validate form
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

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
      setErrors({})
      setCaptchaToken(null)
      recaptchaRef.current?.reset()
      
      // Check if ZIP is not 90027 and show priority message
      const isOutsideFranklinHills = form.addressZip ? form.addressZip !== '90027' : false
      onSuccess(isOutsideFranklinHills)
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
          <FormField label="Name" description="Required" errorText={errors.name}>
            <Input
              value={form.name}
              onChange={handleChange('name')}
              onBlur={handleBlur('name')}
              placeholder="Your name"
              ariaRequired
            />
          </FormField>

          <FormField label="Email" description="Required" errorText={errors.email}>
            <Input
              type="email"
              value={form.email}
              onChange={handleChange('email')}
              onBlur={handleBlur('email')}
              placeholder="your@email.com"
              ariaRequired
            />
          </FormField>

          <FormField label="Phone" description="Required" errorText={errors.phone}>
            <Input
              value={form.phone}
              onChange={handleChange('phone')}
              onBlur={handleBlur('phone')}
              placeholder="Phone number"
              ariaRequired
            />
          </FormField>

          <FormField label="Address" description="Required" errorText={errors.addressStreet}>
            <SpaceBetween size="s">
              <Input
                value={form.addressStreet}
                onChange={handleChange('addressStreet')}
                onBlur={handleBlur('addressStreet')}
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
                  onBlur={handleBlur('addressZip')}
                  placeholder="ZIP"
                />
              </div>
              {errors.addressZip && (
                <div style={{ color: '#db2f27', fontSize: '14px' }}>{errors.addressZip}</div>
              )}
            </SpaceBetween>
          </FormField>

          <FormField label="Gardening experience" constraintText="">
            <div style={{ maxWidth: '400px' }}>
              <Select
                selectedOption={
                  form.experience
                    ? { label: form.experience, value: form.experience }
                    : null
                }
                onChange={({ detail }) =>
                  setForm(prev => ({ ...prev, experience: detail.selectedOption.value || '' }))
                }
                options={[
                  { label: 'No experience - I\'m just getting started!', value: 'No experience' },
                  { label: 'Beginner - I\'ve tried a little gardening', value: 'Beginner' },
                  { label: 'Intermediate - I have some gardening experience', value: 'Intermediate' },
                  { label: 'Experienced - I\'ve been gardening for years', value: 'Experienced' },
                  { label: 'Expert - Gardening is my passion!', value: 'Expert' },
                ]}
                placeholder="Select your gardening experience level"
              />
            </div>
          </FormField>

          <FormField label="Additional information" stretch={true}>
            <Textarea
              value={form.notes}
              onChange={handleChange('notes')}
              placeholder="Tell us about your gardening interests, favorite plants, what you hope to grow, or any special skills you can share with the garden community!"
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
