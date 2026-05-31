import React from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs'

export default {
  title: 'Common/UI/Tabs',
  component: Tabs,
}

export const Default = () => (
  <Tabs defaultValue={0}>
    <TabsList>
      <TabsTrigger value={0}>Home</TabsTrigger>
      <TabsTrigger value={1}>Profile</TabsTrigger>
      <TabsTrigger value={2}>Settings</TabsTrigger>
      <TabsTrigger value={3}>More</TabsTrigger>
    </TabsList>

    <TabsContent value={0}>Home content</TabsContent>
    <TabsContent value={1}>Profile content</TabsContent>
    <TabsContent value={2}>Settings content</TabsContent>
    <TabsContent value={3}>More content</TabsContent>
  </Tabs>
)
