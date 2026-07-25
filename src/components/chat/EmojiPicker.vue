<template>
  <div class="relative" ref="pickerRef">
    <!-- Toggle button -->
    <button
      @click.stop="toggleOpen"
      class="p-2 rounded-full hover:bg-slate-100 transition text-slate-500 shrink-0"
      title="Emoji"
    >
      <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
        <line x1="9" y1="9" x2="9.01" y2="9" />
        <line x1="15" y1="9" x2="15.01" y2="9" />
      </svg>
    </button>

    <!-- Picker popover -->
    <transition name="emoji-pop">
      <div
        v-if="open"
        class="absolute bottom-12 left-0 w-[320px] sm:w-[352px] bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50"
      >
        <!-- Category tabs -->
        <div class="flex items-center gap-0.5 px-2 pt-2 pb-1 border-b border-slate-100 overflow-x-auto">
          <button
            v-for="cat in categories"
            :key="cat.key"
            @click="activeCategory = cat.key"
            class="px-2.5 py-1.5 rounded-lg text-xs font-medium transition shrink-0"
            :class="activeCategory === cat.key
              ? 'bg-green-100 text-green-700'
              : 'text-slate-500 hover:bg-slate-100'"
          >
            {{ cat.label }}
          </button>
        </div>

        <!-- Emoji grid -->
        <div class="overflow-y-auto p-2" style="max-height: 260px;">
          <div class="grid grid-cols-8 gap-0.5">
            <button
              v-for="emoji in filteredEmojis"
              :key="emoji"
              @click="selectEmoji(emoji)"
              class="w-9 h-9 flex items-center justify-center text-xl hover:bg-slate-100 rounded-lg transition cursor-pointer"
              :title="emoji"
            >
              {{ emoji }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const emit = defineEmits(['select'])
const open = ref(false)
const activeCategory = ref('smileys')
const pickerRef = ref(null)

const categories = [
  { key: 'smileys', label: '😊' },
  { key: 'gestures', label: '👋' },
  { key: 'hearts', label: '❤️' },
  { key: 'objects', label: '🎁' },
  { key: 'food', label: '🍕' },
  { key: 'travel', label: '✈️' },
  { key: 'symbols', label: '✅' },
]

const emojiMap = {
  smileys: ['😀','😃','😄','😁','😅','😂','🤣','😊','😇','🙂','😉','😌','😍','🥰','😘','😗','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔','🤐','🤨','😐','😑','😶','😏','😒','🙄','😬','😮','😯','😲','😳','🥺','😢','😭','😤','😠','😡','🤬','😈','👿','💀','☠️','💩','🤡','👹','👺','👻','👽','👾','🤖','😺','😸','😹','😻','😼','😽','🙀','😿','😾'],
  gestures: ['👋','🤚','🖐','✋','🖖','👌','🤌','🤏','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','🖕','👇','☝️','👍','👎','✊','👊','🤛','🤜','👏','🙌','👐','🤲','🤝','🙏','✍️','💅','🤳','💪','🦵','🦶','👂','🦻','👃','🧠','🫀','🫁','🦷','🦴','👀','👁','👅','👄'],
  hearts: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝','💟','♥️','💌','🫶'],
  objects: ['🎁','🎀','🎗','🎟','🎫','🎭','🎨','🖼','🎬','🎤','🎧','🎵','🎶','🎙','🎚','🎛','📻','📱','📲','💻','⌨️','🖥','🖨','🖱','🖲','🕹','🗜','💿','📀','📼','📷','📸','📹','🎥','📽','🎞','📞','☎️','📟','📠','📺','📻','⏰','⏱','⏲','🕰','🧭','🌡','🔥','💡','🔦','🔋','🔌'],
  food: ['🍏','🍎','🍐','🍊','🍋','🍌','🍉','🍇','🍓','🫐','🍈','🍒','🍑','🥭','🍍','🥥','🥝','🍅','🍆','🥑','🥦','🥬','🥒','🌶','🫑','🌽','🥕','🫒','🧄','🧅','🥔','🍠','🥐','🍞','🥖','🥨','🧀','🥚','🍳','🧈','🥞','🧇','🥓','🥩','🍗','🍖','🦴','🌭','🍔','🍟','🍕','🥪','🥙','🧆','🌮','🌯','🥗','🍿','🧂','🥫','🍱','🍘','🍙','🍚','🍛','🍜','🍝','🍠','🍢','🍣','🍤','🍥','🥮','🍡','🥟','🥠','🥡','🦀','🦞','🦐','🦑','🍦','🍧','🍨','🍩','🍪','🎂','🍰','🧁','🥧','🍫','🍬','🍭','🍮','🍯','☕','🍵','🍶','🍾','🍷','🍸','🍹','🍺','🍻','🥂','🥃','🧊'],
  travel: ['✈️','🛩','🛫','🛬','🚀','🛸','🚁','🛶','⛵️','🚤','🛳','⛴','🛥','🚢','🚂','🚃','🚄','🚅','🚆','🚇','🚈','🚉','🚊','🚝','🚞','🚋','🚌','🚍','🚎','🚐','🚑','🚒','🚓','🚔','🚕','🚖','🚗','🚘','🚙','🚚','🚛','🚜','🏎','🏍','🛵','🛺','🚲','🛴','🛹','🚏','🛣','🛤','⛽','🛑','🚧','⚓','🏁','🚩','🎌','🏴‍☠️'],
  symbols: ['✅','❌','❓','❔','❕','❗','‼️','⁉️','➕','➖','➗','✖️','♻️','💯','❎','🔴','🟠','🟡','🟢','🔵','🟣','🟤','⚫','⚪','🔘','🛑','⛔','📛','🚫','🚳','🚭','🚯','🚱','🚵','🚷','🚸','🔞','☢️','☣️','⚠️','🔰','💲','💱','©️','®️','™️','🔚','🔙','🔛','🔝','🔜','🆚','🆖','🆗','🆘','🆙','🆚','🅰️','🅱️','🅾️','🆎','🆑','🆒','🆓','🆔','🆕','🔤','🔡','🔠','🔣','🔢','🔟','🉐','㊗️','㊙️','🉑','🈁','🈂️','🈷️','🈶','🈚','🈸','🈺'],
}

const filteredEmojis = computed(() => emojiMap[activeCategory.value] || [])

function toggleOpen() {
  open.value = !open.value
}

function selectEmoji(emoji) {
  emit('select', emoji)
  open.value = false
}

function handleClickOutside(e) {
  if (pickerRef.value && !pickerRef.value.contains(e.target)) {
    open.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.emoji-pop-enter-active,
.emoji-pop-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.emoji-pop-enter-from,
.emoji-pop-leave-to {
  opacity: 0;
  transform: translateY(6px) scale(0.96);
}
</style>
