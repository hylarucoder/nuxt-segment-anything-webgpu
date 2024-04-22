<script setup lang="ts">
import { appName } from "./constants"

useHead({
  title: appName,
})

onMounted(() => {
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
