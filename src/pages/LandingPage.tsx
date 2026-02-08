import { useState } from 'react'
import {
  ContentLayout,
  Header,
  Box,
  Button,
  SpaceBetween,
  Modal,
  Flashbar,
} from '@cloudscape-design/components'
import { SignUpForm } from '../components/SignUpForm'

type FlashMessage = { type: 'success' | 'error'; content: string } | null

export function LandingPage() {
  const [modalVisible, setModalVisible] = useState(false)
  const [flashMessage, setFlashMessage] = useState<FlashMessage>(null)

  const handleSignUpSuccess = () => {
    setModalVisible(false)
    setFlashMessage({
      type: 'success',
      content: "Thanks! You've been added to the waitlist.",
    })
  }

  const handleSignUpError = (message: string) => {
    setModalVisible(false)
    setFlashMessage({
      type: 'error',
      content: `Error: ${message}`,
    })
  }

  const flashItems =
    flashMessage != null
      ? [
          {
            ...flashMessage,
            id: flashMessage.type,
            dismissible: true,
            onDismiss: () => setFlashMessage(null),
          },
        ]
      : []

  return (
    <>
      <ContentLayout
        header={
          <Header
            variant="h1"
            description="A shared space for neighbors to grow food, build community, and connect with nature."
          >
            Community Garden
          </Header>
        }
        notifications={flashItems.length > 0 ? <Flashbar items={flashItems} /> : undefined}
        maxContentWidth={800}
      >
        <SpaceBetween size="xl">
          <Box variant="p" color="text-body-secondary">
            <p>
              Welcome to our community garden—a place where neighbors come together to grow
              fresh vegetables, herbs, and flowers. Whether you&apos;re an experienced
              gardener or just starting out, there&apos;s a place for you here.
            </p>
          </Box>

          <SpaceBetween size="l">
            <Header variant="h2">About the Garden</Header>
            <Box variant="p" color="text-body-secondary">
              <p>
                Our garden offers individual plots for residents to cultivate throughout the
                growing season. We provide shared tools, water access, and a supportive
                community of fellow gardeners. Seasonal workshops and workdays help
                everyone learn and contribute together.
              </p>
              <p>
                Plots are assigned based on availability and waitlist order. If you&apos;re
                interested in joining, sign up below and we&apos;ll reach out when a spot
                opens up.
              </p>
            </Box>
          </SpaceBetween>

          <SpaceBetween size="l">
            <Header variant="h2">Get Involved</Header>
            <Box variant="p" color="text-body-secondary">
              <p>
                Ready to get your hands in the soil? Join our waitlist to be notified when
                a plot becomes available.
              </p>
            </Box>
            <Button variant="primary" onClick={() => setModalVisible(true)}>
              Join the waitlist
            </Button>
          </SpaceBetween>
        </SpaceBetween>
      </ContentLayout>

      <Modal
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        header="Join the Waitlist"
        size="max"
      >
        <SignUpForm onSuccess={handleSignUpSuccess} onError={handleSignUpError} />
      </Modal>
    </>
  )
}
