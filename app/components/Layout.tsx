import { Link } from '@remix-run/react';

interface LayoutProps {
	children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
	return (
		<div className='min-h-screen bg-white'>
			<nav className='bg-black shadow-sm'>
				<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
					<div className='flex justify-between h-16'>
						<div className='flex'>
							<div className='flex-shrink-0 flex items-center'>
								<Link to='/' className='text-xl font-bold text-white'>
									Event Management
								</Link>
							</div>
							<div className='hidden sm:ml-6 sm:flex sm:space-x-8'>
								<Link
									to='/login'
									className='text-white hover:text-white px-3 py-2 rounded-md text-sm font-medium'
								>
									Login
								</Link>
								<Link
									to='/register'
									className='text-white hover:text-white px-3 py-2 rounded-md text-sm font-medium'
								>
									Register
								</Link>
							</div>
						</div>
					</div>
				</div>
			</nav>

			<main className='max-w-7xl mx-auto py-6 sm:px-6 lg:px-8'>{children}</main>
		</div>
	);
}
