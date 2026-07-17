import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

/**
 * @param {{
 *   value: string,
 *   onChange: (value: string) => void
 * }} props
 */
const SearchBar = ({ value, onChange }) => {
	return (
		<div className='search-bar'>
			<Input
				size='large'
				placeholder='Search SpaceX launches...'
				prefix={<SearchOutlined />}
				allowClear
				value={value}
				onChange={(e) => onChange(e.target.value)}
			/>
		</div>
	);
};

export default SearchBar;
