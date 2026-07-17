import { useEffect, useRef } from 'react';
import { Empty, Alert } from 'antd';
import LaunchCard from './LaunchCard';
import SkeletonCard from './SkeletonCard';

/**
 * @typedef {import('../hooks/useLaunches').Launch} Launch
 */

/**
 * @param {{
 *   launches: Launch[],
 *   loading: boolean,
 *   initialized: boolean,
 *   hasMore: boolean,
 *   error: string|null,
 *   loadMore: () => void
 * }} props
 */
const LaunchList = ({ launches, loading, initialized, hasMore, error, loadMore }) => {
	/** @type {import('react').MutableRefObject<HTMLDivElement|null>} */
	const sentinelRef = useRef(null);

	useEffect(() => {
		const el = sentinelRef.current;
		if (!el) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting && hasMore && !loading) loadMore();
			},
			{ rootMargin: '200px' }
		);

		observer.observe(el);
		return () => observer.disconnect();
	}, [hasMore, loading, loadMore]);

	return (
		<div className='launch-list'>
			{error && (
				<Alert
					message='Failed to load launches'
					description={error}
					type='error'
					showIcon
					style={{ marginBottom: 16 }}
				/>
			)}

			{launches.map((launch) => (
				<LaunchCard key={launch.id} launch={launch} />
			))}

			{loading && (
				<>
					<SkeletonCard />
					<SkeletonCard />
					<SkeletonCard />
				</>
			)}

			{!hasMore && launches.length > 0 && (
				<div className='launch-list__end'>
					<Empty description='No more launches to load' />
				</div>
			)}

			{initialized && !loading && launches.length === 0 && !error && (
				<div className='launch-list__end'>
					<Empty description='No launches found' />
				</div>
			)}

			<div ref={sentinelRef} className='launch-list__sentinel' />
		</div>
	);
};

export default LaunchList;
