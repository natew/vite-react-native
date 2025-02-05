import React from 'react'
import { View, Text, TextInput } from 'react-native'
import { TestComponent } from 'components/TestComponent'
import { TestComponentContainingRelativeImport } from 'components/TestComponentContainingRelativeImport'
import { TestComponentWithFlatList } from 'components/TestComponentWithFlatList'

const text = 'Some text'

export default function Page() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <TextInput testID="text-input" placeholder="Type something here.." />
      <Text testID="route-text-content">{text}</Text>
      <TestComponent />
      <TestComponentContainingRelativeImport />
      <TestComponentWithFlatList />
    </View>
  )
}
