import { useState, useReducer, useEffect, useCallback, useRef } from 'react';

const BASE_URL = 'https://ll.thespacedevs.com/2.3.0/launches/';
const PAGE_SIZE = 10;

/**
 * @param {number} ms
 * @returns {Promise<void>}
 */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * @typedef {{ name: string, abbrev: string, type: { name: string } }} Agency
 */

/**
 * @typedef {{ id: number, name: string, abbrev: string, description: string }} LaunchStatus
 */

/**
 * @typedef {{ id: number, configuration: { id: number, full_name: string, name: string, variant: string } }} Rocket
 */

/**
 * @typedef {{ id: number, name: string, type: string, description: string|null, orbit: { id: number, name: string, abbrev: string }|null, agencies: Agency[], info_urls: string[], vid_urls: string[], image: object|null }} Mission
 */

/**
 * @typedef {{ image_url: string, thumbnail_url: string }} LaunchImage
 */

/**
 * @typedef {{
 *   id: string,
 *   name: string,
 *   net: string,
 *   status: LaunchStatus,
 *   image: LaunchImage|null,
 *   rocket: Rocket,
 *   mission: Mission|null,
 *   launch_service_provider: Agency,
 *   failreason: string|null,
 *   pad: object,
 *   webcast_live: boolean,
 *   program: object[]
 * }} Launch
 */

/**
 * @typedef {{
 *   count: number,
 *   next: string|null,
 *   previous: string|null,
 *   results: Launch[]
 * }} LaunchPage
 */

/**
 * @param {string} searchTerm
 * @param {number} offset
 * @param {AbortSignal} signal
 * @returns {Promise<{ throttled: true, detail: string }|{ data: LaunchPage }>}
 */
const rawFetch = async (searchTerm, offset, signal) => {
	const params = new URLSearchParams({
		format: 'json',
		limit: String(PAGE_SIZE)
	});
	if (searchTerm) params.set('search', searchTerm);
	if (offset > 0) params.set('offset', String(offset));

	const res = await fetch(`${BASE_URL}?${params}`, { signal });

	if (res.status === 429) {
		const body = await res.json().catch(() => ({}));
		return { throttled: true, detail: body.detail || 'Rate limited' };
	};

	if (!res.ok) throw new Error(`HTTP ${res.status}`);

	const data = await res.json();
	return { data };
};

/**
 * @typedef {{
 *   launches: Launch[],
 *   loading: boolean,
 *   initialized: boolean,
 *   hasMore: boolean,
 *   error: string|null
 * }} State
 */

/** @type {State} */
const initial = {
	launches: [],
	loading: false,
	initialized: false,
	hasMore: true,
	error: null
};

/**
 * Reducer action — one of:
 * - `{ type: 'loading' }`
 * - `{ type: 'done' }`
 * - `{ type: 'error', error: string }`
 * - `{ type: 'append', launches: Launch[], hasMore: boolean }`
 * - `{ type: 'replace', launches: Launch[], hasMore: boolean }`
 * - `{ type: 'throttled', detail: string }`
 * - `{ type: 'reset' }`
 * @typedef {Object} Action
 * @property {string} type
 */

/**
 * @param {State} state
 * @param {Action} action
 * @returns {State}
 */
const reducer = (state, action) => {
	switch (action.type) {
	case 'loading':
		return { ...state, loading: true, error: null };
	case 'done':
		return { ...state, loading: false, initialized: true };
	case 'error':
		return {
			...state,
			error: action.error,
			loading: false,
			initialized: true
		};
	case 'append':
		return {
			...state,
			launches: [...state.launches, ...action.launches],
			hasMore: action.hasMore
		};
	case 'replace':
		return {
			...state,
			launches: action.launches,
			hasMore: action.hasMore,
			initialized: true
		};
	case 'throttled':
		return { ...state, error: action.detail };
	case 'reset':
		return { ...initial };
	default:
		return state;
	}
};

/**
 * @typedef {{
 *   launches: Launch[],
 *   loading: boolean,
 *   initialized: boolean,
 *   hasMore: boolean,
 *   error: string|null,
 *   search: string,
 *   setSearch: (value: string) => void,
 *   loadMore: () => Promise<void>
 * }} UseLaunchesReturn
 */

/**
 * @returns {UseLaunchesReturn}
 */
const useLaunches = () => {
	/** @type {[State, import('react').Dispatch<Action>]} */
	const [state, dispatch] = useReducer(reducer, initial);
	const [search, setSearch] = useState('');
	/** @type {import('react').MutableRefObject<string|null>} */
	const nextRef = useRef(null);
	/** @type {import('react').MutableRefObject<AbortController|null>} */
	const abortRef = useRef(null);

	/**
	 * @param {string} searchTerm
	 * @param {number} offset
	 * @returns {Promise<LaunchPage|null>}
	 */
	const fetchLaunches = useCallback(async (searchTerm, offset) => {
		if (abortRef.current) abortRef.current.abort();
		const controller = new AbortController();
		abortRef.current = controller;

		dispatch({ type: 'loading' });

		try {
			let result = await rawFetch(searchTerm, offset, controller.signal);

			while (result.throttled) {
				dispatch({ type: 'throttled', detail: result.detail });
				const match = result.detail?.match(/in\s+(\d+)\s+seconds?/);
				const wait = match ? Number(match[1]) * 1000 : 30000;
				await sleep(wait);
				result = await rawFetch(searchTerm, offset, controller.signal);
			};

			dispatch({ type: 'done' });
			return result.data;
		} catch (err) {
			if (err.name === 'AbortError') return null;
			dispatch({
				type: 'error',
				error: /** @type {Error} */ (err).message
			});
			return null;
		};
	}, []);

	/** @type {() => Promise<void>} */
	const loadMore = useCallback(async () => {
		if (state.loading || !state.hasMore) return;
		const data = await fetchLaunches(search, state.launches.length);
		if (!data) return;
		dispatch({
			type: 'append',
			launches: data.results,
			hasMore: !!data.next
		});
		nextRef.current = data.next;
	}, [
		state.loading,
		state.hasMore,
		search,
		state.launches.length,
		fetchLaunches
	]);

	useEffect(() => {
		let cancelled = false;

		const load = async () => {
			const data = await fetchLaunches(search, 0);
			if (cancelled || !data) return;
			dispatch({
				type: 'replace',
				launches: data.results,
				hasMore: !!data.next
			});
			nextRef.current = data.next;
		};

		dispatch({ type: 'reset' });
		load();

		return () => {
			cancelled = true;
			if (abortRef.current) abortRef.current.abort();
		};
	}, [search, fetchLaunches]);

	return {
		launches: state.launches,
		loading: state.loading,
		initialized: /** @type {boolean} */ (state.initialized),
		hasMore: state.hasMore,
		error: state.error,
		search,
		setSearch,
		loadMore
	};
};

export default useLaunches;
