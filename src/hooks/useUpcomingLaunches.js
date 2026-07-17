import { useState, useEffect } from 'react';

const UPCOMING_URL = 'https://ll.thespacedevs.com/2.3.0/launches/upcoming/';

const useUpcomingLaunches = (limit = 5) => {
	const [launches, setLaunches] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		let cancelled = false;

		const load = async () => {
			setLoading(true);
			setError(null);

			try {
				const params = new URLSearchParams({
					format: 'json',
					limit: String(limit)
				});

				const res = await fetch(`${UPCOMING_URL}?${params}`);

				if (!res.ok) {
					if (res.status === 429) {
						setError('Rate limited');
						return;
					}
					throw new Error(`HTTP ${res.status}`);
				}

				const data = await res.json();
				if (!cancelled) {
					setLaunches(data.results);
				}
			} catch (err) {
				if (!cancelled) {
					setError(err.message);
				}
			} finally {
				if (!cancelled) {
					setLoading(false);
				}
			}
		};

		load();

		return () => {
			cancelled = true;
		};
	}, [limit]);

	return { launches, loading, error };
};

export default useUpcomingLaunches;
