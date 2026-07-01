import { render } from 'test-utils/render'

import Landing from '.'

describe('Landing page', () => {
  it('does not render nft information and card', () => {
    const { container } = render(<Landing />)
    expect(container).toMatchSnapshot()
    expect(container).not.toHaveTextContent('NFTs')
    expect(container).not.toHaveTextContent('NFT')
    expect(container).toHaveTextContent('Trade crypto with confidence')
    expect(container).toHaveTextContent('Buy, sell, and explore tokens')
    expect(container).not.toHaveTextContent('Trade NFTs')
    expect(container).not.toHaveTextContent('Explore NFTs')
    expect(container).not.toHaveTextContent(
      'Buy and sell NFTs across marketplaces to find more listings at better prices.'
    )
  })
})
