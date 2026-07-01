import { useIsMobile, useIsTablet } from 'nft/hooks'
import { useIsNavSearchInputVisible } from 'nft/hooks/useIsNavSearchInputVisible'
import { mocked } from 'test-utils/mocked'
import { render, screen } from 'test-utils/render'

import { SearchBar } from './SearchBar'

jest.mock('nft/hooks')
jest.mock('nft/hooks/useIsNavSearchInputVisible')

describe('SearchBar', () => {
  beforeEach(() => {
    mocked(useIsMobile).mockReturnValue(false)
    mocked(useIsTablet).mockReturnValue(false)
    mocked(useIsNavSearchInputVisible).mockReturnValue(true)
  })

  it('should render search tokens placeholder', () => {
    const { container } = render(<SearchBar />)
    expect(container).toMatchSnapshot()
    expect(screen.queryByPlaceholderText('Search tokens')).toBeVisible()
  })
})
