import React from 'react'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './Table'

export default {
  title: 'Common/UI/Table',
  component: Table,
}

export const Default = () => (
  <Table>
    <TableHeader>
      <tr>
        <TableHead>Name</TableHead>
        <TableHead>Age</TableHead>
        <TableHead>City</TableHead>
      </tr>
    </TableHeader>
    <TableBody>
      <TableRow>
        <TableCell>Jane Doe</TableCell>
        <TableCell>28</TableCell>
        <TableCell>Hanoi</TableCell>
      </TableRow>
      <TableRow hoverable onClick={() => alert('Row clicked')}>
        <TableCell>John Smith</TableCell>
        <TableCell>34</TableCell>
        <TableCell>Saigon</TableCell>
      </TableRow>
    </TableBody>
  </Table>
)
