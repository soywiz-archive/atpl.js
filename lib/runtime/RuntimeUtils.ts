export function capitalize(str: string) {
	str = String(str);
	return str.charAt(0).toUpperCase() + str.substr(1);
}

export function title(str: string) {
	return String(str).replace(/\w+/g, (word) => {
		return capitalize(word);
	});
}