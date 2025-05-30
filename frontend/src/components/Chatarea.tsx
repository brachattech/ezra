'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Send, Mic, MicOff, Upload } from 'lucide-react'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'
import { supabase } from '../lib/supabaseClient'
import { callEzraUniversal } from '../lib/callEzraUniversal'

export default function ChatArea() {
  const [user, setUser] = useState<any>(null)
  const [messages, setMessages] = useState<string[]>([])
  const [history, setHistory] = useState<{ sender: string; message: string }[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [typingMessage, setTypingMessage] = useState<string>('')
  const [message, setMessage] = useState('')

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition()

  // 🔐 Autenticação do Supabase
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setUser(data.session.user)
    })
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) setUser(session.user)
      else setUser(null)
    })
    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  // ✉️ Envio de mensagem
  const handleSend = async (msg: string) => {
    const trimmed = msg.trim()
    if (!trimmed) return
    setMessages(prev => [...prev, `Você: ${trimmed}`])
    setHistory(prev => [...prev, { sender: 'Usuário', message: trimmed }])
    setIsTyping(true)
    setTypingMessage('')
    setMessage('')

    try {
      const context = [...history, { sender: 'Usuário', message: trimmed }]
        .map(m => `${m.sender}: ${m.message}`)
        .join('\n')

      const responseText = await callEzraUniversal({ prompt: context, model: 'auto' })
      const resposta = responseText?.replace(/^.*:::/, '') || 'Sem resposta'

      let i = 0
      const interval = setInterval(() => {
        setTypingMessage(prev => {
          const nextChar = resposta[i]
          i++
          if (i >= resposta.length) {
            clearInterval(interval)
            setIsTyping(false)
            setMessages(prevMsgs => [...prevMsgs, `Ezra: ${resposta}`])
            setHistory(prev => [...prev, { sender: 'Ezra', message: resposta }])
          }
          return prev + nextChar
        })
      }, 5)
    } catch (error) {
      setMessages(prev => [...prev, `Erro: ${error}`])
      setIsTyping(false)
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typingMessage])

  // 🎙️ Captura de voz
  useEffect(() => {
    if (!listening && transcript) {
      handleSend(transcript)
      resetTranscript()
    }
  }, [listening, transcript])

  // 🔒 Exibição de loading enquanto não logado
  if (!user) {
    return <main className="flex justify-center items-center h-screen text-white">Carregando...</main>
  }

  return (
  <>
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'green',
      color: 'white',
      height: '60px',
      textAlign: 'center',
      lineHeight: '60px',
      zIndex: 9999
    }}>
      FIXED FUNCIONANDO
    </div>

    <div style={{ height: '2000px', backgroundColor: '#4b0082' }}>
      Scroll aqui
    </div>
  </>
)
}
