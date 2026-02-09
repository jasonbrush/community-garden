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
  Icon,
} from '@cloudscape-design/components'
import { SignUpForm } from '../components/SignUpForm'

type FlashMessage = { type: 'success' | 'error'; content: string } | null

export function LandingPage() {
  const [modalVisible, setModalVisible] = useState(false)
  const [flashMessage, setFlashMessage] = useState<FlashMessage>(null)
  const [formKey, setFormKey] = useState(0)

  const handleModalDismiss = () => {
    setModalVisible(false)
    // Reset the form by changing the key
    setFormKey(prev => prev + 1)
  }

  const handleSignUpSuccess = (isOutsideFranklinHills?: boolean) => {
    handleModalDismiss()
    const message = isOutsideFranklinHills
      ? "Thanks! You've been added to the waitlist. Please note that community garden membership is prioritized for residents of Franklin Hills."
      : "Thanks! You've been added to the waitlist."
    setFlashMessage({
      type: 'success',
      content: message,
    })
  }

  const handleSignUpError = (message: string) => {
    handleModalDismiss()
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
        headerBackgroundStyle="#457c39"
        header={
          <div className="tight-heading">
            <Header
              variant="h1"
              description="An organic community garden in the Franklin Hills neighborhood of Los Angeles"
            >
              The Norman Harriton Community Garden
            </Header>
          </div>
        }
        notifications={flashItems.length > 0 ? <Flashbar items={flashItems} /> : undefined}
        maxContentWidth={1000}
      >
        <SpaceBetween size="xl">
          <Container variant="stacked">
            <Box variant="p" color="text-body-secondary">
               <p>
                The Norman Harriton Community Garden offers individual plots for residents of the{' '}
                <a 
                  href="https://en.wikipedia.org/wiki/Franklin_Hills,_Los_Angeles" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: '#0095a3' }}
                >
                  Franklin Hills <Icon name="external" size="inherit" />
                </a>
                {' '}in Los Angeles to cultivate fresh vegetables throughout the year. We provide shared tools, water access, and a supportive community of fellow gardeners. Whether you&apos;re an experienced gardener or just starting out, there&apos;s a place for you here. Learn more about the neighborhood at the{' '}
                <a 
                  href="https://www.franklinhills.org/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: '#0095a3' }}
                >
                  Franklin Hills Residents&apos; Association <Icon name="external" size="inherit" />
                </a>
                . 
              </p>
              <p>To learn more about the garden, our events, and view photo galleries visit our{' '}
                <a 
                  href="https://www.facebook.com/FranklinHillsCommunityGarden/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: '#0095a3' }}
                >
                  Facebook page <Icon name="external" size="inherit" />
                </a>.</p>
            </Box>
          </Container>

          <Container header={<Header variant="h2">About the Garden: Norm's Vision</Header>} variant="stacked">
            <Box variant="p" color="text-body-secondary">
              <p>
                The garden was founded in 2000 by Norman Harriton at the suggestion of Adam Weisman. Norm’s determined leadership transformed a thicket of weeds into a bounty of organic vegetables. Franklin Hills Residents' Association community leader Norman Harriton, passed away on May 18, 2004. Norm lived in the Franklin Hills for six decades and will be remembered not only for the determination that changed a weedy field into a productive community asset but for his many other services to our community and most of all for his wisdom and gentle nature. Norm will be lovingly remembered in the seeds, soil, and sweat he invested in the Franklin Hills Community Garden.
              </p>
            </Box>
          </Container>

          <Container
            header={
              <Header
                variant="h2"
                actions={
                  <Button variant="primary" onClick={() => setModalVisible(true)}>
                    Join the waitlist
                  </Button>
                }
              >
                Get Involved
              </Header>
            }
            variant="stacked"
          >
            <Box variant="p" color="text-body-secondary">
              <p>
                Plots are assigned based on availability and waitlist order. If you&apos;re
                interested in joining, sign up below and we&apos;ll reach out when a spot
                opens up.
              </p>
              <p>
                Questions? Email us at{' '}
                <a href="mailto:Garden@FranklinHills.org" style={{ color: '#0095a3' }}>
                  Garden@FranklinHills.org
                </a>
              </p>
            </Box>
          </Container>
        </SpaceBetween>
      </ContentLayout>

      <Modal
        visible={modalVisible}
        onDismiss={handleModalDismiss}
        header="Join the Waitlist"
        size="large"
      >
        <SignUpForm key={formKey} onSuccess={handleSignUpSuccess} onError={handleSignUpError} />
      </Modal>
    </>
  )
}
