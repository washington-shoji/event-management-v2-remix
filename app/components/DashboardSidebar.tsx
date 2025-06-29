import { Link, Form } from "@remix-run/react";
import { useState } from "react";

interface DashboardSidebarProps {
	sidebarOpen: boolean;
	toggleSidebar: () => void;
}

export default function DashboardSidebar({ sidebarOpen, toggleSidebar }: DashboardSidebarProps) {
	const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set());

	function handleLinkClick(): void {
		// Close sidebar on mobile when clicking a link
		if (window.innerWidth < 768) {
			toggleSidebar();
		}
	};

	function toggleDropdown(dropdownId: string): void {
		setOpenDropdowns(prev => {
			const newSet = new Set(prev);
			if (newSet.has(dropdownId)) {
				newSet.delete(dropdownId);
			} else {
				newSet.add(dropdownId);
			}
			return newSet;
		});
	};

	function isDropdownOpen(dropdownId: string): boolean {
		return openDropdowns.has(dropdownId);
	};

	return (
		<>
			{/* Backdrop overlay for mobile */}
			{sidebarOpen && (
				<div 
					className="fixed inset-0 bg-gray-600 bg-opacity-75 z-30 md:hidden"
					onClick={toggleSidebar}
				/>
			)}
			
			<aside
			className={`fixed top-0 left-0 z-40 w-64 h-screen pt-14 transition-transform bg-white border-r border-gray-200 md:translate-x-0 dark:bg-gray-800 dark:border-gray-700 ${
				sidebarOpen ? 'translate-x-0' : '-translate-x-full'
			}`}
			aria-label="Sidenav"
			id="drawer-navigation"
			>
			<div className="overflow-y-auto py-5 px-3 h-full bg-white dark:bg-gray-800">
				<form action="#" method="GET" className="md:hidden mb-2">
					<label htmlFor="sidebar-search" className="sr-only">Search</label>
					<div className="relative">
						<div
							className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none"
						>
							<svg
								className="w-5 h-5 text-gray-500 dark:text-gray-400"
								fill="currentColor"
								viewBox="0 0 20 20"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									fillRule="evenodd"
									clipRule="evenodd"
									d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
								></path>
							</svg>
						</div>
						<input
							type="text"
							name="search"
							id="sidebar-search"
							className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
							placeholder="Search"
						/>
					</div>
				</form>
				<ul className="space-y-2">
					<li>
						<Link
							to="/dashboard"
							onClick={handleLinkClick}
							className="flex items-center p-2 text-base font-medium text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
						>
							<svg
								aria-hidden="true"
								className="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
								fill="currentColor"
								viewBox="0 0 20 20"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path>
								<path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"></path>
							</svg>
							<span className="ml-3">Overview</span>
						</Link>
					</li>
					<li>
						<Link
							to="/dashboard/events"
							onClick={handleLinkClick}
							className="flex items-center p-2 text-base font-medium text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
						>
							<svg className="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
									aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
									<path fillRule="evenodd" d="M5 5a1 1 0 0 0 1-1 1 1 0 1 1 2 0 1 1 0 0 0 1 1h1a1 1 0 0 0 1-1 1 1 0 1 1 2 0 1 1 0 0 0 1 1 2 2 0 0 1 2 2v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a2 2 0 0 1 2-2ZM3 19v-7a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Zm6.01-6a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm2 0a1 1 0 1 1 2 0 1 1 0 0 1-2 0Zm6 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm-10 4a1 1 0 1 1 2 0 1 1 0 0 1-2 0Zm6 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm2 0a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z" clipRule="evenodd"/>
							</svg>
							<span className="ml-3">My Events</span>
						</Link>
					</li>
					<li>
						<Link
							to="/dashboard/organizations"
							onClick={handleLinkClick}
							className="flex items-center p-2 text-base font-medium text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
						>
							<svg
								aria-hidden="true"
								className="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
								fill="currentColor"
								viewBox="0 0 20 20"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									fillRule="evenodd"
									d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
									clipRule="evenodd"
								></path>
							</svg>
							<span className="ml-3">Organizations</span>
						</Link>
					</li>
					<li>
						<Link
							to="/dashboard/venues"
							onClick={handleLinkClick}
							className="flex items-center p-2 text-base font-medium text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group"
						>
							<svg
								aria-hidden="true"
								className="w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
								fill="currentColor"
								viewBox="0 0 20 20"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									fillRule="evenodd"
									d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
									clipRule="evenodd"
								></path>
							</svg>
							<span className="ml-3">Venues</span>
						</Link>
					</li>
					<li>
						<button
							type="button"
							className="flex items-center p-2 w-full text-base font-medium text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
							aria-controls="dropdown-pages"
							onClick={() => toggleDropdown('pages')}
						>
							<svg
								aria-hidden="true"
								className="flex-shrink-0 w-6 h-6 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
								fill="currentColor"
								viewBox="0 0 20 20"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									fillRule="evenodd"
									d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
									clipRule="evenodd"
								></path>
							</svg>
							<span className="flex-1 ml-3 text-left whitespace-nowrap"
								>Pages</span>
							<svg
								aria-hidden="true"
								className={`w-6 h-6 transition-transform duration-200 ${isDropdownOpen('pages') ? 'rotate-180' : ''}`}
								fill="currentColor"
								viewBox="0 0 20 20"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									fillRule="evenodd"
									d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
									clipRule="evenodd"
								></path>
							</svg>
						</button>
						<ul className={`py-2 space-y-2 transition-all duration-200 ${isDropdownOpen('pages') ? 'block' : 'hidden'}`}>
							<li>
								<Link
									to="/dashboard/settings"
									onClick={handleLinkClick}
									className="flex items-center p-2 pl-11 w-full text-base font-medium text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
								>
									Settings
								</Link>
							</li>
							<li>
								<Link
									to="/dashboard/kanban"
									onClick={handleLinkClick}
									className="flex items-center p-2 pl-11 w-full text-base font-medium text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
								>
									Kanban
								</Link>
							</li>
							<li>
								<Link
									to="/dashboard/calendar"
									onClick={handleLinkClick}
									className="flex items-center p-2 pl-11 w-full text-base font-medium text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
								>
									Calendar
								</Link>
							</li>
						</ul>
					</li>
					<li>
						<button
							type="button"
							className="flex items-center p-2 w-full text-base font-medium text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
							aria-controls="dropdown-management"
							onClick={() => toggleDropdown('management')}
						>
							<svg
								aria-hidden="true"
								className="flex-shrink-0 w-6 h-6 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
								fill="currentColor"
								viewBox="0 0 20 20"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									fillRule="evenodd"
									d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z"
									clipRule="evenodd"
								></path>
							</svg>
							<span className="flex-1 ml-3 text-left whitespace-nowrap"
								>Management</span>
							<svg
								aria-hidden="true"
								className={`w-6 h-6 transition-transform duration-200 ${isDropdownOpen('management') ? 'rotate-180' : ''}`}
								fill="currentColor"
								viewBox="0 0 20 20"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									fillRule="evenodd"
									d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
									clipRule="evenodd"
								></path>
							</svg>
						</button>
						<ul className={`py-2 space-y-2 transition-all duration-200 ${isDropdownOpen('management') ? 'block' : 'hidden'}`}>
							<li>
								<Link
									to="/dashboard/users"
									onClick={handleLinkClick}
									className="flex items-center p-2 pl-11 w-full text-base font-medium text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
								>
									Users
								</Link>
							</li>
							<li>
								<Link
									to="/dashboard/roles"
									onClick={handleLinkClick}
									className="flex items-center p-2 pl-11 w-full text-base font-medium text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
								>
									Roles
								</Link>
							</li>
							<li>
								<Link
									to="/dashboard/permissions"
									onClick={handleLinkClick}
									className="flex items-center p-2 pl-11 w-full text-base font-medium text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
								>
									Permissions
								</Link>
							</li>
						</ul>
					</li>
					<li>
						<button
							type="button"
							className="flex items-center p-2 w-full text-base font-medium text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
							aria-controls="dropdown-reports"
							onClick={() => toggleDropdown('reports')}
						>
							<svg
								aria-hidden="true"
								className="flex-shrink-0 w-6 h-6 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
								fill="currentColor"
								viewBox="0 0 20 20"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									fillRule="evenodd"
									d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
									clipRule="evenodd"
								></path>
							</svg>
							<span className="flex-1 ml-3 text-left whitespace-nowrap"
								>Reports</span>
							<svg
								aria-hidden="true"
								className={`w-6 h-6 transition-transform duration-200 ${isDropdownOpen('reports') ? 'rotate-180' : ''}`}
								fill="currentColor"
								viewBox="0 0 20 20"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									fillRule="evenodd"
									d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
									clipRule="evenodd"
								></path>
							</svg>
						</button>
						<ul className={`py-2 space-y-2 transition-all duration-200 ${isDropdownOpen('reports') ? 'block' : 'hidden'}`}>
							<li>
								<Link
									to="/dashboard/analytics"
									onClick={handleLinkClick}
									className="flex items-center p-2 pl-11 w-full text-base font-medium text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
								>
									Analytics
								</Link>
							</li>
							<li>
								<Link
									to="/dashboard/export"
									onClick={handleLinkClick}
									className="flex items-center p-2 pl-11 w-full text-base font-medium text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
								>
									Export Data
								</Link>
							</li>
							<li>
								<Link
									to="/dashboard/insights"
									onClick={handleLinkClick}
									className="flex items-center p-2 pl-11 w-full text-base font-medium text-gray-900 rounded-lg transition duration-75 group hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
								>
									Insights
								</Link>
							</li>
						</ul>
					</li>
				</ul>
				<ul
					className="pt-5 mt-5 space-y-2 border-t border-gray-200 dark:border-gray-700"
				>
					<li>
						<a
							href="#"
							className="flex items-center p-2 text-base font-medium text-gray-900 rounded-lg transition duration-75 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white group"
						>
							<svg
								aria-hidden="true"
								className="flex-shrink-0 w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
								fill="currentColor"
								viewBox="0 0 20 20"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path>
								<path
									fillRule="evenodd"
									d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
									clipRule="evenodd"
								></path>
							</svg>
							<span className="ml-3">Docs</span>
						</a>
					</li>
					<li>
						<a
							href="#"
							className="flex items-center p-2 text-base font-medium text-gray-900 rounded-lg transition duration-75 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white group"
						>
							<svg
								aria-hidden="true"
								className="flex-shrink-0 w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
								fill="currentColor"
								viewBox="0 0 20 20"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"
								></path>
							</svg>
							<span className="ml-3">Components</span>
						</a>
					</li>
					<li>
						<a
							href="#"
							className="flex items-center p-2 text-base font-medium text-gray-900 rounded-lg transition duration-75 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white group"
						>
							<svg
								aria-hidden="true"
								className="flex-shrink-0 w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
								fill="currentColor"
								viewBox="0 0 20 20"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									fillRule="evenodd"
									d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-2 0c0 .993-.241 1.929-.668 2.754l-1.524-1.525a3.997 3.997 0 00.078-2.183l1.562-1.562C15.802 8.249 16 9.1 16 10zm-5.165 3.913l1.58 1.58A5.98 5.98 0 0110 16a5.976 5.976 0 01-2.516-.552l1.562-1.562a4.006 4.006 0 001.789.027zm-4.677-2.796a4.002 4.002 0 01-.041-2.08l-.08.08-1.53-1.533A5.98 5.98 0 004 10c0 .954.223 1.856.619 2.657l1.54-1.54zm1.088-6.45A5.974 5.974 0 0110 4c.954 0 1.856.223 2.657.619l-1.54 1.54a4.002 4.002 0 00-2.346.033L7.246 4.668zM12 10a2 2 0 11-4 0 2 2 0 014 0z"
									clipRule="evenodd"
								></path>
							</svg>
							<span className="ml-3">Help</span>
						</a>
					</li>
				</ul>
			</div>
			<div
				className="hidden absolute bottom-0 left-0 p-4 space-x-4 w-full lg:flex bg-white dark:bg-gray-800 z-20"
			>
				<Form
					action="/logout"
					method="post"
                    className="w-full"
				>
					<button 
						type="submit" 
						className="flex items-center w-full p-2 text-base font-medium text-gray-900 rounded-lg transition duration-75 hover:bg-red-300 dark:hover:bg-gray-700 dark:text-white group"
						onClick={handleLinkClick}
					>
						<svg className="flex-shrink-0 w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
							<path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12H4m12 0-4 4m4-4-4-4m3-4h2a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3h-2"/>
						</svg>
                        <span className="ml-3">Logout</span>
					</button>
				</Form>
			</div>
		</aside>
		</>
	);
}