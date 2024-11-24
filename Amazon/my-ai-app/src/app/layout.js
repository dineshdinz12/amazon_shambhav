// /src/app/layout.js
import "./globals.css";
import { Inter } from 'next/font/google'
import Sidebar from './components/common/Sidebar'
import FloatingChatbot from "./Query-resolver/page";

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: "GlobalXport",
  description: "A user-friendly interface for exporting data from the GlobalXplort platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
      </head>
      <body className={inter.className}>
        <main className=" flex h-screen bg-gray-900 text-gray-100 overflow-hidden">

          {/* use if needed */}
          {/* <div className='fixed inset-0 z-0'>
				<div className='absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 opacity-80' />
				<div className='absolute inset-0 backdrop-blur-sm' />
			</div> */}

          <Sidebar />
          <div className="flex flex-col flex-1 h-full overflow-y-auto">
            {children}
      <FloatingChatbot/>

          </div>

        </main>
      </body>
    </html>
  );
}