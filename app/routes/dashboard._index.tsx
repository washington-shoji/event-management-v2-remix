import { LoaderFunctionArgs, redirect } from '@remix-run/node';
import { requireAuth } from '~/utils/auth.server';

export async function loader({ request }: LoaderFunctionArgs) {
	await requireAuth(request);
	return null;
}

export default function DashboardIndex() {
	return (
		<div className='space-y-6'>
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
				{/* Recent Transactions */}
				<div className='bg-white p-6 rounded-lg border border-black'>
					<h2 className='text-lg font-semibold text-black mb-4'>
						Recent Transactions
					</h2>
					<div className='space-y-4'>
						{/* Sample transactions - replace with real data */}
						<div className='flex items-center justify-between'>
							<div className='flex items-center space-x-3'>
								<div className='w-10 h-10 bg-black rounded-full flex items-center justify-center text-white'>
									P
								</div>
								<div>
									<p className='text-sm font-medium text-black'>PayPal</p>
									<p className='text-xs text-black'>Today, 11:55 AM</p>
								</div>
							</div>
							<span className='text-sm font-medium text-black'>-$10.67</span>
						</div>
					</div>
				</div>

				{/* Spending Overview */}
				<div className='bg-white p-6 rounded-lg border border-black'>
					<h2 className='text-lg font-semibold text-black mb-4'>
						Spending Overview
					</h2>
					<div className='h-48 flex items-center justify-center border-2 border-dashed border-black rounded-lg'>
						<p className='text-black'>Spending chart will go here</p>
					</div>
				</div>

				{/* Quick Transfer */}
				<div className='bg-white p-6 rounded-lg border border-black'>
					<h2 className='text-lg font-semibold text-black mb-4'>
						Quick Transfer
					</h2>
					<div className='space-y-4'>
						<div className='flex space-x-2'>
							{/* Sample avatars - replace with real data */}
							{[1, 2, 3, 4].map((i) => (
								<button
									key={i}
									className='w-10 h-10 bg-black rounded-full'
								></button>
							))}
							<button className='w-10 h-10 rounded-full border-2 border-dashed border-black flex items-center justify-center'>
								<span className='text-black'>+</span>
							</button>
						</div>
						<input
							type='text'
							placeholder='Amount'
							className='w-full border border-black rounded-lg px-4 py-2 text-black placeholder-black'
						/>
						<button className='w-full bg-black text-white rounded-lg px-4 py-2'>
							Send
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
