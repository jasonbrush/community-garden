import { useState } from 'react'
import {
  ContentLayout,
  Header,
  Box,
  Button,
  SpaceBetween,
  Modal,
  Flashbar,
  Container,
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
        headerVariant="high-contrast"
        headerBackgroundStyle="#635045"
        header={
          <div className="tight-heading">
            <Header
              variant="h1"
              description="A community garden in the Franklin Hills neighborhood of Los Angeles"
            >
              The Norman Harriton Community Garden
            </Header>
          </div>
        }
        notifications={flashItems.length > 0 ? <Flashbar items={flashItems} /> : undefined}
        maxContentWidth={800}
      >
        <SpaceBetween size="xl">
          <Container variant="stacked">
            <Box variant="p" color="text-body-secondary">
               <p>
                The Norman Harriton Community Garden offers individual plots for residents of the Franklin Hills to cultivate fresh vegetables throughout the growing season. We provide shared tools, water access, and a supportive community of fellow gardeners. Whether you&apos;re an experienced gardener or just starting out, there&apos;s a place for you here.
              </p>
            </Box>
          </Container>

          <Container header={<Header variant="h2">About the Garden</Header>} variant="stacked">
            <Box variant="p" color="text-body-secondary">
             
              <p>
                The garden was founded in 2000 by Norman Harriton at the suggestion of Adam Weisman. Norm’s determined leadership transformed a thicket of weeds into a bounty of organic vegetables. FHRA community leader Norman Harriton, passed away on May 18, 2004. Norm lived in the Franklin Hills for six decades and will be remembered not only for the determination that changed a weedy field into a productive community asset but for his many other services to our community and most of all for his wisdom and gentle nature.
</p><p>
Norm will be lovingly remembered in the seeds, soil, and sweat he invested in the Franklin Hills Community Garden.
              </p>
            
            </Box>
          </Container>

          <Container header={<Header variant="h2">Get Involved</Header>} variant="stacked">
            <SpaceBetween size="m">
              <Box variant="p" color="text-body-secondary">
                  <p>
                Plots are assigned based on availability and waitlist order. If you&apos;re
                interested in joining, sign up below and we&apos;ll reach out when a spot
                opens up.
              </p>
              </Box>
              <Button variant="primary" onClick={() => setModalVisible(true)}>
                Join the waitlist
              </Button>
            </SpaceBetween>
          </Container>
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
