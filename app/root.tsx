import {
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useLoaderData,
} from '@remix-run/react';
import PublicLayout from '~/components/PublicLayout';
import DashboardLayout from '~/components/DashboardLayout';
import { getUserSession } from '~/utils/auth.server';
import './tailwind.css';

export async function loader({ request }: { request: Request }) {
	const session = await getUserSession(request);
	const userId = session.get('userId');
	const token = session.get('token');
	const user = session.get('user');
	
	// Check if we have both userId and token for proper authentication
	const isAuthenticated = !!(userId && token);

	
	return Response.json({ isAuthenticated, user });
}

export default function App() {
	const { isAuthenticated, user } = useLoaderData<typeof loader>();

	return (
		<html lang='en' className='bg-white'>
			<head>
				<meta charSet='utf-8' />
				<meta name='viewport' content='width=device-width, initial-scale=1' />
				<Meta />
				<Links />
			</head>
			<body className='bg-white text-black'>
				{isAuthenticated ? (
					<DashboardLayout isAuthenticated={isAuthenticated} user={user}>
						<Outlet />
					</DashboardLayout>
				) : (
					<PublicLayout>
						<Outlet />
					</PublicLayout>
				)}
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}
