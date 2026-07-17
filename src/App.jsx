import { ConfigProvider, Typography, Collapse } from 'antd';
import useLaunches from './hooks/useLaunches';
import useUpcomingLaunches from './hooks/useUpcomingLaunches';
import SearchBar from './components/SearchBar';
import LaunchList from './components/LaunchList';
import LaunchCard from './components/LaunchCard';

const App = () => {
	const {
		launches,
		loading,
		initialized,
		hasMore,
		error,
		search,
		setSearch,
		loadMore
	} = useLaunches();

	const {
		launches: upcoming,
		loading: upcomingLoading,
		error: upcomingError
	} = useUpcomingLaunches(5);

	const showUpcoming =
		!upcomingLoading && !upcomingError && upcoming.length > 0;

	return (
		<ConfigProvider
			theme={{
				token: {
					colorPrimary: '#005288',
					borderRadius: 8
				}
			}}>
			<div className='app'>
				<header className='app__header'>
					<Typography.Title level={2} style={{ margin: 0 }}>
						SpaceX Launches
					</Typography.Title>
				</header>

				<SearchBar value={search} onChange={setSearch} />

				{showUpcoming && (
					<div style={{ marginBottom: 24 }}>
						<Collapse
							expandIconPosition='end'
							items={[
								{
									key: 'upcoming',
									label: `Upcoming Launches (${upcoming.length})`,
									children: (
										<div className='launch-list'>
											{upcoming.map((launch) => (
												<LaunchCard
													key={launch.id}
													launch={launch}
												/>
											))}
										</div>
									)
								}
							]}
						/>
					</div>
				)}

				<LaunchList
					launches={launches}
					loading={loading}
					initialized={initialized}
					hasMore={hasMore}
					error={error}
					loadMore={loadMore}
				/>
			</div>
		</ConfigProvider>
	);
};

export default App;
