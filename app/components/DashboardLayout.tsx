import { Form, Link, useLocation, useNavigate, Outlet } from '@remix-run/react';
import { User } from '~/types/user';
import { useEffect, useState } from 'react';
import DashboardNavbar from './DashboardNavbar';
import DashboardSidebar from './DashboardSidebar';

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
	const [sidebarOpen, setSidebarOpen] = useState(false);

	useEffect(() => {
		if (!isAuthenticated) {
			navigate('/login');
		}
	}, [isAuthenticated, navigate]);

	function toggleSidebar(): void {
		setSidebarOpen(!sidebarOpen);
	};

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
		<div className="antialiased bg-gray-50 dark:bg-gray-900">
			<DashboardNavbar 
				sidebarOpen={sidebarOpen}
				toggleSidebar={toggleSidebar}
			/>

			<DashboardSidebar 
				sidebarOpen={sidebarOpen}
				toggleSidebar={toggleSidebar}
			/>

			<main className="p-4 md:ml-64 h-auto pt-20">
				<Outlet />
			</main>
  		</div>
	);
}
