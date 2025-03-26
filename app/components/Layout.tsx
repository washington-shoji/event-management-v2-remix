import { Link } from '@remix-run/react';

interface LayoutProps {
	children: React.ReactNode;
	isAuthenticated: boolean;
}

export default function Layout({ children, isAuthenticated }: LayoutProps) {
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
							{isAuthenticated && (
								<div className='hidden sm:ml-6 sm:flex sm:space-x-8'>
									<Link
										to='/events'
										className='border-transparent text-white hover:border-white hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium'
									>
										Events
									</Link>
									<Link
										to='/organizations'
										className='border-transparent text-white hover:border-white hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium'
									>
										Organizations
									</Link>
									<Link
										to='/venues'
										className='border-transparent text-white hover:border-white hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium'
									>
										Venues
									</Link>
								</div>
							)}
						</div>
						<div className='flex items-center'>
							{isAuthenticated ? (
								<form action='/logout' method='post'>
									<button
										type='submit'
										className='text-white hover:text-white px-3 py-2 rounded-md text-sm font-medium'
									>
										Logout
									</button>
								</form>
							) : (
								<div className='flex space-x-4'>
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
							)}
						</div>
					</div>
				</div>
			</nav>

			<main className='max-w-7xl mx-auto py-6 sm:px-6 lg:px-8'>{children}</main>
		</div>
	);
}
