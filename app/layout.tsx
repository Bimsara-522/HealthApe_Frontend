// import Navbar from '@/components/layout/Navbar';
import './globals.css'; 
import { QueryProvider } from '@/providers/QueryProvider'

export default function RootLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    return (
      <html lang="en">
        <body>
          <QueryProvider>
              {/* layout.tsx wraps every page */}
              {/* Place children where you want to render a page or nested layout */}
              {/* <Navbar/> */}
              {children} {/* children = current page content */}
            </QueryProvider>
        </body>
      </html>
    )
  }

  