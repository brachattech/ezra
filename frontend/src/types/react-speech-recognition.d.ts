declare module 'react-speech-recognition' {
  import { ComponentType } from 'react'

  export interface SpeechRecognitionOptions {
    continuous?: boolean
    interimResults?: boolean
    language?: string
  }

  export interface SpeechRecognitionHook {
    transcript: string
    listening: boolean
    resetTranscript: () => void
    browserSupportsSpeechRecognition: boolean
  }

  const SpeechRecognition: {
    startListening: (options?: SpeechRecognitionOptions) => void
    stopListening: () => void
    abortListening: () => void
  }

  export function useSpeechRecognition(): SpeechRecognitionHook

  export default SpeechRecognition
}
