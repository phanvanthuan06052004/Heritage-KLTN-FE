import React from 'react'
import { render } from '@testing-library/react'
import { toHaveNoViolations } from 'jest-axe'
import { axe } from 'jest-axe'
import { Card } from '../Card'

expect.extend(toHaveNoViolations)

describe('Card accessibility', () => {
  test('has no detectable a11y violations', async () => {
    const { container } = render(
      <Card>
        <div className="p-4">
        <h3 className="text-lg font-semibold">Card Title</h3>
        <p className="mt-2 text-sm text-[color:var(--muted-foreground)]">Description</p>
      </div>
      </Card>,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
