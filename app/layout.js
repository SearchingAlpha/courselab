// app/layout.js
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata = {
  title: 'CourseForge - Interactive Learning Platform',
  description: 'Master complex topics in mathematics and programming through structured 120-hour courses.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}