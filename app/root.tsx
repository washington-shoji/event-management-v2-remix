import { json } from '@remix-run/node';
import {
	Links,
	LiveReload,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useLoaderData,
} from '@remix-run/react';
import Layout from '~/components/Layout';
import { getUserSession } from '~/services/auth.server';
import './tailwind.css';

export async function loader({ request }: { request: Request }) {
	const session = await getUserSession(request);
	const userId = session.get('userId');
	return json({ isAuthenticated: !!userId });
}

export default function App() {
	const { isAuthenticated } = useLoaderData<typeof loader>();

	return (
		<html lang='en' className='bg-white'>
			<head>
				<meta charSet='utf-8' />
				<meta name='viewport' content='width=device-width, initial-scale=1' />
				<Meta />
				<Links />
			</head>
			<body className='bg-white text-black'>
				<Layout isAuthenticated={isAuthenticated}>
					<Outlet />
				</Layout>
				<ScrollRestoration />
				<Scripts />
				<LiveReload />
			</body>
		</html>
	);
}
