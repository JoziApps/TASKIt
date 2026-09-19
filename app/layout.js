import './globals.css';
import Image from 'next/image';
import Link from 'next/link';
import { Anton, Figtree } from 'next/font/google';
import SignatureFooter from '@/components/SignatureFooter';

const display = Anton({ subsets: ['latin'], weight: '400', variable: '--font-display' });
const body = Figtree({ subsets: ['latin'], variable: '--font-body' });

export const metadata = {
  title: 'TASKit',
  description: 'Where duty meets desire?',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <header className="site-header">
          <Link href="/" aria-label="TASKit home">
            <Image src="/logo.png" alt="TASKit" width={64} height={64} priority />
          </Link>
        </header>
        <main>{children}</main>
        <SignatureFooter />
      </body>
    </html>
  );
}
