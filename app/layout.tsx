// import Navbar from '@/components/layout/Navbar';
import './globals.css'; 

export default function RootLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    return (
      <html lang="en">
        <body style={{ background: "white", color: "black" }}>
            {/* layout.tsx wraps every page */}
            {/* Place children where you want to render a page or nested layout */}
            {/* <Navbar/> */}
            {children} {/* children = current page content */}
        </body>
      </html>
    )
  }

  