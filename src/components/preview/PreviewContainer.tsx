'use client'

import { useRef } from 'react'
import * as RadixTabs from '@radix-ui/react-tabs'
import { Monitor, Smartphone, Search, Share2 } from 'lucide-react'
import { GoogleDesktopPreview } from './GoogleDesktopPreview'
import { GoogleMobilePreview } from './GoogleMobilePreview'
import { BingPreview } from './BingPreview'
import { SocialCardPreview } from './SocialCardPreview'
import { ScreenshotButton } from '@/components/export/ScreenshotButton'
import { ScreenshotWatermark } from '@/components/export/ScreenshotWatermark'
import { cn } from '@/lib/utils'

export interface PreviewContainerProps {
  title: string
  description: string
  url: string
  keyword?: string
  ogImage?: string
  ogTitle?: string
  ogDescription?: string
  className?: string
}

const TABS = [
  { value: 'google-desktop', label: 'Google', icon: Monitor },
  { value: 'google-mobile', label: 'Mobile', icon: Smartphone },
  { value: 'bing', label: 'Bing', icon: Search },
  { value: 'social', label: 'Social', icon: Share2 },
] as const

export function PreviewContainer({
  title,
  description,
  url,
  keyword,
  ogImage,
  ogTitle,
  ogDescription,
  className,
}: PreviewContainerProps) {
  const previewRef = useRef<HTMLDivElement>(null)

  return (
    <div className={cn('rounded-lg border border-border bg-card', className)}>
      <RadixTabs.Root defaultValue="google-desktop">
        {/* Tab bar */}
        <div className="flex items-center justify-between border-b border-border px-4 pt-3">
          <RadixTabs.List
            className="flex gap-1"
            aria-label="Preview engine"
          >
            {TABS.map(({ value, label, icon: Icon }) => (
              <RadixTabs.Trigger
                key={value}
                value={value}
                className={cn(
                  'flex items-center gap-1.5 rounded-t px-3 py-2 text-sm font-medium transition-colors',
                  'text-muted-foreground hover:text-foreground',
                  'data-[state=active]:border-b-2 data-[state=active]:border-primary',
                  'data-[state=active]:text-foreground',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                )}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{label}</span>
              </RadixTabs.Trigger>
            ))}
          </RadixTabs.List>

          {/* Export button */}
          <ScreenshotButton
            targetRef={previewRef}
            format="png"
          />
        </div>

        {/* Preview panels */}
        <div ref={previewRef} className="relative p-4 sm:p-6">
          <RadixTabs.Content value="google-desktop" className="focus-visible:outline-none">
            <div
              aria-label="Google Desktop preview"
              className="rounded border border-border bg-white dark:bg-[#202124] p-4"
            >
              <GoogleDesktopPreview
                title={title}
                description={description}
                url={url}
                keyword={keyword}
              />
            </div>
          </RadixTabs.Content>

          <RadixTabs.Content value="google-mobile" className="focus-visible:outline-none">
            <div aria-label="Google Mobile preview" className="flex justify-center">
              <GoogleMobilePreview
                title={title}
                description={description}
                url={url}
                keyword={keyword}
                showPhoneFrame={true}
              />
            </div>
          </RadixTabs.Content>

          <RadixTabs.Content value="bing" className="focus-visible:outline-none">
            <div
              aria-label="Bing preview"
              className="rounded border border-border bg-white dark:bg-[#1B1B1B] p-4"
            >
              <BingPreview
                title={title}
                description={description}
                url={url}
                keyword={keyword}
              />
            </div>
          </RadixTabs.Content>

          <RadixTabs.Content value="social" className="focus-visible:outline-none">
            <div aria-label="Social card preview" className="flex justify-center">
              <SocialCardPreview
                title={title}
                description={description}
                url={url}
                ogImage={ogImage}
                ogTitle={ogTitle}
                ogDescription={ogDescription}
              />
            </div>
          </RadixTabs.Content>

          {/* Watermark — captured by html2canvas */}
          <ScreenshotWatermark />
        </div>
      </RadixTabs.Root>
    </div>
  )
}
