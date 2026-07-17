import { motion } from 'framer-motion';

/**
 * @typedef {import('../hooks/useLaunches').Launch} Launch
 */

/** @type {Object<string, string>} */
const STATUS_COLORS = {
	'Launch Successful': 'success',
	'Launch Failure': 'error',
	'Launch Partial Failure': 'warning'
};

/**
 * @param {{ launch: Launch }} props
 */
const LaunchCard = ({ launch }) => {
	const {
		name,
		net,
		status,
		image,
		rocket,
		mission,
		launch_service_provider,
		failreason
	} = launch;

	const statusColor = STATUS_COLORS[status?.name] || 'default';
	const imgSrc = image?.thumbnail_url || image?.image_url;
	const dateStr = net
		? new Date(net).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		})
		: 'TBD';

	return (
		<motion.div
			className='launch-card'
			layout
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, scale: 0.95 }}
			transition={{ type: 'spring', stiffness: 300, damping: 25 }}>
			{imgSrc && (
				<img
					className='launch-card__image'
					src={imgSrc}
					alt={name}
					loading='lazy'
				/>
			)}
			<div className='launch-card__body'>
				<h3 className='launch-card__title'>{name}</h3>
				<span
					className={`launch-card__status launch-card__status--${statusColor}`}>
					{status?.name || 'Unknown'}
				</span>
				<p className='launch-card__meta'>
					{dateStr} &middot; {rocket?.configuration?.full_name}
				</p>
				<p className='launch-card__provider'>
					{launch_service_provider?.name}
				</p>
				{mission?.description && (
					<p className='launch-card__description'>
						{mission.description}
					</p>
				)}
				{failreason && (
					<p className='launch-card__failreason'>{failreason}</p>
				)}
			</div>
		</motion.div>
	);
};

export default LaunchCard;
