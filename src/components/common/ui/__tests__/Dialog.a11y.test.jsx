import React from 'react'
import { render } from '@testing-library/react'
import { toHaveNoViolations } from 'jest-axe'
import { axe } from 'jest-axe'
import { Dialog } from '../Dialog'

expect.extend(toHaveNoViolations)

describe('Dialog accessibility', () => {
  test('has no detectable a11y violations when open', async () => {
    const { container } = render(
      <Dialog open={true} onClose={() => {}} aria-label="Sample dialog">
        <div>
          <h2>Title</h2>
          <p>Dialog content</p>
          <button>Ok</button>
        </div>
      </Dialog>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
