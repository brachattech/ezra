declare module 'react-speech-recognition' {
  export const useSpeechRecognition: () => {
    transcript: string
    listening: boolean
    resetTranscript: () => void
    browserSupportsSpeechRecognition: boolean
  }

  const SpeechRecognition: {
    startListening: () => void
    stopListening: () => void
    abortListening: () => void
  }

  export default SpeechRecognition
}
