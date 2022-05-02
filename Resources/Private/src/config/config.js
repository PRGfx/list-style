let listStyles = {};

/**
 * @param {'ul' | 'ol'} listType
 * @return {Record<string, {value: string, title: string}>}
 */
export function getListStyles(listType) {
	return listStyles.hasOwnProperty(listType) ? listStyles[listType] : {};
}

/**
 * Tries to determine the type of list from a given list styling
 * @param {string} style
 * @return {"bulleted"|"numbered"|null}
 */
export function getListTypeFromListStyleType( style ) {
	const listType = Object.keys( listStyles ).find( type => {
		return Object.keys(listStyles[type]).includes(style);
	} );

	if ( listType === 'ul' ) {
		return 'bulleted';
	} else if ( listType === 'ol' ) {
		return 'numbered';
	}

	return null;
}

/**
 * @param {boolean|null|string[]|Record<string, boolean|null>} configuration
 * @param {ReturnType<getListStyles>} availableListStyles
 * @return {*[]|*}
 */
export function getEnabledListStyles(configuration, availableListStyles) {
	let keys = [];
	if (configuration === false || configuration === null) {
		return keys;
	} else if (configuration === true) {
		return availableListStyles;
	} else if (Array.isArray(configuration)) {
		keys = configuration;
	} else if (typeof configuration === 'object') {
		keys = Object.keys(configuration).filter(key => Boolean(configuration[key]));
	}

	return keys
		.reduce((c, key) => {
			if (availableListStyles[key]) {
				c[key] = availableListStyles[key];
			}
			return c;
		}, {});
}

export function setListStyles(config) {
	const ul = config.hasOwnProperty('ul') ? config.ul : {};
	const ol = config.hasOwnProperty('ol') ? config.ol : {};

	[ul, ol].forEach(list => {
		Object.keys(list)
			.filter(key => {
				const value = list[key];

				return !value;
			})
			.forEach(key => delete list[key]);
	});

	listStyles = {
		ul: ul,
		ol: ol,
	};
}
