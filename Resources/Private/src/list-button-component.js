import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { $get, $transform } from "plow-js";
import omit from 'lodash.omit';
import style from './style.css';
import { executeCommand } from '@neos-project/neos-ui-ckeditor5-bindings';

import { selectors } from '@neos-project/neos-ui-redux-store';
import { neos } from '@neos-project/neos-ui-decorators';
import { ButtonGroup, Button, IconButton } from '@neos-project/react-ui-components';
import {getEnabledListStyles, getListStyles} from "./config/config";

@neos(globalRegistry => ({
	i18nRegistry: globalRegistry.get('i18n')
}))
class IconButtonComponent extends PureComponent {
	static propTypes = {
		i18nRegistry: PropTypes.object,
		tooltip: PropTypes.string,
	};

	render() {
		const finalProps = omit(this.props, ['executeCommand', 'formattingRule', 'formattingUnderCursor', 'inlineEditorOptions', 'i18nRegistry', 'tooltip', 'isActive']);
		return (<IconButton {...finalProps} isActive={Boolean(this.props.isActive)}
							title={this.props.i18nRegistry.translate(this.props.tooltip)} />);
	}
}

@connect($transform({
	formattingUnderCursor: selectors.UI.ContentCanvas.formattingUnderCursor
}))
@neos(globalRegistry => ({
	i18nRegistry: globalRegistry.get('i18n')
}))
export default class ListButtonComponent extends PureComponent {
	static propTypes = {
		formattingUnderCursor: PropTypes.objectOf(PropTypes.oneOfType([
			PropTypes.number,
			PropTypes.bool,
			PropTypes.string,
			PropTypes.object
		])),
		inlineEditorOptions: PropTypes.object,
		i18nRegistry: PropTypes.object.isRequired,
		listType: PropTypes.oneOf(['numberedList', 'bulletedList']).isRequired,
		commandName: PropTypes.string.isRequired,
		isActive: PropTypes.bool.isRequired,
	};

	state = {
		isOpen: false
	};

	componentDidUpdate(prevProps, prevState) {
		if (prevProps.isActive && !this.props.isActive) {
			this.setState({ isOpen: false });
		}
	}

	render() {
		const listStyles = this.getEnabledListStyles();
		return (
			<div className={style.button}>
				<IconButtonComponent
					{...this.props}
				/>
				{this.shouldDisplayAdditionalButtons() && <IconButton className={style.icon} onClick={this.toggleOpen} icon={this.isOpen() ? 'chevron-up' : 'chevron-down'} />}
				{this.isOpen() && (
					<div className={style.dialog}>
						<ButtonGroup value={this.getListStyleUnderCursor('default')} onSelect={this.handleListStyleSelect}>
							{
								Object.keys(listStyles)
									.map(id => <Button
										id={id}
										style="lighter"
										size="regular"
										title={listStyles[id]['title']}
									>{listStyles[id]['title']}</Button>)
							}
						</ButtonGroup>
					</div>
				)}
			</div>
		);
	}

	handleListStyleSelect = (style) => {
		const current = this.getListStyleUnderCursor();

		if (current !== style) {
			executeCommand( 'listStyle', { type: style } );
		} else {
			executeCommand( 'listStyle', { type: 'default' } );
		}
	};

	toggleOpen = () => {
		this.setState({isOpen: !this.isOpen()});
	};

	getFormattingUnderCursor(defaultValue = '') {
		const { listType } = this.props;

		return $get(listType, this.props.formattingUnderCursor) || defaultValue;
	}

	getListStyleUnderCursor() {
		return $get('listStyle', this.props.formattingUnderCursor) || '';
	}

	getEnabledListStyles() {
		const listStyleConfiguration = $get('listStyle', this.props.inlineEditorOptions);

		const listType = this.props.listType === 'bulletedList' ? 'ul' : 'ol'
		const availableStyles = getListStyles(listType);

		if (typeof listStyleConfiguration !== 'object') {
			return getEnabledListStyles(listStyleConfiguration, availableStyles);
		}

		if (listType in listStyleConfiguration) {
			return getEnabledListStyles(listStyleConfiguration[listType], availableStyles);
		}

		return [];
	}

	shouldDisplayAdditionalButtons() {
		return this.getFormattingUnderCursor() !== '' && Object.keys(this.getEnabledListStyles()).length > 0;
	}

	isOpen() {
		return this.shouldDisplayAdditionalButtons() && this.state.isOpen;
	}
}
