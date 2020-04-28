/**
 * External dependencies
 */
import { map } from 'lodash';

/**
 * WordPress dependencies
 */
import { useMemo, useCallback } from '@wordpress/element';
import { parse, cloneBlock } from '@wordpress/blocks';
import { useDispatch } from '@wordpress/data';
import { ENTER, SPACE } from '@wordpress/keycodes';
import { __, sprintf, _x } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import BlockPreview from '../block-preview';
import useAsyncList from './use-async-list';
import InserterPanel from './panel';
import { searchItems } from './search-items';
import InserterNoResults from './no-results';

function BlockPattern( { pattern, onClick } ) {
	const { content } = pattern;
	const blocks = useMemo( () => parse( content ), [ content ] );

	return (
		<div
			className="block-editor-inserter__patterns-item"
			role="button"
			onClick={ () => onClick( pattern, blocks ) }
			onKeyDown={ ( event ) => {
				if ( ENTER === event.keyCode || SPACE === event.keyCode ) {
					onClick( blocks );
				}
			} }
			tabIndex={ 0 }
			aria-label={ pattern.title }
		>
			<BlockPreview blocks={ blocks } />
		</div>
	);
}

function BlockPatternPlaceholder() {
	return (
		<div className="block-editor-inserter__patterns-item is-placeholder" />
	);
}

function BlockPatterns( { patterns, onInsert, filterValue } ) {
	const filteredPatterns = useMemo(
		() => searchItems( patterns, filterValue ),
		[ filterValue, patterns ]
	);
	const currentShownPatterns = useAsyncList( filteredPatterns );
	const { createSuccessNotice } = useDispatch( 'core/notices' );
	const onClickPattern = useCallback( ( pattern, blocks ) => {
		onInsert( map( blocks, ( block ) => cloneBlock( block ) ) );
		createSuccessNotice(
			sprintf(
				/* translators: %s: block pattern title. */
				__( 'Pattern "%s" inserted.' ),
				pattern.title
			),
			{
				type: 'snackbar',
			}
		);
	}, [] );

	return !! filteredPatterns.length ? (
		<InserterPanel
			title={
				filterValue
					? _x( 'Search Results', 'patterns' )
					: _x( 'All', 'patterns' )
			}
		>
			{ filteredPatterns.map( ( pattern, index ) =>
				currentShownPatterns[ index ] === pattern ? (
					<BlockPattern
						key={ index }
						pattern={ pattern }
						onClick={ onClickPattern }
					/>
				) : (
					<BlockPatternPlaceholder key={ index } />
				)
			) }
		</InserterPanel>
	) : (
		<InserterNoResults filterValue={ filterValue } />
	);
}

export default BlockPatterns;