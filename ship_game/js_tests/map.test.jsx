import {
    expect, test, vi, describe,
    afterEach
} from 'vitest'
import renderer from 'react-test-renderer';
import {
    cleanup, render,
    fireEvent
} from '@testing-library/react';

import ShipMap, { MapCell } from '../static/ship_game/components/map/map.jsx'


const mock_callback = vi.fn()

describe('Render tests', () => {
    function render_cell(cell_d) {
        return renderer
            .create(<MapCell cell_d={cell_d} toggle_cell={mock_callback} />)
            .toJSON()
    }

    test('Cell (all 3 types)', () => {
        expect(
            render_cell(' ')
            // better use "asFragment()" instead of 'react-test-renderer'
        ).toMatchSnapshot();
        expect(
            render_cell('W')
            // better use "asFragment()" instead of 'react-test-renderer'
        ).toMatchSnapshot();
        expect(
            render_cell('P')
            // better use "asFragment()" instead of 'react-test-renderer'
        ).toMatchSnapshot();
    })

    test('Map (Readonly)', () => {
        expect(
            renderer
                .create(
                    <ShipMap
                        table={[
                            ['W', 'W', 'W'],
                            ['W', 'P', ' '],
                            ['W', ' ', ' '],
                        ]}
                        image='/not_existing_image.png'
                    />
                )
                .toJSON()
                // better use "asFragment()" instead of 'react-test-renderer'
        ).toMatchSnapshot();
    })

    test('Map (Editable)', () => {
        expect(
            renderer
                .create(
                    <ShipMap
                        table={[
                            ['W', 'W', 'W', 'W'],
                            ['W', 'W', 'W', 'W'],
                            ['W', 'W', 'P', ' '],
                            ['W', 'W', ' ', ' '],
                        ]}
                        image='/not_existing_image.png' on_edit_cell={mock_callback}
                    />
                )
                .toJSON()
                // better use "asFragment()" instead of 'react-test-renderer'
        ).toMatchSnapshot();
    })
})

describe('Tests with events handlers', () => {

    afterEach(() => {
        cleanup();
    });

    test('Cell', () => {

        // need this because <td> should be inside table structure
        const { container } = render(<table>
            <tbody>
                <tr>
                    <MapCell cell_d='W' toggle_cell={mock_callback} />
                </tr>
            </tbody>
        </table>)

        // Should not use "container" in test that simulate user's actions. Better not to use it at all.
        // but here it is easier to use it
        const tr_el = container.querySelector('td')
        fireEvent.mouseDown(tr_el)
        fireEvent.mouseEnter(tr_el)

        expect(
            mock_callback
        ).toHaveBeenCalledTimes(2);
    })
})