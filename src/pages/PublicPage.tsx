import React, { useState } from 'react'
import Container from '@cloudscape-design/components/container'
import Header from '@cloudscape-design/components/header'
import SpaceBetween from '@cloudscape-design/components/space-between'
import Form from '@cloudscape-design/components/form'
import FormField from '@cloudscape-design/components/form-field'
import Input from '@cloudscape-design/components/input'
import Textarea from '@cloudscape-design/components/textarea'
import Button from '@cloudscape-design/components/button'
import Alert from '@cloudscape-design/components/alert'
import { addGardenerPublic } from '../api/gardeners'

type Status = 'idle' | 'submitting' | 'success' | 'error'

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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setStatus('submitting')
    setErrorMsg(null)

    try {
      await addGardenerPublic({
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        address: form.address || undefined,
        experience: form.experience || undefined,
        notes: form.notes || undefined,
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
    } catch (error: unknown) {
      console.error(error)
      setStatus('error')
      setErrorMsg(error instanceof Error ? error.message : 'Something went wrong.')
    }
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem' }}>
      <Container>
        <Header variant="h1">Community Garden Waitlist</Header>
        {status === 'success' && (
          <Alert type="success" dismissible onDismiss={() => setStatus('idle')}>
            Thanks! You've been added to the list.
          </Alert>
        )}
        <form onSubmit={handleSubmit}>
          <Form
            actions={
              <SpaceBetween direction="horizontal" size="xs">
                <Button
                  variant="primary"
                  formAction="submit"
                  loading={status === 'submitting'}
                  disabled={status === 'submitting'}
                >
                  Join waitlist
                </Button>
              </SpaceBetween>
            }
            errorText={status === 'error' ? errorMsg ?? 'Something went wrong.' : undefined}
          >
            <SpaceBetween size="s">
            <FormField label="Name (required)" description="Your full name">
              <Input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.detail.value }))}
                placeholder="Jane Doe"
                ariaRequired
              />
            </FormField>

            <FormField label="Email (required)" description="We’ll use this to contact you">
              <Input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.detail.value }))}
                placeholder="jane@example.com"
                ariaRequired
              />
            </FormField>

            <FormField label="Phone" description="Optional, for time‑sensitive updates">
              <Input
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.detail.value }))}
                placeholder="(555) 123‑4567"
              />
            </FormField>

            <FormField label="Address" description="Neighborhood or full address">
              <Input
                value={form.address}
                onChange={e => setForm(f => ({ ...f, address: e.detail.value }))}
                placeholder="123 Garden St, Los Angeles"
              />
            </FormField>

            <FormField label="Gardening experience" description="Briefly describe your experience">
              <Input
                value={form.experience}
                onChange={e => setForm(f => ({ ...f, experience: e.detail.value }))}
                placeholder="Beginner / Intermediate / Advanced"
              />
            </FormField>

            <FormField label="Additional information" description="Anything else you’d like us to know">
              <Textarea
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.detail.value }))}
                placeholder="Preferred crops, schedule constraints, accessibility needs, etc."
                rows={4}
              />
            </FormField>

            {/* CAPTCHA widget will go here later */}
            </SpaceBetween>
          </Form>
        </form>
      </Container>
    </div>
  )
}