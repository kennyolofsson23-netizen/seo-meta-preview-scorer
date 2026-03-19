import { render, screen } from '@testing-library/react'
import { SocialCardPreview } from './SocialCardPreview'

const defaultProps = {
  title: 'My Page Title',
  description: 'My page description text here',
  url: 'https://example.com/page',
}

describe('SocialCardPreview', () => {
  it('shows placeholder when no ogImage is provided', () => {
    render(<SocialCardPreview {...defaultProps} />)

    expect(screen.getByText('Add an ogImage URL to see a preview')).toBeInTheDocument()
    expect(screen.getByText('Recommended: 1200×630px')).toBeInTheDocument()
  })

  it('shows image element when ogImage URL is provided', () => {
    render(
      <SocialCardPreview
        {...defaultProps}
        ogImage="https://example.com/og-image.jpg"
      />
    )

    const img = screen.getByRole('img')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', 'https://example.com/og-image.jpg')
  })

  it('falls back to title when ogTitle is not provided', () => {
    render(<SocialCardPreview {...defaultProps} />)

    expect(screen.getByText('My Page Title')).toBeInTheDocument()
  })

  it('uses ogTitle instead of title when ogTitle is provided', () => {
    render(
      <SocialCardPreview
        {...defaultProps}
        ogTitle="OG Specific Title"
      />
    )

    expect(screen.getByText('OG Specific Title')).toBeInTheDocument()
    expect(screen.queryByText('My Page Title')).not.toBeInTheDocument()
  })

  it('falls back to description when ogDescription is not provided', () => {
    render(<SocialCardPreview {...defaultProps} />)

    expect(screen.getByText('My page description text here')).toBeInTheDocument()
  })

  it('uses ogDescription when provided', () => {
    render(
      <SocialCardPreview
        {...defaultProps}
        ogDescription="OG specific description"
      />
    )

    expect(screen.getByText('OG specific description')).toBeInTheDocument()
    expect(screen.queryByText('My page description text here')).not.toBeInTheDocument()
  })

  it('shows domain extracted from URL', () => {
    render(<SocialCardPreview {...defaultProps} url="https://mywebsite.com/page" />)

    expect(screen.getByText('mywebsite.com')).toBeInTheDocument()
  })

  it('shows example.com when URL is empty', () => {
    render(<SocialCardPreview {...defaultProps} url="" />)

    expect(screen.getByText('example.com')).toBeInTheDocument()
  })
})
