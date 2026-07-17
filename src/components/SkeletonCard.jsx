const SkeletonCard = () => {
	return (
		<div className='launch-card skeleton-card'>
			<div className='skeleton skeleton--image' />
			<div className='launch-card__body'>
				<div className='skeleton skeleton--title' />
				<div className='skeleton skeleton--status' />
				<div className='skeleton skeleton--text' />
				<div className='skeleton skeleton--text skeleton--text--short' />
				<div className='skeleton skeleton--text skeleton--text--long' />
			</div>
		</div>
	);
};

export default SkeletonCard;
