import { LoaderFunctionArgs, json } from '@remix-run/node';
import { Outlet, useLoaderData } from '@remix-run/react';
import DashboardLayout from '~/components/DashboardLayout';
import { getUser } from '~/services/user.server';
import { getToken, requireAuth } from '~/utils/auth.server';

export async function loader({ request }: LoaderFunctionArgs) {
	const userId = await requireAuth(request);
	const token = await getToken(request);
	if (!token) throw new Error('No token found');

	const user = await getUser(userId, token);
	return json({ user });
}

export default function Dashboard() {
	const { user } = useLoaderData<typeof loader>();

	return (
		<DashboardLayout user={user}>
			<Outlet />
		</DashboardLayout>
	);
}
