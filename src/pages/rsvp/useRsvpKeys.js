import { useEffect } from 'react'

// Fires `fn` when Enter is pressed globally (not inside a textarea)
// deps array optional — re-registers when deps change
export function useEnterKey(fn, deps = []) {
  useEffect(() => {
    function handler(e) {
      if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') fn()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps
}

// Fires `fn` when Ctrl+Enter (or Cmd+Enter on Mac) is pressed anywhere
// Safe to use inside textareas — doesn't interfere with plain Enter
export function useCtrlEnterKey(fn) {
  useEffect(() => {
    function handler(e) {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) fn()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
}
