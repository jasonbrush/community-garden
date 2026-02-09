import type { Theme } from '@cloudscape-design/components/theming'

/**
 * Community garden custom theme
 * Page bg: c2b4a6 | Container: fef9f7 | H1: e7b300 | Container borders: 6e7f29
 */
export const communityGardenTheme: Theme = {
  referenceTokens: {
    color: {
      primary: '#1aa9bc',
      success: '#457c39',
      warning: '#ffeb00',
    },
  },
  tokens: {
    colorBackgroundLayoutMain: '#635045',
    colorBackgroundContainerContent: '#fef9f7',
    colorBackgroundContainerHeader: '#6e7f29',
    colorBackgroundInputDefault: '#ffffff',
    colorBackgroundPopover: '#ffffff',
    colorBackgroundDialog: '#ffffff',
    colorBorderContainerTop: '#6e7f29',
    colorBorderDividerDefault: 'rgba(110, 127, 41, 0.3)',
    colorBorderInputDefault: 'rgba(110, 127, 41, 0.3)',
    colorBorderInputFocused: '#6e7f29',
    // Typography overrides
    fontSizeHeadingXl: '56px',
    lineHeightHeadingXl: '53px',
    fontWeightHeadingXl: '400',
    fontSizeHeadingL: '32px',
    lineHeightHeadingL: '34px',
    fontWeightHeadingL: '700',
    fontSizeHeadingM: '24px',
    lineHeightHeadingM: '26px',
    fontWeightHeadingM: '600',
    fontSizeBodyM: '18px',
    lineHeightBodyM: '27px',
    fontSizeBodyS: '14px',
    lineHeightBodyS: '20px',
  },
  contexts: {
    header: {
      tokens: {
        colorBackgroundLayoutMain: '#635045',
        colorTextHeadingDefault: '#e7b300',
        colorTextBodyDefault: 'rgba(255, 255, 255, 0.9)',
        colorTextBodySecondary: 'rgba(255, 255, 255, 0.8)',
      },
    },
  },
}
