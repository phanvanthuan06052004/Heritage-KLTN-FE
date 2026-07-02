import React from 'react'
import { render } from '@testing-library/react'
import { toHaveNoViolations } from 'jest-axe'
import { axe } from 'jest-axe'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../Table'

expect.extend(toHaveNoViolations)

describe('Table accessibility', () => {
  test('has no detectable a11y violations', async () => {
    const { container } = render(
      <Table>
        <TableHeader>
          <tr>
            <TableHead>Name</TableHead>
            <TableHead>City</TableHead>
          </tr>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Jane</TableCell>
            <TableCell>Hanoi</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>John</TableCell>
            <TableCell>Saigon</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    )

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
