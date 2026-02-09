import { useState, useEffect } from 'react'
import {
  Table,
  Box,
  SpaceBetween,
  Button,
  Header,
  Modal,
  Form,
  FormField,
  Input,
  Textarea,
  Select,
  AppLayout,
  Flashbar,
  TopNavigation,
} from '@cloudscape-design/components'
import type { Gardener } from '../api/gardeners'
import {
  getAllGardeners,
  updateGardener,
  deleteGardener,
  addGardenerAdmin,
  reorderGardeners,
} from '../api/admin'
import { AdminAuth } from '../components/AdminAuth'
import { supabase } from '../supabaseClient'
import './AdminPage.css'

function AdminContent() {
  const [gardeners, setGardeners] = useState<Gardener[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedItems, setSelectedItems] = useState<Gardener[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [editingPositionId, setEditingPositionId] = useState<string | null>(null)
  const [editingPositionValue, setEditingPositionValue] = useState<string>('')

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    experience: '',
    notes: '',
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    loadGardeners()
  }, [])

  const loadGardeners = async () => {
    try {
      setLoading(true)
      const data = await getAllGardeners()
      setGardeners(data)
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Failed to load gardeners')
    } finally {
      setLoading(false)
    }
  }

  const validateField = (field: string, value: string) => {
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
        if (value) {
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
    }

    return error
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Name validation
    const nameError = validateField('name', formData.name)
    if (nameError) newErrors.name = nameError

    // Email validation
    const emailError = validateField('email', formData.email)
    if (emailError) newErrors.email = emailError

    // Phone validation (optional but must be valid if provided)
    if (formData.phone) {
      const phoneError = validateField('phone', formData.phone)
      if (phoneError) newErrors.phone = phoneError
    }

    setFormErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }))
    }
    
    // For phone, validate as they type to show errors immediately
    if (field === 'phone' && value) {
      const error = validateField('phone', value)
      if (error) {
        setFormErrors(prev => ({ ...prev, phone: error }))
      }
    }
  }

  const handleBlur = (field: string) => {
    // Format phone number on blur
    if (field === 'phone' && formData.phone) {
      const formatted = formatPhoneNumber(formData.phone)
      setFormData(prev => ({ ...prev, phone: formatted }))
      
      // Validate the formatted number
      const error = validateField('phone', formatted)
      if (error) {
        setFormErrors(prev => ({ ...prev, phone: error }))
      }
    } else {
      const error = validateField(field, formData[field as keyof typeof formData])
      if (error) {
        setFormErrors(prev => ({ ...prev, [field]: error }))
      }
    }
  }

  const handleAdd = async () => {
    if (!validateForm()) {
      return
    }

    try {
      await addGardenerAdmin({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        experience: formData.experience || undefined,
        notes: formData.notes || undefined,
      })
      setSuccess('Gardener added successfully')
      setShowAddModal(false)
      resetForm()
      await loadGardeners()
    } catch (err: any) {
      setError(err.message || 'Failed to add gardener')
    }
  }

  const handleEdit = async () => {
    if (selectedItems.length === 0) return

    if (!validateForm()) {
      return
    }

    try {
      await updateGardener(selectedItems[0].id, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        address: formData.address || null,
        experience: formData.experience || null,
        notes: formData.notes || null,
      })
      setSuccess('Gardener updated successfully')
      setShowEditModal(false)
      setSelectedItems([])
      resetForm()
      await loadGardeners()
    } catch (err: any) {
      setError(err.message || 'Failed to update gardener')
    }
  }

  const handleDelete = async () => {
    if (selectedItems.length === 0) return

    try {
      await deleteGardener(selectedItems[0].id)
      setSuccess('Gardener deleted successfully')
      setShowDeleteModal(false)
      setSelectedItems([])
      await loadGardeners()
    } catch (err: any) {
      setError(err.message || 'Failed to delete gardener')
    }
  }

  const handleMoveUp = async () => {
    if (selectedItems.length === 0) return
    const item = selectedItems[0]
    const currentIndex = gardeners.findIndex(g => g.id === item.id)
    
    if (currentIndex <= 0) return

    const updates = [
      { id: gardeners[currentIndex].id, line_position: gardeners[currentIndex - 1].line_position },
      { id: gardeners[currentIndex - 1].id, line_position: gardeners[currentIndex].line_position },
    ]

    try {
      await reorderGardeners(updates)
      await loadGardeners()
      setSuccess('Position updated')
    } catch (err: any) {
      setError(err.message || 'Failed to reorder')
    }
  }

  const handleMoveDown = async () => {
    if (selectedItems.length === 0) return
    const item = selectedItems[0]
    const currentIndex = gardeners.findIndex(g => g.id === item.id)
    
    if (currentIndex >= gardeners.length - 1) return

    const updates = [
      { id: gardeners[currentIndex].id, line_position: gardeners[currentIndex + 1].line_position },
      { id: gardeners[currentIndex + 1].id, line_position: gardeners[currentIndex].line_position },
    ]

    try {
      await reorderGardeners(updates)
      await loadGardeners()
      setSuccess('Position updated')
    } catch (err: any) {
      setError(err.message || 'Failed to reorder')
    }
  }

  const openEditModal = () => {
    if (selectedItems.length === 0) return
    const item = selectedItems[0]
    setFormData({
      name: item.name,
      email: item.email,
      phone: item.phone || '',
      address: item.address || '',
      experience: item.experience || '',
      notes: item.notes || '',
    })
    setShowEditModal(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      experience: '',
      notes: '',
    })
    setFormErrors({})
  }

  const handlePositionEdit = (id: string, currentPosition: number) => {
    setEditingPositionId(id)
    setEditingPositionValue(currentPosition.toString())
  }

  const handlePositionSave = async (id: string) => {
    const newPosition = parseInt(editingPositionValue, 10)
    
    if (isNaN(newPosition) || newPosition < 1) {
      setError('Position must be a positive number')
      setEditingPositionId(null)
      return
    }

    const gardener = gardeners.find(g => g.id === id)
    if (!gardener) return

    const oldPosition = gardener.line_position

    if (newPosition === oldPosition) {
      setEditingPositionId(null)
      return
    }

    try {
      // Get all gardeners that need to be updated
      const updates: { id: string; line_position: number }[] = []

      if (newPosition > oldPosition) {
        // Moving down: shift items between old and new position up
        gardeners.forEach(g => {
          if (g.line_position > oldPosition && g.line_position <= newPosition) {
            updates.push({ id: g.id, line_position: g.line_position - 1 })
          }
        })
      } else {
        // Moving up: shift items between new and old position down
        gardeners.forEach(g => {
          if (g.line_position >= newPosition && g.line_position < oldPosition) {
            updates.push({ id: g.id, line_position: g.line_position + 1 })
          }
        })
      }

      // Add the moved item
      updates.push({ id, line_position: newPosition })

      await reorderGardeners(updates)
      await loadGardeners()
      setSuccess(`Position updated to ${newPosition}`)
      setEditingPositionId(null)
    } catch (err: any) {
      setError(err.message || 'Failed to update position')
      setEditingPositionId(null)
    }
  }

  const handlePositionCancel = () => {
    setEditingPositionId(null)
    setEditingPositionValue('')
  }

  const handlePositionKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') {
      handlePositionSave(id)
    } else if (e.key === 'Escape') {
      handlePositionCancel()
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
    } catch (err) {
      console.error('Logout error:', err)
    }
    // Redirect to home page
    window.location.href = '/'
  }

  const flashbarItems = []
  if (error) {
    flashbarItems.push({
      type: 'error' as const,
      content: error,
      dismissible: true,
      onDismiss: () => setError(null),
      id: 'error',
    })
  }
  if (success) {
    flashbarItems.push({
      type: 'success' as const,
      content: success,
      dismissible: true,
      onDismiss: () => setSuccess(null),
      id: 'success',
    })
  }

  return (
    <>
      <TopNavigation
        identity={{
          href: "/admin",
          title: "Franklin Hills Community Garden Waitlist Administration",
        }}
        utilities={[
          {
            type: "button",
            text: "Sign Out",
            onClick: handleLogout,
          },
        ]}
      />
      <AppLayout
        navigationHide
        toolsHide
        notifications={flashbarItems.length > 0 ? <Flashbar items={flashbarItems} /> : undefined}
        content={
          <Table
            variant="full-page"
            columnDefinitions={[
              {
                id: 'position',
                header: 'Position',
                cell: item => {
                  if (editingPositionId === item.id) {
                    return (
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <Input
                          value={editingPositionValue}
                          onChange={({ detail }) => setEditingPositionValue(detail.value)}
                          onKeyDown={(e) => handlePositionKeyDown(e as any, item.id)}
                          type="number"
                          inputMode="numeric"
                          autoFocus
                          controlId={`position-${item.id}`}
                        />
                        <Button
                          iconName="check"
                          variant="icon"
                          onClick={() => handlePositionSave(item.id)}
                        />
                        <Button
                          iconName="close"
                          variant="icon"
                          onClick={handlePositionCancel}
                        />
                      </div>
                    )
                  }
                  return (
                    <div 
                      style={{ 
                        cursor: 'pointer', 
                        display: 'flex', 
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      onClick={() => handlePositionEdit(item.id, item.line_position)}
                    >
                      {item.line_position}
                      <Button
                        iconName="edit"
                        variant="inline-icon"
                      />
                    </div>
                  )
                },
                width: 120,
                sortingField: 'line_position',
              },
              {
                id: 'name',
                header: 'Name',
                cell: item => item.name,
                sortingField: 'name',
              },
              {
                id: 'email',
                header: 'Email',
                cell: item => item.email,
                sortingField: 'email',
              },
              {
                id: 'phone',
                header: 'Phone',
                cell: item => item.phone || '-',
              },
              {
                id: 'address',
                header: 'Address',
                cell: item => item.address || '-',
              },
              {
                id: 'experience',
                header: 'Experience',
                cell: item => item.experience || '-',
              },
              {
                id: 'notes',
                header: 'Notes',
                cell: item => item.notes || '-',
              },
              {
                id: 'created_at',
                header: 'Date Added',
                cell: item => new Date(item.created_at).toLocaleDateString(),
                sortingField: 'created_at',
              },
            ]}
            items={gardeners}
            loading={loading}
            loadingText="Loading gardeners..."
            selectionType="single"
            selectedItems={selectedItems}
            onSelectionChange={({ detail }) => setSelectedItems(detail.selectedItems)}
            empty={
              <Box textAlign="center" color="inherit">
                <b>No gardeners</b>
                <Box padding={{ bottom: 's' }} variant="p" color="inherit">
                  No gardeners in the waitlist yet.
                </Box>
              </Box>
            }
            header={
              <Header
                actions={
                  <SpaceBetween direction="horizontal" size="xs">
                    <Button onClick={() => setShowAddModal(true)}>Add Gardener</Button>
                    <Button
                      onClick={openEditModal}
                      disabled={selectedItems.length === 0}
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => setShowDeleteModal(true)}
                      disabled={selectedItems.length === 0}
                    >
                      Delete
                    </Button>
                    <Button
                      onClick={handleMoveUp}
                      disabled={selectedItems.length === 0 || gardeners.findIndex(g => g.id === selectedItems[0]?.id) === 0}
                      iconName="angle-up"
                    >
                      Move Up
                    </Button>
                    <Button
                      onClick={handleMoveDown}
                      disabled={selectedItems.length === 0 || gardeners.findIndex(g => g.id === selectedItems[0]?.id) === gardeners.length - 1}
                      iconName="angle-down"
                    >
                      Move Down
                    </Button>
                    <Button onClick={loadGardeners} iconName="refresh">
                      Refresh
                    </Button>
                  </SpaceBetween>
                }
              >
                Prospective Gardeners ({gardeners.length})
              </Header>
            }
          />
        }
      />

      {/* Add Modal */}
      <Modal
        visible={showAddModal}
        onDismiss={() => {
          setShowAddModal(false)
          resetForm()
        }}
        header="Add New Gardener"
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button
                variant="link"
                onClick={() => {
                  setShowAddModal(false)
                  resetForm()
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleAdd}
                disabled={!formData.name || !formData.email}
              >
                Add
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <Form>
          <SpaceBetween size="l">
            <FormField label="Name" description="Required" errorText={formErrors.name}>
              <Input
                value={formData.name}
                onChange={({ detail }) => handleFormChange('name', detail.value)} onBlur={() => handleBlur('name')}
                placeholder="Full name"
              />
            </FormField>

            <FormField label="Email" description="Required" errorText={formErrors.email}>
              <Input
                type="email"
                value={formData.email}
                onChange={({ detail }) => handleFormChange('email', detail.value)} onBlur={() => handleBlur('email')}
                placeholder="email@example.com"
              />
            </FormField>

            <FormField label="Phone" errorText={formErrors.phone}>
              <Input
                value={formData.phone}
                onChange={({ detail }) => handleFormChange('phone', detail.value)} onBlur={() => handleBlur('phone')}
                placeholder="Phone number"
              />
            </FormField>

            <FormField label="Address">
              <Input
                value={formData.address}
                onChange={({ detail }) => handleFormChange('address', detail.value)}
                placeholder="Full address"
              />
            </FormField>

            <FormField label="Experience">
              <Select
                selectedOption={
                  formData.experience
                    ? { label: formData.experience, value: formData.experience }
                    : null
                }
                onChange={({ detail }) =>
                  handleFormChange('experience', detail.selectedOption.value || '')
                }
                options={[
                  { label: 'No experience', value: 'No experience' },
                  { label: 'Beginner', value: 'Beginner' },
                  { label: 'Intermediate', value: 'Intermediate' },
                  { label: 'Experienced', value: 'Experienced' },
                  { label: 'Expert', value: 'Expert' },
                ]}
                placeholder="Select experience level"
              />
            </FormField>

            <FormField label="Notes">
              <Textarea
                value={formData.notes}
                onChange={({ detail }) => handleFormChange('notes', detail.value)}
                placeholder="Additional information"
                rows={4}
              />
            </FormField>
          </SpaceBetween>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        visible={showEditModal}
        onDismiss={() => {
          setShowEditModal(false)
          resetForm()
        }}
        header="Edit Gardener"
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button
                variant="link"
                onClick={() => {
                  setShowEditModal(false)
                  resetForm()
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleEdit}
                disabled={!formData.name || !formData.email}
              >
                Save
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <Form>
          <SpaceBetween size="l">
            <FormField label="Name" description="Required" errorText={formErrors.name}>
              <Input
                value={formData.name}
                onChange={({ detail }) => handleFormChange('name', detail.value)} onBlur={() => handleBlur('name')}
                placeholder="Full name"
              />
            </FormField>

            <FormField label="Email" description="Required" errorText={formErrors.email}>
              <Input
                type="email"
                value={formData.email}
                onChange={({ detail }) => handleFormChange('email', detail.value)} onBlur={() => handleBlur('email')}
                placeholder="email@example.com"
              />
            </FormField>

            <FormField label="Phone" errorText={formErrors.phone}>
              <Input
                value={formData.phone}
                onChange={({ detail }) => handleFormChange('phone', detail.value)} onBlur={() => handleBlur('phone')}
                placeholder="Phone number"
              />
            </FormField>

            <FormField label="Address">
              <Input
                value={formData.address}
                onChange={({ detail }) => handleFormChange('address', detail.value)}
                placeholder="Full address"
              />
            </FormField>

            <FormField label="Experience">
              <Select
                selectedOption={
                  formData.experience
                    ? { label: formData.experience, value: formData.experience }
                    : null
                }
                onChange={({ detail }) =>
                  handleFormChange('experience', detail.selectedOption.value || '')
                }
                options={[
                  { label: 'No experience', value: 'No experience' },
                  { label: 'Beginner', value: 'Beginner' },
                  { label: 'Intermediate', value: 'Intermediate' },
                  { label: 'Experienced', value: 'Experienced' },
                  { label: 'Expert', value: 'Expert' },
                ]}
                placeholder="Select experience level"
              />
            </FormField>

            <FormField label="Notes">
              <Textarea
                value={formData.notes}
                onChange={({ detail }) => handleFormChange('notes', detail.value)}
                placeholder="Additional information"
                rows={4}
              />
            </FormField>
          </SpaceBetween>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        onDismiss={() => setShowDeleteModal(false)}
        header="Delete Gardener"
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button variant="link" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleDelete}>
                Delete
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <Box>
          Are you sure you want to delete{' '}
          <strong>{selectedItems[0]?.name}</strong>? This action cannot be undone.
        </Box>
      </Modal>
    </>
  )
}

export function AdminPage() {
  return (
    <div className="admin-page-wrapper">
      <AdminAuth>
        <AdminContent />
      </AdminAuth>
    </div>
  )
}
