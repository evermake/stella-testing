import { MaybeRef, Ref, inject, ref, unref, watch } from "vue";
import { HighlighterCore } from 'shiki/core'
import { SHIKI_HIGHLITER_KEY } from "../constants";

export function useHighlighting(code: MaybeRef<string>, lang: 'Stella' | 'plain'): Ref<string> {
  const highlightedHtml = ref("")
  const highlighter = inject<Ref<HighlighterCore>>(SHIKI_HIGHLITER_KEY)

  watch(
    [() => unref(highlighter), () => unref(code)],
    ([newHighlighter, newCode]) => {
      if (newHighlighter && newCode) {
        highlightedHtml.value = newHighlighter.codeToHtml(newCode, {
          lang: lang,
          theme: 'vitesse-dark',
        })
      }
    },
    { immediate: true }
  )

  return highlightedHtml
}
