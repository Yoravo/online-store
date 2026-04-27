interface SnapCallbacks {
  onSuccess?: (result: unknown) => void
  onPending?: (result: unknown) => void
  onError?: (result: unknown) => void
  onClose?: () => void
}

interface Snap {
  pay: (token: string, callbacks: SnapCallbacks) => void
}

declare global {
  interface Window {
    snap: Snap
  }
}

export {}