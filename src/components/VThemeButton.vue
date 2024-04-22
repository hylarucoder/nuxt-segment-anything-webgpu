<template>
  <ClientOnly>
    <UButton :icon="icon" color="gray" variant="ghost" aria-label="Theme" @click="toggleTheme" />
  </ClientOnly>
</template>

<script lang="ts" setup>
const colorMode = useColorMode()
const icon = ref("i-mdi-theme-light-dark")
if (colorMode.preference === "light") {
  icon.value = "i-heroicons-sun-20-solid"
}
if (colorMode.preference === "dark") {
  icon.value = "i-heroicons-moon-20-solid"
}

const toggleTheme = () => {
  if (colorMode.preference === "light") {
    colorMode.preference = "dark"
    icon.value = "i-heroicons-moon-20-solid"
  } else if (colorMode.preference === "dark") {
    colorMode.preference = "system"
    icon.value = "i-mdi-theme-light-dark"
  } else {
    colorMode.preference = "light"
    icon.value = "i-heroicons-sun-20-solid"
  }
}
</script>
