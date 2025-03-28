import { Form, Link, useLocation } from '@remix-run/react';
import { User } from '~/types/user';

interface DashboardLayoutProps {
	children: React.ReactNode;
	user: User;
}

export default function DashboardLayout({
	children,
	user,
}: DashboardLayoutProps) {
	const location = useLocation();

	const isActivePath = (path: string) => {
		return location.pathname.startsWith(path)
			? 'bg-black text-white'
			: 'text-black hover:bg-gray-100';
	};

	return (
		<div className='min-h-screen bg-gray-50'>
			{/* Side Navigation */}
			<div className='fixed inset-y-0 left-0 w-16 bg-white border-r border-black'>
				<div className='flex flex-col h-full'>
					{/* Logo */}
					<div className='p-4 border-b border-black'>
						<div className='w-8 h-8 bg-black rounded-full'></div>
					</div>

					{/* Navigation Items */}
					<nav className='flex-1 space-y-2 p-2'>
						<Link
							to='/dashboard'
							className={`flex items-center justify-center p-2 rounded-lg ${isActivePath(
								'/dashboard'
							)}`}
						>
							<svg
								className='w-6 h-6'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M4 6h16M4 12h16M4 18h16'
								/>
							</svg>
						</Link>

						<Link
							to='/dashboard/transactions'
							className={`flex items-center justify-center p-2 rounded-lg ${isActivePath(
								'/dashboard/transactions'
							)}`}
						>
							<svg
								className='w-6 h-6'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
								/>
							</svg>
						</Link>

						<Link
							to='/dashboard/cards'
							className={`flex items-center justify-center p-2 rounded-lg ${isActivePath(
								'/dashboard/cards'
							)}`}
						>
							<svg
								className='w-6 h-6'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z'
								/>
							</svg>
						</Link>

						<Link
							to='/dashboard/messages'
							className={`flex items-center justify-center p-2 rounded-lg ${isActivePath(
								'/dashboard/messages'
							)}`}
						>
							<svg
								className='w-6 h-6'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z'
								/>
							</svg>
						</Link>
					</nav>

					{/* Settings */}
					<div className='p-2 border-t border-black'>
						<Link
							to='/dashboard/settings'
							className={`flex items-center justify-center p-2 rounded-lg ${isActivePath(
								'/dashboard/settings'
							)}`}
						>
							<svg
								className='w-6 h-6'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
								/>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
								/>
							</svg>
						</Link>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className='pl-16'>
				{/* Top Bar */}
				<div className='bg-white border-b border-black'>
					<div className='flex items-center justify-between px-4 py-2'>
						<div className='flex items-center space-x-4'>
							<h1 className='text-xl font-semibold text-black'>Dashboard</h1>
						</div>
						<div className='flex items-center space-x-4'>
							<button className='p-2 text-black hover:bg-gray-100 rounded-lg'>
								<svg
									className='w-6 h-6'
									fill='none'
									stroke='currentColor'
									viewBox='0 0 24 24'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9'
									/>
								</svg>
							</button>
							<Form action='/logout' method='post'>
								<button
									type='submit'
									className='flex items-center space-x-2 text-black hover:bg-gray-100 rounded-lg p-2'
								>
									<img
										src={user.avatar || 'https://via.placeholder.com/32'}
										alt={user.firstName}
										className='w-8 h-8 rounded-full'
									/>
									<span>
										{user.firstName} {user.lastName}
									</span>
								</button>
							</Form>
						</div>
					</div>
				</div>

				{/* Page Content */}
				<main className='p-4'>{children}</main>
			</div>
		</div>
	);
}
