<template>
  <div class="flex min-h-full flex-col">
    <slot name="header" />
    <main class="mx-auto w-full max-w-6xl flex-1 p-6">
      <slot />
    </main>
  </div>
</template>
