import React from 'react'
import { render } from '@testing-library/react'
import { toHaveNoViolations } from 'jest-axe'
import { axe } from 'jest-axe'
import { Button } from '../Button'

expect.extend(toHaveNoViolations)

describe('Button accessibility', () => {
  test('has no detectable a11y violations', async () => {
    const { container } = render(<Button>Click me</Button>)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
