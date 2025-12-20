import type { Metadata } from 'next'
import { Inter, Orbitron, Rajdhani } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const orbitron = Orbitron({ subsets: ['latin'], weight: ['400', '500', '700', '900'], variable: '--font-orbitron' })
const rajdhani = Rajdhani({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'], variable: '--font-rajdhani' })

export const metadata: Metadata = {
    title: 'FARRTZ - Cyberpunk Fashion',
    description: 'Next Gen Cyberpunk Fashion Store',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className={`${inter.variable} ${orbitron.variable} ${rajdhani.variable} font-sans bg-black`}>
                {children}
            </body>
        </html>
    )
}
