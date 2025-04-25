import { Form, Link, useLocation, useNavigate, Outlet } from '@remix-run/react';
import { User } from '~/types/user';
import { useEffect } from 'react';

interface DashboardLayoutProps {
	children: React.ReactNode;
	user: User;
	isAuthenticated: boolean;
}

export default function DashboardLayout({
	user,
	isAuthenticated,
}: DashboardLayoutProps) {
	const location = useLocation();
	const navigate = useNavigate();

	useEffect(() => {
		if (!isAuthenticated) {
			navigate('/login');
		}
	}, [isAuthenticated, navigate]);

	function isActivePath(path: string): string {
		// For parent routes (like /dashboard), check for exact match
		if (path === '/dashboard') {
			return location.pathname === path
				? 'bg-black text-white'
				: 'text-black hover:bg-gray-100';
		}
		// For child routes, use startsWith
		return location.pathname.startsWith(path)
			? 'bg-black text-white'
			: 'text-black hover:bg-gray-100';
	}

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
							to='/dashboard/events'
							className={`flex items-center justify-center p-2 rounded-lg ${isActivePath(
								'/dashboard/events'
							)}`}
						>
							<svg
								className='w-6 h-6'
								aria-hidden='true'
								xmlns='http://www.w3.org/2000/svg'
								fill='none'
								viewBox='0 0 24 24'
							>
								<path
									stroke='currentColor'
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth='2'
									d='M11 9h6m-6 3h6m-6 3h6M6.996 9h.01m-.01 3h.01m-.01 3h.01M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z'
								/>
							</svg>
						</Link>

						<Link
							to='/dashboard/organizations'
							className={`flex items-center justify-center p-2 rounded-lg ${isActivePath(
								'/dashboard/organizations'
							)}`}
						>
							<svg
								aria-hidden='true'
								xmlns='http://www.w3.org/2000/svg'
								className='w-6 h-6'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M6 4h12M6 4v16M6 4H5m13 0v16m0-16h1m-1 16H6m12 0h1M6 20H5M9 7h1v1H9V7Zm5 0h1v1h-1V7Zm-5 4h1v1H9v-1Zm5 0h1v1h-1v-1Zm-3 4h2a1 1 0 0 1 1 1v4h-4v-4a1 1 0 0 1 1-1Z'
								/>
							</svg>
						</Link>

						<Link
							to='/dashboard/venues'
							className={`flex items-center justify-center p-2 rounded-lg ${isActivePath(
								'/dashboard/venues'
							)}`}
						>
							<svg
								aria-hidden='true'
								xmlns='http://www.w3.org/2000/svg'
								className='w-6 h-6'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M6 12c.263 0 .524-.06.767-.175a2 2 0 0 0 .65-.491c.186-.21.333-.46.433-.734.1-.274.15-.568.15-.864a2.4 2.4 0 0 0 .586 1.591c.375.422.884.659 1.414.659.53 0 1.04-.237 1.414-.659A2.4 2.4 0 0 0 12 9.736a2.4 2.4 0 0 0 .586 1.591c.375.422.884.659 1.414.659.53 0 1.04-.237 1.414-.659A2.4 2.4 0 0 0 16 9.736c0 .295.052.588.152.861s.248.521.434.73a2 2 0 0 0 .649.488 1.809 1.809 0 0 0 1.53 0 2.03 2.03 0 0 0 .65-.488c.185-.209.332-.457.433-.73.1-.273.152-.566.152-.861 0-.974-1.108-3.85-1.618-5.121A.983.983 0 0 0 17.466 4H6.456a.986.986 0 0 0-.93.645C5.045 5.962 4 8.905 4 9.736c.023.59.241 1.148.611 1.567.37.418.865.667 1.389.697Zm0 0c.328 0 .651-.091.94-.266A2.1 2.1 0 0 0 7.66 11h.681a2.1 2.1 0 0 0 .718.734c.29.175.613.266.942.266.328 0 .651-.091.94-.266.29-.174.537-.427.719-.734h.681a2.1 2.1 0 0 0 .719.734c.289.175.612.266.94.266.329 0 .652-.091.942-.266.29-.174.536-.427.718-.734h.681c.183.307.43.56.719.734.29.174.613.266.941.266a1.819 1.819 0 0 0 1.06-.351M6 12a1.766 1.766 0 0 1-1.163-.476M5 12v7a1 1 0 0 0 1 1h2v-5h3v5h7a1 1 0 0 0 1-1v-7m-5 3v2h2v-2h-2Z'
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
										src={user?.avatar || 'https://via.placeholder.com/32'}
										alt={user?.firstName}
										className='w-8 h-8 rounded-full'
									/>
									<span>
										{user?.firstName} {user?.lastName}
									</span>
								</button>
							</Form>
						</div>
					</div>
				</div>

				{/* Page Content */}
				<main className='p-4'>
					<Outlet />
				</main>
			</div>
		</div>
	);
}
