import fixFilename from 'src/lib/fixFilename';

/**
 * Список зарезервированных имен в Windows, которые нельзя использовать в качестве имен каталогов.
 */
const WINDOWS_RESERVED_NAMES = new Set([
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

const MAX_FILENAME_LENGTH = 255;
const NEW_FOLDER_COUNT_KEY = 'vmsNewFolderCount';

const generateDefaultFolderName = (): string => {
	try {
		const currentCount = Number(window.localStorage.getItem(NEW_FOLDER_COUNT_KEY)) || 0;
		const newCount = currentCount + 1;

		window.localStorage.setItem(NEW_FOLDER_COUNT_KEY, String(newCount));

		return `folder (${newCount})`;
	} catch (e) {
		console.error(e);
	}

	return 'folderMusic';
};

const sanitizeFolderName = (name: string) => {
	let sanitizedName = fixFilename(name)
		.replace(/[\r\n\t]/g, ' ')
		.replace(/\s+/g, ' ');

	// начальные и конечные пробелы и точки
	sanitizedName = sanitizedName.trim().replace(/\.+$/, '');

	// запрещенные Windows-имена -> добавляем суффикс "_safe"
	if (WINDOWS_RESERVED_NAMES.has(sanitizedName.toUpperCase())) {
		sanitizedName = `${sanitizedName}_safe`;
	}

	sanitizedName = sanitizedName.substring(0, MAX_FILENAME_LENGTH);

	if (!sanitizedName) {
		return generateDefaultFolderName();
	}

	return sanitizedName;
};

export default sanitizeFolderName;
