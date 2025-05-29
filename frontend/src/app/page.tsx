'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Upload, Mic } from 'lucide-react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { supabase } from '../lib/supabaseClient'
import { callEzraUniversal } from '../lib/callEzraUniversal'

export default function HomePage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState<any>(null)
  const [isSigningUp, setIsSigningUp] = useState(false)
  const [messages, setMessages] = useState<string[]>([])
  const [history, setHistory] = useState<{ sender: string; message: string }[]>([])
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  useEffect(() => {
  const saudacaoJaExibida = sessionStorage.getItem('ezra-saudacao-ja-exibida')
  if (user && !saudacaoJaExibida) {
    const saudacao = `Shalom! 🙌 Bem-vindo ao Ezra.\n\nEstas são as palavras-chave que ativam modos especiais de inteligência:\n\n- analise → usa o modelo Llama Scout, focado em respostas técnicas, jurídicas e análises diretas.\n- classifique → ativa o BERT, ideal para interpretações semânticas e classificações inteligentes de texto.\n- olhe → ativa a CNN (visão computacional), usada quando você envia uma imagem para análise visual.\n- relatório → aumenta o espaço de resposta para gerar relatórios longos e detalhados.`
    alert(saudacao)
    sessionStorage.setItem('ezra-saudacao-ja-exibida', 'true')
  }
}, [user])

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) alert('Erro no login: ' + error.message)
    else setUser(data.user)
  }

  const handleSignUp = async () => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) alert('Erro no cadastro: ' + error.message)
    else {
      alert('Cadastro realizado! Verifique seu email.')
      setIsSigningUp(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  const handleSend = async (msg: string) => {
    if (!msg.trim()) return
    setMessages(prev => [...prev, `Você: ${msg}`])
    setHistory(prev => [...prev, { sender: 'Usuário', message: msg }])
    setIsTyping(true)
    try {
      const responseText = await callEzraUniversal({
      prompt: msg,
      model: 'llama'
    })
      setMessages(prev => [...prev, `Ezra: ${responseText || 'Sem resposta'}`])
      setHistory(prev => [...prev, { sender: 'Ezra', message: responseText || 'Sem resposta' }])
    } catch (error) {
      setMessages(prev => [...prev, `Erro ao obter resposta: ${error}`])
      setHistory(prev => [...prev, { sender: 'Ezra', message: `Erro ao obter resposta: ${error}` }])
    }
    setIsTyping(false)
  }

  const handleUploadClick = () => fileInputRef.current?.click()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]
      setSelectedFileName(file.name)
      setMessages(prev => [...prev, `Arquivo selecionado: ${file.name}`])
      setHistory(prev => [...prev, { sender: 'Usuário', message: `Arquivo selecionado: ${file.name}` }])
    }
  }

  const handleAudioClick = () => {
    alert('Função de gravação de áudio ainda não implementada.')
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (!user) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen w-full p-4 bg-purple-900 space-y-4">
        <h1 className="text-2xl font-bold mb-4 text-white">
          {isSigningUp ? 'Cadastrar no Ezra' : 'Entrar no Ezra'}
        </h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 border rounded mb-2 text-sm bg-purple-700 text-white placeholder-purple-300"
          value={email}
          onChange={e => setEmail(e.target.value)}
          autoComplete="username"
        />

        <input
          type="password"
          placeholder="Senha"
          className="w-full p-2 border rounded mb-2 text-sm bg-purple-700 text-white placeholder-purple-300"
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoComplete={isSigningUp ? 'new-password' : 'current-password'}
        />

        {isSigningUp ? (
          <button onClick={handleSignUp} className="w-full bg-green-600 text-white p-2 rounded text-sm hover:bg-green-700">
            Cadastrar
          </button>
        ) : (
          <button onClick={handleLogin} className="w-full bg-purple-600 text-white p-2 rounded text-sm hover:bg-purple-700">
            Entrar
          </button>
        )}

        <button
          className="mt-2 text-xs underline text-purple-300 hover:text-white"
          onClick={() => setIsSigningUp(!isSigningUp)}
        >
          {isSigningUp ? 'Já tem uma conta? Entrar' : 'Não tem conta? Cadastrar'}
        </button>
      </main>
    )
  }

  return (
    <main className="flex flex-col min-h-screen w-full p-4 bg-purple-900">

      {/* Mensagens roláveis */}
      <div className="flex-1 w-full max-w-md overflow-y-auto space-y-6 py-4">
        {messages.map((msg, idx) => {
          const isUser = msg.startsWith('Você:')
          const content = msg.replace(/^Você:\s?|^Ezra:\s?/i, '')
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: isUser ? 50 : -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex items-start ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <Image
                  src="/ezra-avatar.png"
                  alt="Ezra"
                  width={30}
                  height={30}
                  className="rounded-full mr-2 self-start mt-1"
                />
              )}
              <div
                className={`max-w-[70%] px-4 py-2 rounded-3xl break-words text-sm ${
                  isUser ? 'bg-green-500 text-white self-end ml-auto' : 'bg-blue-500 text-white self-start mr-auto'
                }`}
                style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', marginBottom: '1rem' }}
              >
                {content}
              </div>
            </motion.div>
          )
        })}
        {isTyping && <div className="italic text-purple-300">Ezra está digitando...</div>}
        <div ref={messagesEndRef} />
      </div>

      {/* Área de input responsiva */}
      <div className="w-full max-w-full flex items-center gap-3 bg-purple-800 p-3 rounded-lg shadow-md mt-4">
        <button className="icon-button" onClick={handleUploadClick} aria-label="Upload file">
          <Upload size={24} />
        </button>

        <textarea
          rows={2}
          className="flex-1 p-3 rounded-lg shadow-inner bg-purple-700 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none text-base"
          placeholder="Escreva sua mensagem..."
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSend(e.currentTarget.value)
              e.currentTarget.value = ''
            }
          }}
        />

        <button className="icon-button" onClick={handleAudioClick} aria-label="Record audio">
          <Mic size={24} />
        </button>

        <motion.button
          className="icon-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            const textarea = document.querySelector('textarea')
            if (textarea && textarea.value.trim() !== '') {
              handleSend(textarea.value)
              textarea.value = ''
            }
          }}
          aria-label="Send message"
        >
          <Send size={24} />
        </motion.button>
      </div>

      <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />

    </main>
  )
}