import {
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useLoaderData,
} from '@remix-run/react';
import Layout from '~/components/Layout';
import DashboardLayout from '~/components/DashboardLayout';
import { getUserSession } from '~/services/auth.server';
import './tailwind.css';

export async function loader({ request }: { request: Request }) {
	const session = await getUserSession(request);
	const userId = session.get('userId');
	const user = session.get('user');
	return Response.json({ isAuthenticated: !!userId, user });
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
					<Layout>
						<Outlet />
					</Layout>
				)}
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}
