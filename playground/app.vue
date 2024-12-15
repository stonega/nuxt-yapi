<script setup lang="ts">
const { $api } = useNuxtApp()
const { data } = useAsyncData('demo-openapi', async () => {
  const response = await $api.blockchainPairs({})
  console.log(response)
  return response
}, {
  server: false,
})
</script>

<template>
  <div>
    {{ data }}
  </div>
</template>
