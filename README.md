# kraeplin-vue

A small Vue 3 app that runs a Kraeplin-style digit column. I already think in React / Next.js, so this repo is a hands-on translation: same kind of UI state, different syntax.

The live screen is `/` (`TestView.vue`). You add two stacked digits and type the **units digit**. Score keeps going across columns. `/owner` is a scratch route, not the lesson.

```bash
npm install
npm run dev
```

---

## The big mental shift

In React you write a function, call hooks, and **return JSX**. Vue splits that into one file with three tags:

| Vue | Closest React habit |
| --- | --- |
| `<script setup>` | the body of a function component |
| `<template>` | the JSX you would return |
| `<style scoped>` | CSS Modules, but Vue scopes it for you |

Reactivity is also flipped. React **re-runs the function** when state changes. Vue **mutates refs** and patches the template. You still think in “state → UI”, you just stop imagining a full re-render of the component function.

---

## Syntax we actually use here

All of this shows up in `src/views/TestView.vue` unless noted.

### `ref` ≈ `useState`

```ts
const correctCount = ref(0)
correctCount.value += 1
```

Same idea as `const [correctCount, setCorrectCount] = useState(0)`, except you don’t get a setter. You write `.value` in script. In the template, Vue unwraps it, so you just write `{{ correctCount }}`.

### `computed` ≈ `useMemo` (that you don’t have to remember to depend)

```ts
const attempted = computed(() => correctCount.value + wrongCount.value)
```

In React you’d list `[correctCount, wrongCount]`. Vue tracks what you read inside the getter. Accuracy, the prompt text, and the progress bar are all derived this way — same instinct as keeping render math out of event handlers.

### `watch` ≈ `useEffect` with a specific dependency

```ts
watch(answer, (value) => { /* when the input string changes */ })
```

We use it to sanitize the digit and submit as soon as there is one number. That’s “run this when `answer` changes”, not “run after every render”.

### `watchEffect` ≈ `useEffect` that discovers its own deps

```ts
watchEffect(() => {
  void pairIndex.value
  void digits.value.length
  void nextTick(() => inputEl.value?.focus())
})
```

It re-runs when anything it **touched** changes. Here that’s “the current pair moved, or we got a new column — focus the input again.” The `void pairIndex.value` lines are there on purpose: we want those reads so Vue knows what to follow.

### `nextTick` ≈ “wait until the DOM caught up”

After we submit, the input node is often a **new** element (`v-if` swapped it). `nextTick` is “do this after Vue has painted,” close to `queueMicrotask` / waiting a frame after setState, not quite `useLayoutEffect`.

### `{{ }}` ≈ `{value}` in JSX

```html
<strong>{{ accuracy }}%</strong>
```

Mustache interpolation. Expressions only — no `if` statements inside, use directives for that.

### `v-bind` / `:` ≈ passing props and attributes

```html
<span :style="{ width: `${progress}%` }"></span>
<p :class="{ done: isFinished }">
```

`:` is shorthand for `v-bind:`. Think `style={{ width }}` and `className={isFinished ? 'done' : ''}`. The object form of `:class` merges names that are `true`.

### `v-on` / `@` ≈ `onClick={...}`

```html
<button type="button" @click="resetScore">Reset skor</button>
```

`@click` is `v-on:click`. The handler can be a function name or a tiny expression (`showHint = !showHint`). No `e =>` unless you need the event.

### `v-model` ≈ controlled input, without the boilerplate

```html
<input v-model="answer" />
```

That’s `value={answer}` + `onChange={e => setAnswer(e.target.value)}` in one attribute. We still listen to `@keydown` / `@input` on top for “digits only.”

### `v-if` / `v-else-if` / `v-else` ≈ `{cond && <X />}`

```html
<input v-if="index === pairIndex && !isFinished" />
<span v-else-if="submitted[index] != null">...</span>
<span v-else>·</span>
```

These **create or destroy** DOM. The answer field is a new node each pair, which is why we re-focus it.

### `v-show` ≈ hiding with CSS

```html
<p v-show="showHint" class="hint">...</p>
```

The node stays in the DOM; Vue toggles `display`. We use it for the hint so toggling doesn’t remount the rest of the panel. Rule of thumb: `v-if` when it’s gone for a while, `v-show` when you flip it often.

### `v-for` + `:key` ≈ `.map` + `key={}`

```html
<template v-for="(digit, index) in digits" :key="`digit-${index}`">
```

Same list-reconciliation idea as React. The extra `<template>` is a **fragment**: it doesn’t render a wrapper element, it just lets us output two `<li>`s per digit (the number and the answer slot).

### `:ref` on an element ≈ `useRef` + callback ref

```html
<input :ref="bindInput" />
```

In script, `inputEl` is a `ref`. Because `v-if` moves the input around, we bind a small function instead of a static ref name — same trick as `ref={(el) => { inputEl = el }}`.

### `<script setup>` + SFC

No `export default`. Bindings in the script are automatically available in the template. That’s why you don’t pass `correctCount` as a prop to yourself.

`<style scoped>` means these class names won’t leak into other views. Closer to CSS Modules than to a global `globals.css`.

---

## Around the app (not in the template)

**`createApp` + `app.mount('#app')`** (`src/main.ts`) — `createRoot(el).render(<App />)`.  
**`app.use(router)`** — Vue Router is a plugin, not a file-system convention like the App Router. `RouterView` is `<Outlet />` / `{children}`.  
**`createWebHistory`** — browser History API, like Next without the `app/` folder magic.  
**Pinia** (`src/stores/counter.ts`) — scaffolded like a tiny Zustand store. The Kraeplin screen keeps state local for now; that’s on purpose.

---

## What I was practicing

1. State that updates as you type (`ref` + `v-model` + `watch`).
2. Derived numbers that stay honest (`computed` for score and accuracy).
3. Conditional UI without JSX (`v-if` vs `v-show`).
4. A list that is the actual test (`v-for`).
5. “After paint” DOM (`nextTick`, focus).

If something in Vue feels weird, map it back to the table above before assuming the model is different. Most of the time it’s the same idea with less render-function ceremony.
