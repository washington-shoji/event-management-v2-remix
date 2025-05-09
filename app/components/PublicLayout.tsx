import { Link } from '@remix-run/react';
import Navbar from './Navbar';

interface LayoutProps {
	children: React.ReactNode;
}

export default function PublicLayout({ children }: LayoutProps) {
	return (
		<div className='min-h-screen bg-white'>
			<Navbar />

			<main className='max-w-7xl mx-auto py-6 sm:px-6 lg:px-8'>{children}</main>
		</div>
	);
}
