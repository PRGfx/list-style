import manifest from '@neos-project/neos-ui-extensibility';
import { $add, $get } from 'plow-js';
import ListButtonComponent from "./list-button-component";
import React from 'react';
import ListStyleEditing from "./liststyle/liststyleediting";
import {getEnabledListStyles, getListStyles, setListStyles} from "./config/config";

const addPlugin = (Plugin, getConfiguration) => (ckEditorConfiguration, options) => {
	const editorConfiguration = getConfiguration(options.editorOptions);
	console.log(editorConfiguration);
	const isEnabled = editorConfiguration === true
		|| Object.keys(getEnabledListStyles($get('ol', editorConfiguration), getListStyles('ol'))).length > 0
		|| Object.keys(getEnabledListStyles($get('ul', editorConfiguration), getListStyles('ul'))).length > 0;
	if (isEnabled) {
		ckEditorConfiguration.plugins = ckEditorConfiguration.plugins || [];
		return $add('plugins', Plugin, ckEditorConfiguration);
	}
	return ckEditorConfiguration;
};

manifest('Lala.ListStyle:ListStyleButton', {}, (globalRegistry, { frontendConfiguration }) => {
	const ckEditorRegistry = globalRegistry.get('ckEditor5');
	const config = ckEditorRegistry.get('config');
	const richtextToolbar = ckEditorRegistry.get('richtextToolbar');
	setListStyles(frontendConfiguration['Lala.ListStyle:Styles']);
	config.set('listStyle', addPlugin(ListStyleEditing, $get('listStyle')));

	// ordered list
	richtextToolbar.set('orderedList', {
		commandName: 'numberedList',
		component: ListButtonComponent,
		callbackPropName: 'onClick',
		icon: 'list-ol',
		hoverStyle: 'brand',
		tooltip: 'Neos.Neos.Ui:Main:ckeditor__toolbar__ordered-list',
		isVisible: $get('formatting.ol'),
		isActive: $get('numberedList'),
		listType: 'numberedList'
	});

	// Unordered list
	richtextToolbar.set('unorderedList', {
		commandName: 'bulletedList',
		component: ListButtonComponent,
		callbackPropName: 'onClick',
		icon: 'list-ul',
		hoverStyle: 'brand',
		tooltip: 'Neos.Neos.Ui:Main:ckeditor__toolbar__unordered-list',
		isVisible: $get('formatting.ul'),
		isActive: $get('bulletedList'),
		listType: 'bulletedList'
	});
});
