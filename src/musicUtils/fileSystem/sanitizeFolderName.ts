import fixFilename from 'src/lib/fixFilename';

const sanitizeFolderName = (name: string) => {
	name = fixFilename(name);

	// начальные и конечные пробелы и точки
	name = name.trim().replace(/\.+$/, '');

	// запрещенные Windows-имена -> добавляем суффикс "_safe"
	const forbiddenNames = new Set([
		'CON',
		'PRN',
		'AUX',
		'NUL',
		'COM1',
		'COM2',
		'COM3',
		'COM4',
		'COM5',
		'COM6',
		'COM7',
		'COM8',
		'COM9',
		'LPT1',
		'LPT2',
		'LPT3',
		'LPT4',
		'LPT5',
		'LPT6',
		'LPT7',
		'LPT8',
		'LPT9',
	]);
	if (forbiddenNames.has(name.toUpperCase())) {
		name += '_safe';
	}

	name = name.substring(0, 255);

	if (name) {
		return name;
	}

	const newFolderCount = (Number(window.localStorage.getItem('newFolderCount')) || 0) + 1;

	window.localStorage.setItem('newFolderCount', String(newFolderCount));

	return `folder (${newFolderCount})`;
};

export default sanitizeFolderName;
