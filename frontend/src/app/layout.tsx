import '../styles/globals.css'

export const metadata = {
  title: "Ezra App",
  description: "Aplicação Ezra com Next.js",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: '#4b0082',
          minHeight: '100vh',
          position: 'relative',
          overflow: 'visible',
        }}
      >
        <div
          id="__layout-wrapper"
          style={{
            minHeight: '100vh',
            position: 'relative',
            overflow: 'visible',
          }}
        >
          {children}
        </div>
      </body>
    </html>
  )
}
