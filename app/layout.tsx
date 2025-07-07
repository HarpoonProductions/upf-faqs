// app/layout.tsx
import './globals.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900 font-sans">
        <main className="max-w-4xl mx-auto p-6">{children}</main>
      </body>
    </html>
  )
}
