import React from 'react'
import { render } from '@testing-library/react'
import { toHaveNoViolations } from 'jest-axe'
import { axe } from 'jest-axe'
import { Input } from '../Input'

expect.extend(toHaveNoViolations)

describe('Input accessibility', () => {
  test('has no detectable a11y violations', async () => {
    const { container } = render(<Input placeholder="Name" />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
