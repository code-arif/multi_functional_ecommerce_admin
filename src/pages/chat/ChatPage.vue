<template>
  <div class="flex h-[calc(100vh-120px)] bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
    <transition name="skeleton-fade" mode="out-in">
      <!-- ─── Skeleton ─── -->
      <div v-if="loading" key="skeleton" class="flex w-full h-full">
        <ChatConversationsSkeleton :items="6" />
        <ChatMessagesSkeleton />
      </div>

      <!-- ─── Real Content ─── -->
      <div v-else key="content" class="flex w-full h-full">
        <!-- ════════════════════════════════════════════
             LEFT — Conversation List
             ════════════════════════════════════════════ -->
        <div class="w-80 lg:w-88 shrink-0 border-r border-slate-200 flex flex-col bg-white">
          <!-- Search -->
          <div class="p-3 border-b border-slate-200">
            <div class="relative">
              <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search or start a new chat"
                class="w-full rounded-lg pl-9 pr-3 py-2 text-sm bg-slate-100 border-0 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 transition"
              />
            </div>
          </div>

          <!-- Conversations -->
          <div class="flex-1 overflow-y-auto" @click="closeAllMenus">
            <div
              v-for="conv in filteredConversations"
              :key="conv.id"
              class="group relative flex items-start gap-3 p-3 transition border-b border-slate-100 last:border-b-0 cursor-pointer"
              :class="[
                activeConv?.id === conv.id ? 'bg-green-50' : 'hover:bg-slate-50',
                conv.disabled || conv.blocked ? 'opacity-60' : ''
              ]"
              @click="selectConversation(conv)"
            >
              <!-- Avatar with online dot + pinned indicator -->
              <div class="relative shrink-0">
                <div
                  class="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold"
                  :style="{ backgroundColor: conv.color }"
                >
                  {{ conv.name.charAt(0).toUpperCase() }}
                </div>
                <span
                  v-if="conv.online"
                  class="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 border-2 border-white rounded-full bg-green-500"
                ></span>
                <span
                  v-if="conv.pinned"
                  class="absolute -top-1 -left-1 w-4 h-4 flex items-center justify-center"
                >
                  <svg class="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"/></svg>
                </span>
              </div>

              <div class="flex-1 min-w-0" @click.stop>
                <div class="flex items-center justify-between gap-1">
                  <p
                    class="text-sm truncate"
                    :class="conv.unread ? 'font-bold text-slate-900' : 'font-semibold text-slate-800'"
                  >
                    {{ conv.name }}
                    <span v-if="conv.muted" class="text-slate-400 ml-1">🔇</span>
                    <span v-if="conv.disabled" class="text-red-500 ml-1">🚫</span>
                    <span v-if="conv.blocked" class="text-red-500 ml-1">⛔</span>
                  </p>
                  <span class="text-[10px] shrink-0 text-slate-400">{{ conv.time }}</span>
                </div>
                <p class="text-xs truncate mt-0.5 text-slate-500">{{ conv.last_message }}</p>
                <div class="flex items-center gap-2 mt-1.5">
                  <span
                    v-if="conv.unread"
                    class="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white bg-green-600 leading-none"
                  >
                    {{ conv.unread }}
                  </span>
                  <span class="text-[10px] text-slate-400 flex items-center gap-1">
                    <span
                      class="inline-block w-1.5 h-1.5 rounded-full"
                      :class="conv.online ? 'bg-green-500' : 'bg-slate-300'"
                    ></span>
                    {{ conv.online ? 'Online' : conv.lastSeen || 'Offline' }}
                  </span>
                </div>
              </div>

              <!-- Three-dot menu -->
              <div class="relative shrink-0" @click.stop>
                <button
                  @click="convMenuOpen = convMenuOpen === conv.id ? null : conv.id"
                  class="p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-200 text-slate-400"
                  :class="convMenuOpen === conv.id ? '!opacity-100 bg-slate-200' : ''"
                >
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4z"/></svg>
                </button>

                <!-- Dropdown menu -->
                <transition name="menu-pop">
                  <div
                    v-if="convMenuOpen === conv.id"
                    class="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50"
                    @click.stop
                  >
                    <button @click="togglePin(conv)" class="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition">
                      <svg class="w-4 h-4" :class="conv.pinned ? 'text-amber-500' : 'text-slate-400'" fill="currentColor" viewBox="0 0 20 20"><path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"/></svg>
                      {{ conv.pinned ? 'Unpin' : 'Pin' }} conversation
                    </button>
                    <button @click="toggleMute(conv)" class="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition">
                      <BellIcon class="w-4 h-4" :class="conv.muted ? 'text-slate-400' : 'text-slate-400'" />
                      {{ conv.muted ? 'Unmute' : 'Mute' }}
                    </button>
                    <button @click="markUnread(conv)" class="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition">
                      <EnvelopeIcon class="w-4 h-4 text-slate-400" />
                      Mark as unread
                    </button>
                    <hr class="my-1 border-slate-100" />
                    <button @click="toggleDisable(conv)" class="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition">
                      <NoSymbolIcon class="w-4 h-4" :class="conv.disabled ? 'text-red-500' : 'text-slate-400'" />
                      {{ conv.disabled ? 'Enable chat' : 'Disable chat' }}
                    </button>
                    <button @click="toggleBlock(conv)" class="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition">
                      <ExclamationTriangleIcon class="w-4 h-4" :class="conv.blocked ? 'text-red-500' : 'text-slate-400'" />
                      {{ conv.blocked ? 'Unblock' : 'Block user' }}
                    </button>
                    <hr class="my-1 border-slate-100" />
                    <button @click="deleteConversation(conv)" class="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition">
                      <TrashIcon class="w-4 h-4" />
                      Delete conversation
                    </button>
                  </div>
                </transition>
              </div>
            </div>

            <!-- Empty search -->
            <div
              v-if="!filteredConversations.length"
              class="flex flex-col items-center justify-center py-12 text-slate-400"
            >
              <MagnifyingGlassIcon class="w-10 h-10 mb-2" />
              <p class="text-sm font-medium text-slate-500">No conversations found</p>
              <p class="text-xs mt-1">Try a different search term</p>
            </div>
          </div>
        </div>

        <!-- ════════════════════════════════════════════
             RIGHT — Message View
             ════════════════════════════════════════════ -->
        <div class="flex-1 flex flex-col relative" style="background-color: #efeae2;">
          <!-- ── No conversation selected ── -->
          <div
            v-if="!activeConv"
            class="flex-1 flex items-center justify-center"
            style="background-color: #efeae2;"
          >
            <div class="text-center px-6">
              <div class="w-20 h-20 rounded-full bg-white shadow-sm flex items-center justify-center mx-auto mb-5">
                <ChatBubbleLeftRightIcon class="w-10 h-10 text-green-600" />
              </div>
              <p class="text-lg font-bold text-slate-800">EcoShop Support Chat</p>
              <p class="text-sm text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                Select a conversation from the left panel to start messaging with your customers.
              </p>
            </div>
          </div>

          <!-- ── Active conversation ── -->
          <template v-if="activeConv">
            <!-- Header -->
            <div class="px-4 py-2.5 flex items-center gap-3 bg-white border-b border-slate-200 shrink-0 shadow-sm z-10">
              <div class="relative shrink-0">
                <div
                  class="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                  :style="{ backgroundColor: activeConv.color }"
                >
                  {{ activeConv.name.charAt(0).toUpperCase() }}
                </div>
                <span
                  v-if="activeConv.online"
                  class="absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-white rounded-full bg-green-500"
                ></span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-bold text-slate-900 truncate">{{ activeConv.name }}</p>
                <p class="text-[11px] text-slate-500">
                  <template v-if="activeConv.online">online</template>
                  <template v-else>last seen {{ activeConv.lastSeen || 'recently' }}</template>
                </p>
              </div>
              <button
                @click="toggleMessageSearch"
                class="p-1.5 rounded-lg hover:bg-slate-100 transition"
                :class="showMessageSearch ? 'bg-green-100 text-green-700' : 'text-slate-400'"
                title="Search in conversation"
              >
                <MagnifyingGlassIcon class="w-5 h-5" />
              </button>

              <!-- Header admin actions -->
              <div class="relative" @click.stop>
                <button
                  @click="showConvActions = !showConvActions"
                  class="p-1.5 rounded-lg hover:bg-slate-100 transition text-slate-400"
                  :class="showConvActions ? 'bg-slate-100' : ''"
                  title="Admin actions"
                >
                  <EllipsisVerticalIcon class="w-5 h-5" />
                </button>
                <transition name="menu-pop">
                  <div
                    v-if="showConvActions"
                    class="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50"
                    @click.stop
                  >
                    <button @click="togglePin(activeConv)" class="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition">
                      <svg class="w-4 h-4" :class="activeConv.pinned ? 'text-amber-500' : 'text-slate-400'" fill="currentColor" viewBox="0 0 20 20"><path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"/></svg>
                      {{ activeConv.pinned ? 'Unpin' : 'Pin' }} conversation
                    </button>
                    <button @click="toggleMute(activeConv)" class="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition">
                      <BellIcon class="w-4 h-4 text-slate-400" />
                      {{ activeConv.muted ? 'Unmute' : 'Mute' }}
                    </button>
                    <button @click="markUnread(activeConv)" class="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition">
                      <EnvelopeIcon class="w-4 h-4 text-slate-400" />
                      Mark as unread
                    </button>
                    <hr class="my-1 border-slate-100" />
                    <button @click="toggleDisable(activeConv)" class="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition">
                      <NoSymbolIcon class="w-4 h-4" :class="activeConv.disabled ? 'text-red-500' : 'text-slate-400'" />
                      {{ activeConv.disabled ? 'Enable chat' : 'Disable chat' }}
                    </button>
                    <button @click="toggleBlock(activeConv)" class="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition">
                      <ExclamationTriangleIcon class="w-4 h-4" :class="activeConv.blocked ? 'text-red-500' : 'text-slate-400'" />
                      {{ activeConv.blocked ? 'Unblock user' : 'Block user' }}
                    </button>
                    <hr class="my-1 border-slate-100" />
                    <button @click="deleteConversation(activeConv)" class="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition">
                      <TrashIcon class="w-4 h-4" />
                      Delete conversation
                    </button>
                  </div>
                </transition>
              </div>

              <button
                @click="activeConv = null"
                class="p-1.5 rounded-lg hover:bg-slate-100 transition text-slate-400"
                title="Close"
              >
                <XMarkIcon class="w-5 h-5" />
              </button>
            </div>

            <!-- Search bar -->
            <transition name="search-slide">
              <div
                v-if="showMessageSearch"
                class="px-3 py-2 bg-white border-b border-slate-200 shrink-0"
              >
                <div class="flex items-center gap-2">
                  <div class="flex-1 relative">
                    <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      v-model="messageSearchQuery"
                      class="message-search-input w-full rounded-lg pl-9 pr-3 py-2 text-sm bg-slate-100 border-0 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 transition"
                      placeholder="Search messages..."
                      @keydown.enter="nextSearchResult"
                      @keydown.escape="toggleMessageSearch"
                    />
                  </div>
                  <span
                    v-if="messageSearchQuery"
                    class="text-[11px] text-slate-500 shrink-0 whitespace-nowrap"
                  >
                    {{ messageSearchResults.length ? `${messageSearchIndex + 1} of ${messageSearchResults.length}` : '0 results' }}
                  </span>
                  <button
                    v-if="messageSearchResults.length > 1"
                    @click="prevSearchResult"
                    class="p-1.5 rounded-lg hover:bg-slate-100 transition text-slate-400"
                    title="Previous"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/></svg>
                  </button>
                  <button
                    v-if="messageSearchResults.length > 1"
                    @click="nextSearchResult"
                    class="p-1.5 rounded-lg hover:bg-slate-100 transition text-slate-400"
                    title="Next"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                  </button>
                  <button
                    @click="toggleMessageSearch"
                    class="p-1.5 rounded-lg hover:bg-slate-100 transition text-slate-400"
                    title="Close search"
                  >
                    <XMarkIcon class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </transition>

            <!-- Disabled chat banner -->
            <div
              v-if="isChatDisabled"
              class="px-4 py-2.5 bg-red-50 border-b border-red-200 shrink-0 flex items-center gap-2"
            >
              <NoSymbolIcon class="w-4 h-4 text-red-500 shrink-0" />
              <p class="text-xs text-red-700">
                <strong>Chat {{ activeConv.blocked ? 'blocked' : 'disabled' }}.</strong>
                {{ activeConv.blocked
                  ? 'This user has been blocked and cannot receive messages.'
                  : 'This conversation has been disabled by an admin.' }}
                <button @click="toggleDisable(activeConv)" class="underline font-semibold hover:text-red-800 ml-1">Enable</button>
              </p>
            </div>

            <!-- Messages -->
            <div
              ref="messagesContainer"
              class="flex-1 overflow-y-auto px-4 py-3 space-y-1 scroll-smooth"
              @scroll="onMessagesScroll"
            >
              <template v-for="(group, gIdx) in groupedMessages" :key="gIdx">
                <!-- Date separator -->
                <div class="flex justify-center my-3">
                  <span
                    class="text-[11px] font-semibold px-3 py-1 rounded-full shadow-sm"
                    style="background-color: rgba(225, 245, 254, 0.92); color: #54656f;"
                  >
                    {{ group.date }}
                  </span>
                </div>

                <!-- Messages in this date group -->
                <div
                  v-for="(msg, mIdx) in group.items"
                  :key="msg.id"
                  :id="`msg-${msg.id}`"
                  class="flex"
                  :class="[
                    msg.is_admin ? 'justify-end' : 'justify-start',
                    messageSearchQuery && messageSearchResults.some(r => r.msg.id === msg.id)
                      ? messageSearchResults[messageSearchIndex]?.msg.id === msg.id
                        ? 'search-current'
                        : 'search-match'
                      : ''
                  ]"
                >
                  <div
                    class="relative max-w-[75%] md:max-w-[65%] px-3.5 py-2 text-sm shadow-sm"
                    :class="msg.is_admin
                      ? 'rounded-lg rounded-br-sm'
                      : 'rounded-lg rounded-bl-sm'"
                    :style="msg.is_admin
                      ? { backgroundColor: '#d9fdd3', color: '#111b21' }
                      : { backgroundColor: '#ffffff', color: '#111b21' }"
                  >
                    <!-- Image attachments -->
                    <div v-if="msg.attachments?.length" class="space-y-1.5 -mx-0.5">
                      <div
                        v-for="att in msg.attachments"
                        :key="att.name"
                        class="rounded-lg overflow-hidden"
                        :class="att.isImage ? '' : 'flex items-center gap-2 bg-black/5 px-3 py-2'"
                      >
                        <!-- Image -->
                        <img
                          v-if="att.isImage && att.url"
                          :src="att.url"
                          :alt="att.name"
                          class="max-w-full rounded-lg cursor-pointer hover:opacity-95 transition"
                          style="max-height: 200px; object-fit: cover;"
                          @click.stop="openImagePreview(att.url)"
                        />
                        <!-- File -->
                        <template v-else-if="!att.isImage">
                          <DocumentTextIcon class="w-5 h-5 shrink-0 text-slate-500" />
                          <div class="min-w-0 flex-1">
                            <p class="text-[12px] font-medium truncate" :class="msg.is_admin ? 'text-green-900' : 'text-slate-700'">
                              {{ att.name }}
                            </p>
                            <p class="text-[10px]" :class="msg.is_admin ? 'text-green-800/60' : 'text-slate-500'">
                              {{ formatFileSize(att.size) }}
                            </p>
                          </div>
                          <ArrowDownTrayIcon class="w-4 h-4 shrink-0 text-slate-400" />
                        </template>
                      </div>
                    </div>

                    <!-- Text with search highlighting -->
                    <p v-if="msg.text" class="whitespace-pre-wrap leading-relaxed">
                      <template v-if="messageSearchQuery">
                        <span
                          v-for="(part, pIdx) in highlightText(msg.text, messageSearchQuery)"
                          :key="pIdx"
                          :class="part.highlight ? 'bg-yellow-300/70 rounded-sm px-0.5' : ''"
                        >{{ part.text }}</span>
                      </template>
                      <template v-else>{{ msg.text }}</template>
                    </p>

                    <!-- Time + Status row -->
                    <div class="flex items-center justify-end gap-1 mt-0.5 -mb-0.5">
                      <span class="text-[10px]" :style="{ color: msg.is_admin ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.45)' }">
                        {{ msg.time }}
                      </span>
                      <!-- Read status (admin messages only) -->
                      <span v-if="msg.is_admin" class="flex items-center">
                        <CheckIcon v-if="msg.status === 'sent'" class="w-3 h-3 text-slate-400" />
                        <template v-if="msg.status === 'delivered'">
                          <CheckIcon class="w-3 h-3 -mr-1.5 text-slate-400" />
                          <CheckIcon class="w-3 h-3 text-slate-400" />
                        </template>
                        <template v-if="msg.status === 'read'">
                          <CheckIcon class="w-3 h-3 -mr-1.5 text-blue-500" />
                          <CheckIcon class="w-3 h-3 text-blue-500" />
                        </template>
                      </span>
                    </div>
                  </div>
                </div>
              </template>

              <!-- Typing indicator -->
              <div v-if="typing" class="flex justify-start py-1">
                <div class="bg-white rounded-lg rounded-bl-sm px-4 py-3 shadow-sm flex items-center gap-2">
                  <div class="flex gap-1">
                    <span class="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style="animation-delay: 0ms;"></span>
                    <span class="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style="animation-delay: 150ms;"></span>
                    <span class="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style="animation-delay: 300ms;"></span>
                  </div>
                  <span class="text-[11px] text-slate-500 italic">typing</span>
                </div>
              </div>

              <!-- Scroll anchor -->
              <div ref="scrollAnchor"></div>
            </div>

            <!-- Scroll to bottom FAB -->
            <transition name="fab-fade">
              <button
                v-if="showScrollBtn"
                @click="scrollToBottom(true)"
                class="absolute bottom-20 right-6 w-9 h-9 rounded-full bg-white shadow-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:text-green-600 hover:border-green-300 transition-all z-10"
              >
                <ChevronDownIcon class="w-5 h-5" />
              </button>
            </transition>

            <!-- Attachment preview bar -->
            <div
              v-if="attachments.length"
              class="px-3 py-2 bg-white border-t border-slate-200 shrink-0"
            >
              <div class="flex items-center gap-2 overflow-x-auto pb-1">
                <div
                  v-for="(file, idx) in attachments"
                  :key="idx"
                  class="relative shrink-0 group"
                >
                  <!-- Image preview -->
                  <div
                    v-if="file.isImage"
                    class="w-16 h-16 rounded-lg overflow-hidden border border-slate-200"
                  >
                    <img
                      :src="file.preview"
                      :alt="file.name"
                      class="w-full h-full object-cover"
                    />
                  </div>
                  <!-- File preview -->
                  <div
                    v-else
                    class="w-16 h-16 rounded-lg border border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-0.5"
                  >
                    <DocumentTextIcon class="w-5 h-5 text-slate-400" />
                    <span class="text-[8px] text-slate-500 truncate px-1 max-w-full">{{ file.extension }}</span>
                  </div>
                  <!-- Remove button -->
                  <button
                    @click="removeAttachment(idx)"
                    class="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-slate-700 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 shadow-sm"
                  >
                    <XMarkIcon class="w-3 h-3" />
                  </button>
                  <!-- File name tooltip -->
                  <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] px-2 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                    {{ file.name }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Input area (disabled when chat is disabled/blocked) -->
            <div
              class="px-3 py-2.5 bg-white border-t border-slate-200 shrink-0"
              :class="isChatDisabled ? 'opacity-50 pointer-events-none' : ''"
            >
              <div class="flex items-center gap-1">
                <!-- Hidden file input -->
                <input
                  ref="fileInput"
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar,.7z"
                  class="hidden"
                  @change="handleFileSelect"
                />
                <button
                  @click="fileInput?.click()"
                  class="p-2 rounded-full hover:bg-slate-100 transition text-slate-500 shrink-0"
                  title="Attach file"
                >
                  <PaperClipIcon class="w-5 h-5" />
                </button>
                <EmojiPicker @select="insertEmoji" />
                <div class="flex-1 relative">
                  <input
                    v-model="newMessage"
                    ref="messageInput"
                    type="text"
                    placeholder="Type a message..."
                    class="w-full rounded-full border-0 bg-slate-100 px-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 transition"
                    @keydown.enter="sendMessage"
                  />
                </div>
                <button
                  @click="sendMessage"
                  class="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition"
                  :class="newMessage.trim() || attachments.length
                    ? 'bg-green-600 text-white hover:bg-green-700 shadow-sm'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'"
                  :disabled="!newMessage.trim() && !attachments.length"
                >
                  <PaperAirplaneIcon class="w-4 h-4" />
                </button>
              </div>
            </div>
          </template>
        </div>
      </div>
    </transition>
    <!-- ── Delete Confirmation Modal ── -->
    <teleport to="body">
      <transition name="modal-fade">
        <div
          v-if="confirmDeleteConv"
          class="fixed inset-0 z-[200] bg-black/50 flex items-center justify-center p-4"
          @click="confirmDeleteConv = null"
        >
          <div
            class="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6"
            @click.stop
          >
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <TrashIcon class="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p class="text-sm font-bold text-slate-900">Delete conversation</p>
                <p class="text-xs text-slate-500">This action cannot be undone</p>
              </div>
            </div>
            <p class="text-sm text-slate-600 mb-6">
              Are you sure you want to delete the conversation with <strong>{{ confirmDeleteConv.name }}</strong>? All messages will be permanently removed.
            </p>
            <div class="flex items-center gap-2 justify-end">
              <button
                @click="confirmDeleteConv = null"
                class="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                @click="confirmDelete"
                class="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </transition>
    </teleport>

    <!-- ── Image Preview Overlay ── -->
    <teleport to="body">
      <transition name="modal-fade">
        <div
          v-if="previewImageUrl"
          class="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4"
          @click="closeImagePreview"
        >
          <button
            @click.stop="closeImagePreview"
            class="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition z-10"
          >
            <XMarkIcon class="w-6 h-6" />
          </button>
          <img
            :src="previewImageUrl"
            class="max-w-full max-h-full rounded-lg shadow-2xl object-contain"
            @click.stop
            alt="Preview"
          />
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import ChatConversationsSkeleton from '@/components/skeletons/ChatConversationsSkeleton.vue'
import ChatMessagesSkeleton from '@/components/skeletons/ChatMessagesSkeleton.vue'
import EmojiPicker from '@/components/chat/EmojiPicker.vue'
import {
  MagnifyingGlassIcon,
  PaperAirplaneIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  PaperClipIcon,
  ChevronDownIcon,
  CheckIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  EllipsisVerticalIcon,
  BellIcon,
  EnvelopeIcon,
  NoSymbolIcon,
  ExclamationTriangleIcon,
  TrashIcon
} from '@heroicons/vue/24/outline'

/* ═══════════════════════════════════════════
   STATE
   ═══════════════════════════════════════════ */
const loading = ref(true)
const searchQuery = ref('')
const activeConv = ref(null)
const newMessage = ref('')
const messageInput = ref(null)
const fileInput = ref(null)
const attachments = ref([])
const typing = ref(false)
const showScrollBtn = ref(false)
const showMessageSearch = ref(false)
const convMenuOpen = ref(null) // conversation ID with open menu
const showConvActions = ref(false) // header actions dropdown
const confirmDeleteConv = ref(null) // conversation pending delete
const messageSearchQuery = ref('')
const messageSearchIndex = ref(0)
const messagesContainer = ref(null)
const scrollAnchor = ref(null)

const colors = ['#2E7D32','#2563EB','#7C3AED','#DC2626','#D97706','#0D9488']

/* ═══════════════════════════════════════════
   SAMPLE DATA
   ═══════════════════════════════════════════ */
const conversations = ref([])

// Generate messages with dates spanning today, yesterday, and earlier
function buildSampleMessages() {
  const now = Date.now()
  const H = 3600000
  const M = 60000
  return [
    // ── Today ──
    { id: 21, text: 'Good morning! I just wanted to follow up on my previous request.', time: '9:15 AM', is_admin: false, status: 'read', createdAt: now - H * 2 },
    { id: 22, text: 'Good morning Sarah! Yes, I checked your order and it\'s been shipped. You should receive tracking info by end of day.', time: '9:18 AM', is_admin: true, status: 'read', createdAt: now - H * 2 + M * 3 },
    { id: 23, text: 'That\'s great news! Thank you so much for the quick update.', time: '9:20 AM', is_admin: false, status: 'read', createdAt: now - H * 2 + M * 5 },
    { id: 24, text: 'You\'re welcome! Let me know if you need anything else. 😊', time: '9:22 AM', is_admin: true, status: 'read', createdAt: now - H * 2 + M * 7 },
    { id: 25, text: 'Actually, I do have one more question — do you offer gift wrapping for orders?', time: '9:30 AM', is_admin: false, status: 'read', createdAt: now - H * 2 + M * 15 },
    { id: 26, text: 'Yes we do! It\'s a free option available at checkout. Just select the "Gift Wrap" checkbox before payment.', time: '9:32 AM', is_admin: true, status: 'read', createdAt: now - H * 2 + M * 17 },
    { id: 27, text: 'Perfect, thank you!', time: '9:33 AM', is_admin: false, status: 'delivered', createdAt: now - H * 2 + M * 18 },
    { id: 28, text: 'I\'ll place another order soon with gift wrapping for my mom\'s birthday.', time: '9:34 AM', is_admin: false, status: 'delivered', createdAt: now - H * 2 + M * 19 },
    { id: 29, text: 'That sounds lovely! She\'s going to love it. Let me know if you need any recommendations.', time: '9:36 AM', is_admin: true, status: 'read', createdAt: now - H * 2 + M * 21 },
    { id: 30, text: 'Will do! Have a great day! 🌟', time: '9:38 AM', is_admin: false, status: 'sent', createdAt: now - M * 45 },
    { id: 31, text: 'You too! 😊', time: '9:40 AM', is_admin: true, status: 'read', createdAt: now - M * 43 },
  ]
}

let incomingTimer = null
let typingTimer = null

// Simulate incoming customer message after 5 seconds
function simulateIncoming() {
  incomingTimer = setTimeout(() => {
    const msgs = messagesByConv.value[activeConv.value?.id]
    if (!msgs) return
    msgs.push({
      id: Date.now(),
      text: 'Hello? Are you still there?',
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      is_admin: false,
      status: 'delivered',
      createdAt: Date.now()
    })
    // Show typing indicator for 2 seconds, then respond
    typing.value = true
    typingTimer = setTimeout(() => {
      typing.value = false
      msgs.push({
        id: Date.now() + 1,
        text: 'Yes, I\'m here! How can I help you?',
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        is_admin: true,
        status: 'read',
        createdAt: Date.now()
      })
    }, 2000)
  }, 8000)
}

onUnmounted(() => {
  clearTimeout(incomingTimer)
  clearTimeout(typingTimer)
  // Clean up any pending attachment preview URLs
  attachments.value.forEach(att => {
    if (att.preview) URL.revokeObjectURL(att.preview)
  })
})

/* ═══════════════════════════════════════════
   COMPUTED
   ═══════════════════════════════════════════ */
const messagesByConv = ref({})

const currentMessages = computed(() => {
  if (!activeConv.value) return []
  return messagesByConv.value[activeConv.value.id] || []
})

// Group messages by date
const groupedMessages = computed(() => {
  const groups = []
  let currentGroup = null

  for (const msg of currentMessages.value) {
    const dateLabel = formatDateLabel(msg.createdAt)
    if (!currentGroup || currentGroup.date !== dateLabel) {
      currentGroup = { date: dateLabel, items: [] }
      groups.push(currentGroup)
    }
    currentGroup.items.push(msg)
  }
  return groups
})

// Filter messages by search query
const messageSearchResults = computed(() => {
  const q = messageSearchQuery.value.toLowerCase().trim()
  if (!q || !activeConv.value) return []
  const msgs = messagesByConv.value[activeConv.value.id] || []
  return msgs
    .map((msg, idx) => ({ msg, idx }))
    .filter(({ msg }) => msg.text && msg.text.toLowerCase().includes(q))
})

// Sorted conversations: pinned first
const sortedConversations = computed(() => {
  const sorted = [...conversations.value].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1
    if (!a.pinned && b.pinned) return 1
    return 0
  })
  return sorted
})

// Filter conversations by search
const filteredConversations = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return sortedConversations.value
  return sortedConversations.value.filter(c =>
    c.name.toLowerCase().includes(q) ||
    c.last_message.toLowerCase().includes(q) ||
    c.email.toLowerCase().includes(q)
  )
})

const isChatDisabled = computed(() =>
  activeConv.value?.disabled || activeConv.value?.blocked
)

function closeAllMenus() {
  convMenuOpen.value = null
  showConvActions.value = false
}

/* ═══════════════════════════════════════════
   SUPER ADMIN ACTIONS
   ═══════════════════════════════════════════ */
function togglePin(conv) {
  conv.pinned = !conv.pinned
  convMenuOpen.value = null
}

function toggleMute(conv) {
  conv.muted = !conv.muted
  convMenuOpen.value = null
}

function toggleDisable(conv) {
  conv.disabled = !conv.disabled
  if (conv.disabled && activeConv.value?.id === conv.id) {
    activeConv.value = { ...activeConv.value }
  }
  convMenuOpen.value = null
  showConvActions.value = false
}

function toggleBlock(conv) {
  conv.blocked = !conv.blocked
  if (conv.blocked && activeConv.value?.id === conv.id) {
    activeConv.value = { ...activeConv.value }
  }
  convMenuOpen.value = null
  showConvActions.value = false
}

function markUnread(conv) {
  conv.unread = (conv.unread || 0) + 1
  if (activeConv.value?.id === conv.id) {
    activeConv.value = null
  }
  convMenuOpen.value = null
}

function deleteConversation(conv) {
  confirmDeleteConv.value = conv
  convMenuOpen.value = null
  showConvActions.value = false
}

function confirmDelete() {
  if (!confirmDeleteConv.value) return
  const conv = confirmDeleteConv.value
  conversations.value = conversations.value.filter(c => c.id !== conv.id)
  if (activeConv.value?.id === conv.id) {
    activeConv.value = null
  }
  delete messagesByConv.value[conv.id]
  confirmDeleteConv.value = null
}

/* ═══════════════════════════════════════════
   ACTIONS
   ═══════════════════════════════════════════ */
function selectConversation(conv) {
  activeConv.value = conv
  // Mark as read
  conv.unread = 0
  // Close and clear search
  showMessageSearch.value = false
  showConvActions.value = false
  messageSearchQuery.value = ''
  messageSearchIndex.value = 0
  nextTick(() => scrollToBottom(false))
}

function handleFileSelect(e) {
  const files = e.target.files
  if (!files?.length) return

  for (const file of files) {
    const isImage = file.type.startsWith('image/')
    const ext = file.name.split('.').pop()?.toUpperCase() || 'FILE'

    let preview = null
    if (isImage) {
      // Create a temporary preview URL for the preview bar
      preview = URL.createObjectURL(file)
    }

    attachments.value.push({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      extension: ext,
      isImage,
      file,
      preview // only used in preview bar, cleaned up after send
    })
  }

  e.target.value = ''
  messageInput.value?.focus()
}

function removeAttachment(idx) {
  const att = attachments.value[idx]
  if (att?.preview) {
    URL.revokeObjectURL(att.preview)
  }
  attachments.value.splice(idx, 1)
}

function readFileAsDataURL(file) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.readAsDataURL(file)
  })
}

async function sendMessage() {
  if (isChatDisabled.value) return
  if ((!newMessage.value.trim() && !attachments.value.length) || !activeConv.value) return

  const msg = {
    id: Date.now(),
    text: newMessage.value.trim(),
    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    is_admin: true,
    status: 'sent',
    createdAt: Date.now(),
    attachments: []
  }

  // Process attachments — read images as persistent data URLs
  for (const att of attachments.value) {
    let url = null
    if (att.isImage && att.file) {
      url = await readFileAsDataURL(att.file)
    }
    msg.attachments.push({
      name: att.name,
      size: att.size,
      extension: att.extension,
      isImage: att.isImage,
      url
    })
    // Clean up temporary preview blobs
    if (att.preview) {
      URL.revokeObjectURL(att.preview)
    }
  }

  messagesByConv.value[activeConv.value.id].push(msg)

  // Update conversation preview
  const previewText = msg.attachments.length
    ? (msg.text || `📎 ${msg.attachments[0].name}`)
    : msg.text
  activeConv.value.last_message = previewText
  activeConv.value.time = 'now'

  newMessage.value = ''
  attachments.value = []
  messageInput.value?.focus()

  // Simulate delivery after 1s, read after 2s
  setTimeout(() => { msg.status = 'delivered' }, 1000)
  setTimeout(() => { msg.status = 'read' }, 2000)

  nextTick(() => scrollToBottom(true))
}

function onMessagesScroll() {
  if (!messagesContainer.value) return
  const el = messagesContainer.value
  const threshold = 150
  showScrollBtn.value = el.scrollHeight - el.scrollTop - el.clientHeight > threshold
}

function toggleMessageSearch() {
  showMessageSearch.value = !showMessageSearch.value
  if (!showMessageSearch.value) {
    messageSearchQuery.value = ''
    messageSearchIndex.value = 0
  } else {
    nextTick(() => {
      const el = document.querySelector('.message-search-input')
      el?.focus()
    })
  }
}

function nextSearchResult() {
  if (!messageSearchResults.value.length) return
  const next = (messageSearchIndex.value + 1) % messageSearchResults.value.length
  messageSearchIndex.value = next
  scrollToSearchResult(next)
}

function prevSearchResult() {
  if (!messageSearchResults.value.length) return
  const prev = (messageSearchIndex.value - 1 + messageSearchResults.value.length) % messageSearchResults.value.length
  messageSearchIndex.value = prev
  scrollToSearchResult(prev)
}

function scrollToSearchResult(idx) {
  const result = messageSearchResults.value[idx]
  if (!result) return
  const el = document.getElementById(`msg-${result.msg.id}`)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

function highlightText(text, query) {
  if (!query || !text) return [{ text: text || '', highlight: false }]
  const q = query.toLowerCase()
  const lower = text.toLowerCase()
  const parts = []
  let lastIdx = 0
  let idx = lower.indexOf(q, lastIdx)
  while (idx !== -1) {
    if (idx > lastIdx) {
      parts.push({ text: text.slice(lastIdx, idx), highlight: false })
    }
    parts.push({ text: text.slice(idx, idx + q.length), highlight: true })
    lastIdx = idx + q.length
    idx = lower.indexOf(q, lastIdx)
  }
  if (lastIdx < text.length) {
    parts.push({ text: text.slice(lastIdx), highlight: false })
  }
  return parts
}

function scrollToBottom(smooth) {
  nextTick(() => {
    if (scrollAnchor.value) {
      scrollAnchor.value.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant' })
    }
    showScrollBtn.value = false
  })
}

function insertEmoji(emoji) {
  const input = messageInput.value
  const start = input?.selectionStart ?? newMessage.value.length
  newMessage.value = newMessage.value.slice(0, start) + emoji + newMessage.value.slice(start)
  nextTick(() => {
    input?.focus()
    const pos = start + emoji.length
    input?.setSelectionRange(pos, pos)
  })
}

const previewImageUrl = ref(null)

function openImagePreview(url) {
  previewImageUrl.value = url
}

function closeImagePreview() {
  previewImageUrl.value = null
}

function formatFileSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1048576) return (bytes / 1024).toFixed(0) + ' KB'
  return (bytes / 1048576).toFixed(1) + ' MB'
}

/* ═══════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════ */
function formatDateLabel(date) {
  const d = new Date(date)
  const now = new Date()
  const diff = now - d
  const isToday = diff < 86400000 && d.getDate() === now.getDate()
  const isYesterday = diff < 172800000 && d.getDate() === now.getDate() - 1

  if (isToday) return 'Today'
  if (isYesterday) return 'Yesterday'
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

/* ═══════════════════════════════════════════
   WATCHERS
   ═══════════════════════════════════════════ */
// Reset search index when query changes
watch(messageSearchQuery, () => {
  messageSearchIndex.value = 0
})

// Auto-scroll when messages change
watch(currentMessages, () => {
  nextTick(() => scrollToBottom(true))
}, { deep: true })

/* ═══════════════════════════════════════════
   LIFECYCLE
   ═══════════════════════════════════════════ */
onMounted(() => {
  setTimeout(() => {
    conversations.value = [
      { id: 1, name: 'Sarah Johnson', email: 'sarah@example.com', last_message: 'Have a great day! 🌟', time: '9:38 AM', unread: 2, online: true, color: colors[0], lastSeen: null, pinned: true, muted: false, disabled: false, blocked: false },
      { id: 2, name: 'Mike Chen', email: 'mike@example.com', last_message: 'When will my order arrive?', time: '15m ago', unread: 0, online: false, color: colors[1], lastSeen: 'yesterday', pinned: false, muted: true, disabled: false, blocked: false },
      { id: 3, name: 'Emily Davis', email: 'emily@example.com', last_message: 'I want to return this product', time: '1h ago', unread: 1, online: true, color: colors[2], lastSeen: null, pinned: false, muted: false, disabled: false, blocked: false },
      { id: 4, name: 'Alex Kumar', email: 'alex@example.com', last_message: 'Payment issue with my last order', time: '3h ago', unread: 0, online: false, color: colors[3], lastSeen: '3 hours ago', pinned: false, muted: false, disabled: false, blocked: false },
      { id: 5, name: 'Lisa Martinez', email: 'lisa@example.com', last_message: 'Shipping address change', time: '1d ago', unread: 0, online: false, color: colors[4], lastSeen: 'yesterday', pinned: false, muted: false, disabled: false, blocked: false },
      { id: 6, name: 'Tom Wilson', email: 'tom@example.com', last_message: 'Discount code not working', time: '2d ago', unread: 0, online: false, color: colors[5], lastSeen: '2 days ago', pinned: false, muted: false, disabled: false, blocked: false },
    ]

    // Populate messages for each conversation
    conversations.value.forEach(conv => {
      if (conv.id === 1) {
        messagesByConv.value[conv.id] = buildSampleMessages()
      } else {
        messagesByConv.value[conv.id] = [
          { id: conv.id * 10 + 1, text: conv.last_message, time: conv.time, is_admin: false, status: 'read', createdAt: Date.now() - 86400000 },
        ]
      }
    })

    loading.value = false
    simulateIncoming()
  }, 800)
})
</script>

<style scoped>
/* ─── Skeleton fade transition ─── */
.skeleton-fade-enter-active,
.skeleton-fade-leave-active {
  transition: opacity 0.25s ease;
}
.skeleton-fade-enter-from,
.skeleton-fade-leave-to {
  opacity: 0;
}

/* ─── Scroll-to-bottom FAB fade ─── */
.fab-fade-enter-active,
.fab-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fab-fade-enter-from,
.fab-fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

/* ─── Scrollbar styling ─── */
.flex-1.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}
.flex-1.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}
.flex-1.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(0,0,0,0.15);
  border-radius: 2px;
}

/* ─── Message search highlight transitions ─── */
.search-match {
  border-radius: 4px;
  transition: background-color 0.3s ease;
}
.search-current {
  position: relative;
}
.search-current::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 8px;
  border: 2px solid #16a34a;
  pointer-events: none;
  animation: search-pulse 2s ease-in-out infinite;
}

@keyframes search-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

/* ─── Menu pop transition ─── */
.menu-pop-enter-active,
.menu-pop-leave-active {
  transition: opacity 0.12s ease, transform 0.12s ease;
}
.menu-pop-enter-from,
.menu-pop-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-4px);
}

/* ─── Modal fade transition ─── */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.18s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* ─── Search bar slide transition ─── */
.search-slide-enter-active,
.search-slide-leave-active {
  transition: all 0.18s ease;
}
.search-slide-enter-from,
.search-slide-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}
.search-slide-enter-to,
.search-slide-leave-from {
  opacity: 1;
  max-height: 60px;
}

/* ─── Bounce animation for typing dots ─── */
@keyframes bounce {
  0%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-5px); }
}
.animate-bounce {
  animation: bounce 1.2s ease-in-out infinite;
}
</style>
