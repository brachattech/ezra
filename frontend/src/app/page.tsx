'use client'

import { useState, useEffect, useRef } from 'react'
import { Send } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { callEzraUniversal } from '../lib/callEzraUniversal'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'

export default function ChatArea() {
  const [user, setUser] = useState<any>(null)
  const [history, setHistory] = useState<{ sender: string; message: string }[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [typingMessage, setTypingMessage] = useState<string>('')
  const [message, setMessage] = useState('')

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition()

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

  const handleSend = async (msg: string) => {
    const trimmed = msg.trim()
    if (!trimmed) return

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
            setHistory(prev => [...prev, { sender: 'Ezra', message: resposta }])
          }
          return prev + nextChar
        })
      }, 5)
    } catch (error) {
      setHistory(prev => [...prev, { sender: 'Erro', message: String(error) }])
      setIsTyping(false)
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history, typingMessage])

  useEffect(() => {
    if (!listening && transcript) {
      handleSend(transcript)
      resetTranscript()
    }
  }, [listening, transcript])

  if (!user) {
    return <main className="flex justify-center items-center h-screen text-white">Carregando...</main>
  }

  return (
    <>
      {/* Mensagens */}
      <div style={{ paddingBottom: '100px', backgroundColor: '#4b0082', color: 'white' }}>
        {history.map((entry, index) => {
          const isUser = entry.sender === 'Usuário'
          return (
            <div
              key={index}
              style={{
                display: 'flex',
                justifyContent: isUser ? 'flex-end' : 'flex-start',
                padding: '8px 16px',
              }}
            >
              <div
                style={{
                  maxWidth: '75%',
                  backgroundColor: isUser ? '#10b981' : '#3b82f6',
                  color: 'white',
                  padding: '10px 14px',
                  borderRadius: '16px',
                  borderBottomRightRadius: isUser ? '0px' : '16px',
                  borderBottomLeftRadius: isUser ? '16px' : '0px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  fontSize: '14px',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {entry.message}
              </div>
            </div>
          )
        })}

        {isTyping && typingMessage && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-start',
              padding: '8px 16px',
            }}
          >
            <div
              style={{
                maxWidth: '75%',
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '10px 14px',
                borderRadius: '16px',
                borderBottomLeftRadius: '0px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                fontSize: '14px',
                whiteSpace: 'pre-wrap',
              }}
            >
              {typingMessage}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input fixo */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#5b21b6',
          padding: '12px 16px',
          borderTop: '1px solid #4c1d95',
          zIndex: 9999,
        }}
      >
        <div
          style={{
            maxWidth: '768px',
            margin: '0 auto',
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
          }}
        >
          <textarea
            rows={1}
            placeholder="Digite sua mensagem..."
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              outline: 'none',
              resize: 'none',
              backgroundColor: '#4b0082',
              color: 'white',
              fontSize: '16px',
              boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.25)',
            }}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend(message)
              }
            }}
          />

          <button
            onClick={() => handleSend(message)}
            style={{
              padding: '10px',
              backgroundColor: '#7c3aed',
              color: 'white',
              borderRadius: '9999px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '42px',
              height: '42px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
              transition: 'background 0.3s ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#8b5cf6'
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#7c3aed'
            }}
            title="Enviar mensagem"
          >
            <span style={{ fontSize: '18px' }}>➤</span>
          </button>
        </div>
      </div>
    </>
  )
}
