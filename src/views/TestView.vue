<script setup lang="ts">
/**
 * Kraeplin column — Vue, with a React brain.
 *
 * <script setup>  = the inside of a function component (no `return`).
 * ref             = useState, but you assign `.value` in script.
 * computed        = useMemo that tracks its own deps.
 * watch           = useEffect tied to one source (`answer`).
 * watchEffect     = useEffect that notices whatever you read (here: focus after the pair moves).
 * nextTick        = wait until Vue has updated the DOM (new input node after v-if).
 */
import { computed, nextTick, ref, watch, watchEffect, type ComponentPublicInstance } from 'vue'

const COLUMN_LENGTH = 12

type Result = 'correct' | 'wrong'

function randomDigit() {
  return Math.floor(Math.random() * 9) + 1
}

const digits = ref<number[]>([])
const pairIndex = ref(0)
const answer = ref('')
const submitted = ref<(number | null)[]>([])
const correctCount = ref(0)
const wrongCount = ref(0)
const lastResult = ref<Result | null>(null)
const showHint = ref(true)
const inputEl = ref<HTMLInputElement | null>(null)
const isSubmitting = ref(false)

const isFinished = computed(() => pairIndex.value >= digits.value.length - 1)
const currentTop = computed(() => digits.value[pairIndex.value] ?? 0)
const currentBottom = computed(() => digits.value[pairIndex.value + 1] ?? 0)
const expected = computed(() => (currentTop.value + currentBottom.value) % 10)
const attempted = computed(() => correctCount.value + wrongCount.value)
const accuracy = computed(() =>
  attempted.value === 0 ? 0 : Math.round((correctCount.value / attempted.value) * 100),
)
const promptText = computed(() =>
  isFinished.value ? 'Kolom selesai' : `${currentTop.value} + ${currentBottom.value} = ?`,
)
const progress = computed(() => {
  const total = Math.max(digits.value.length - 1, 1)
  return Math.round((pairIndex.value / total) * 100)
})

function generateColumn(keepFeedback = false) {
  digits.value = Array.from({ length: COLUMN_LENGTH }, randomDigit)
  submitted.value = Array.from({ length: COLUMN_LENGTH - 1 }, () => null)
  pairIndex.value = 0
  answer.value = ''
  if (!keepFeedback) lastResult.value = null
}

function submitAnswer() {
  if (isFinished.value || isSubmitting.value) return

  const given = Number.parseInt(answer.value, 10)
  if (Number.isNaN(given) || given < 0 || given > 9) return

  isSubmitting.value = true
  submitted.value[pairIndex.value] = given

  if (given === expected.value) {
    correctCount.value += 1
    lastResult.value = 'correct'
  } else {
    wrongCount.value += 1
    lastResult.value = 'wrong'
  }

  pairIndex.value += 1
  answer.value = ''

  if (pairIndex.value >= digits.value.length - 1) {
    generateColumn(true)
  }

  void nextTick(() => {
    isSubmitting.value = false
  })
}

function resetScore() {
  correctCount.value = 0
  wrongCount.value = 0
  generateColumn()
}

function bindInput(el: Element | ComponentPublicInstance | null) {
  inputEl.value = el instanceof HTMLInputElement ? el : null
}

function isCorrectAt(index: number) {
  const given = submitted.value[index]
  const a = digits.value[index]
  const b = digits.value[index + 1]
  if (given == null || a == null || b == null) return false
  return given === (a + b) % 10
}

function onAnswerKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    event.preventDefault()
    submitAnswer()
    return
  }

  if (event.key.length === 1 && !/^\d$/.test(event.key) && !event.metaKey && !event.ctrlKey) {
    event.preventDefault()
  }
}

function onAnswerBeforeInput(event: InputEvent) {
  if (event.data != null && /\D/.test(event.data)) {
    event.preventDefault()
  }
}

function onAnswerInput(event: Event) {
  const target = event.target as HTMLInputElement
  const digit = target.value.replace(/\D/g, '').slice(-1)
  if (target.value !== digit) target.value = digit
  if (answer.value !== digit) answer.value = digit
}

watch(answer, (value) => {
  const digit = value.replace(/\D/g, '').slice(-1)
  if (digit !== value) {
    answer.value = digit
    return
  }
  if (/^\d$/.test(digit)) submitAnswer()
})

watchEffect(() => {
  void pairIndex.value
  void digits.value.length
  void nextTick(() => inputEl.value?.focus())
})

generateColumn()
</script>

<template>
  <!--
    Template ≈ the JSX you’d return.
    {{ }} interpolation, :bind attributes, @listen to events, v-model for inputs.
    v-if destroys nodes; v-show only hides them; v-for is .map with :key.
  -->
  <main class="page">
    <header class="header">
      <p class="eyebrow">Vue learning path · React → Vue</p>
      <h1 class="lede">
        Tes Kraeplin: jumlahkan dua angka berurutan, tulis
        <em>digit satuan</em> hasilnya.
      </h1>
    </header>

    <section class="workspace">
      <aside class="rail" aria-label="Skor berjalan">
        <div class="stats">
          <div class="stat ok">
            <span class="label">Benar</span>
            <strong>{{ correctCount }}</strong>
          </div>
          <div class="stat bad">
            <span class="label">Salah</span>
            <strong>{{ wrongCount }}</strong>
          </div>
          <div class="stat">
            <span class="label">Akurasi</span>
            <strong>{{ accuracy }}%</strong>
          </div>
        </div>
        <div class="progress" aria-hidden="true">
          <span :style="{ width: `${progress}%` }"></span>
        </div>
      </aside>

      <div class="column-card">
        <p class="prompt" :class="{ done: isFinished }">{{ promptText }}</p>

        <ol class="column" aria-label="Kolom angka">
          <template v-for="(digit, index) in digits" :key="`digit-${index}`">
            <li
              class="digit"
              :class="{
                active: !isFinished && (index === pairIndex || index === pairIndex + 1),
                past: index < pairIndex,
              }"
            >
              {{ digit }}
            </li>

            <li v-if="index < digits.length - 1" class="slot">
              <input
                v-if="index === pairIndex && !isFinished"
                :ref="bindInput"
                v-model="answer"
                class="answer-input"
                type="text"
                inputmode="numeric"
                pattern="[0-9]*"
                maxlength="1"
                autocomplete="off"
                aria-label="Jawaban digit satuan"
                @keydown="onAnswerKeydown"
                @beforeinput="onAnswerBeforeInput"
                @input="onAnswerInput"
              />
              <span
                v-else-if="submitted[index] != null"
                class="given"
                :class="{ ok: isCorrectAt(index), bad: !isCorrectAt(index) }"
              >
                {{ submitted[index] }}
              </span>
              <span v-else class="placeholder">·</span>
            </li>
          </template>
        </ol>
      </div>

      <aside class="rail panel">
        <div class="scoreboard" aria-live="polite">
          <span class="score-label">Skor</span>
          <strong class="score">
            <span class="score-correct">{{ correctCount }}</span>
            <span class="score-sep">/</span>
            <span class="score-total">{{ attempted }}</span>
          </strong>
        </div>

        <p v-if="lastResult" class="feedback" :class="lastResult">
          {{ lastResult === 'correct' ? 'Benar' : 'Salah' }}
          <span v-if="lastResult === 'wrong' && pairIndex > 0" class="expected">
            satuan dari jumlah sebelumnya
          </span>
        </p>
        <p v-else class="feedback idle">Ketik 1 digit — dicek langsung.</p>

        <p v-show="showHint" class="hint">
          Contoh: 7 + 8 = 15 → jawab <code>5</code>. 
        </p>

        <div class="actions">
          <button type="button" @click="showHint = !showHint">
            {{ showHint ? 'Sembunyikan petunjuk' : 'Tampilkan petunjuk' }}
          </button>
          <button type="button" class="ghost" @click="resetScore">Reset skor</button>
        </div>
      </aside>
    </section>
  </main>
</template>

<style scoped>
.page {
  max-width: 1080px;
  min-height: 100dvh;
  margin: 0 auto;
  padding: 1.15rem 1.25rem 1.5rem;
  padding-left: max(1.25rem, env(safe-area-inset-left));
  padding-right: max(1.25rem, env(safe-area-inset-right));
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.header {
  display: grid;
  justify-items: center;
  gap: 0.7rem;
  text-align: center;
  padding: 0.35rem 0 0.15rem;
}

.eyebrow {
  margin: 0;
  padding: 0.32rem 0.7rem;
  border: 1px solid rgba(255, 107, 107, 0.35);
  border-radius: 999px;
  background: var(--accent-soft);
  color: #ffd0d0;
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.16em;
}

.lede {
  margin: 0;
  max-width: 34rem;
  color: var(--ink);
  font-size: clamp(1.2rem, 2.6vw, 1.7rem);
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 1.25;
}

.lede em {
  font-style: normal;
  color: var(--accent);
}

.workspace {
  flex: 1;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  gap: 1rem;
  align-items: stretch;
}

.rail,
.column-card {
  background: var(--bg-elevated);
  border: 1px solid var(--line);
  border-radius: 18px;
  box-shadow: var(--shadow);
}

.rail {
  padding: 0.9rem;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.panel {
  position: sticky;
  top: 1rem;
}

.scoreboard {
  display: grid;
  justify-items: center;
  gap: 0.15rem;
  margin-bottom: 0.85rem;
}

.score-label {
  color: var(--muted);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.score {
  display: flex;
  align-items: baseline;
  gap: 0.12em;
  font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-weight: 600;
  line-height: 0.95;
  letter-spacing: -0.06em;
  font-variant-numeric: tabular-nums;
}

.score-correct {
  font-size: clamp(3.2rem, 7.5vw, 5.2rem);
  color: var(--ok);
}

.score-sep,
.score-total {
  font-size: clamp(1.6rem, 3.8vw, 2.4rem);
  color: var(--muted);
}

.stats {
  display: grid;
  gap: 0.5rem;
  flex: 1;
  align-content: start;
}

.stat {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 0.55rem 0.7rem;
}

.stat.ok strong {
  color: var(--ok);
}

.stat.bad strong {
  color: var(--bad);
}

.label {
  color: var(--muted);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.stats strong {
  font-size: 1.2rem;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.03em;
}

.progress {
  height: 6px;
  margin-top: 0.7rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

.progress span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--accent);
  transition: width 180ms ease;
}

.column-card {
  width: 220px;
  padding: 0.9rem 0.7rem 1rem;
}

.prompt {
  margin: 0 0 0.65rem;
  text-align: center;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
  color: #ffd0d0;
}

.prompt.done {
  color: var(--ok);
}

.column {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.digit {
  width: 2.35rem;
  height: 1.6rem;
  display: grid;
  place-items: center;
  border-radius: 8px;
  color: #e8e4dc;
  font-size: 1.08rem;
  font-weight: 600;
  transition:
    background 160ms ease,
    color 160ms ease,
    transform 160ms ease;
}

.digit.active {
  background: var(--accent-soft);
  color: #ffe3e3;
  outline: 1px solid rgba(255, 107, 107, 0.45);
  transform: scale(1.05);
  box-shadow: 0 0 0 4px rgba(255, 107, 107, 0.08);
}

.digit.past {
  color: #6d7382;
}

.slot {
  height: 1.4rem;
  display: grid;
  place-items: center;
}

.answer-input {
  width: 2rem;
  height: 1.4rem;
  text-align: center;
  font: inherit;
  font-size: 1rem;
  color: #fff;
  background: #3a1b1b;
  border: 1.5px solid #ff8f8f;
  border-radius: 7px;
  outline: none;
  box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.18);
}

.given {
  min-width: 1.5rem;
  text-align: center;
  font-size: 0.92rem;
  font-weight: 600;
}

.given.ok {
  color: var(--ok);
}

.given.bad {
  color: var(--bad);
}

.placeholder {
  color: #3f4450;
}

.feedback {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.35rem;
  margin: 0 0 0.85rem;
  font-size: 1rem;
  font-weight: 700;
}

.feedback.correct {
  color: var(--ok);
}

.feedback.wrong {
  color: var(--bad);
}

.feedback.idle,
.expected {
  font-weight: 500;
  color: var(--muted);
}

.hint {
  margin: 0 0 0.9rem;
  padding: 0.75rem 0.8rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--line);
  border-radius: 12px;
  color: #c9ced8;
  line-height: 1.5;
  font-size: 0.88rem;
}

code {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.84em;
  color: #ffb4b4;
  background: rgba(255, 107, 107, 0.12);
  border-radius: 6px;
  padding: 0.08rem 0.35rem;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

button {
  appearance: none;
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.04);
  color: inherit;
  border-radius: 10px;
  padding: 0.55rem 0.75rem;
  cursor: pointer;
  font-weight: 600;
  min-height: 2.4rem;
}

button:hover {
  border-color: rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.07);
}

.ghost {
  background: transparent;
}

@media (max-width: 860px) {
  .workspace {
    grid-template-columns: 1fr;
  }

  .panel {
    position: static;
  }

  .stats {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    flex: none;
  }

  .stat {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.2rem;
  }

  .column-card {
    width: min(100%, 22rem);
    margin: 0 auto;
  }
}

@media (max-width: 560px) {
  .stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
