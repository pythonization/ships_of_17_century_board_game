import {
    expect, test,
    afterEach
} from 'vitest'
import {
    cleanup, render, fireEvent,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event'

import Editor from '../static/ship_game/components/editor/editor'

/*
Note:
If something will fail, in this test, you can get via
"container_with_portals.querySelector('textarea').value"
current code of a map.
*/

afterEach(() => {
    cleanup();
});

test('User make small map and draw land and ports on it', async () => {
    const user = userEvent.setup()

    // prepare HTML that will be later used by React createPortal
    const {
        container: container_with_portals,
        asFragment: fragments_with_portals,
        findByText: findBy_with_portals,
    } = render(
        <>
            <div id="place4map_editor_bt" />
            <div className="modal fade" id="ship_modal" tabIndex="-1" aria-labelledby="ship_modal_label" aria-hidden="true">
                <div className="modal-dialog modal-lg">
                    <div className="modal-content" id="ship_modal_content" />
                </div>
            </div>
        </>
    )

    const {
        container, asFragment,
        getByRole, getByLabelText, getByText
    } = render(
        <Editor />
    )

    // open settings
    await user.click(
        getByText('Settings')
    )

    // change keep ratio from True (default) to False (need for test)
    const ratio_check = getByLabelText('Keep ratio')
    expect(ratio_check.checked).toBe(true)
    await user.click(ratio_check)
    expect(ratio_check.checked).toBe(false)

    /*
    Make 4x4 map using settings only:
    spell-checker: disable
    WWWW
    WWWW
    WWWW
    WWWW
    spell-checker: enable
    */
    const rows_input = getByLabelText('Rows')
    const cols_input = getByLabelText('Columns')
    const select_all_text = {//select previous text to replace all the text
        initialSelectionStart: 0,

        // because there will not be 100 character - this will point to end of string
        initialSelectionEnd: 100,
    }
    await user.type(rows_input, '4', select_all_text)
    await user.type(cols_input, '4', select_all_text)
    expect(rows_input.value).toBe('4')
    expect(cols_input.value).toBe('4')
    expect(
        asFragment()
    ).toMatchSnapshot();
    await user.click(
        // close settings dialog
        getByRole('button', { name: 'Close' })
    )

    function table_cell(row, col) {
        // Should not use "container" in test that simulate user's actions. Better not to use it at all.
        // But here it is easier to navigate table like that.
        return container.querySelector(
            `tr:nth-of-type(${row})>td:nth-of-type(${col})`
        )
    }
    async function sequential_mouse_enter(coords) {
        const [first_r_c, ...rest_coords] = coords

        await user.pointer(
            { target: table_cell(...first_r_c) },
        )
        await user.pointer('[MouseLeft>]')// press
        for (const r_c of rest_coords) {

            fireEvent.mouseEnter(
                table_cell(...r_c)
            )

        }
        await user.pointer('[/MouseLeft]')// release
    }

    // Note: following will only mark only 1 cell, not 4 as expected.
    // Seems should do as docs suggests:
    // There are, however, some user interactions or aspects of these that aren't yet implemented and thus can't yet be described with user-event.
    // In these cases you can use fireEvent to dispatch the concrete events that your software relies on.
    // +
    // await user.pointer(
    //     {target: table_cell(4, 1)},
    // )
    // await user.pointer('[MouseLeft>]')// press
    // await user.pointer(
    //     {target: table_cell(4, 4)},
    // )
    // await user.pointer('[/MouseLeft]')// release

    /*
    Draw land:
    spell-checker: disable
    WWLL
    WWLL
    LLLL
    LLLL
    spell-checker: enable
    */
    await sequential_mouse_enter([
        [4, 1],
        [4, 2],
        [4, 3],
        [4, 4],

        [3, 4],
        [2, 4],
        [1, 4],

        [1, 3],
        [2, 3],
        [3, 3],

        [3, 2],
        [3, 1],
    ])
    expect(
        asFragment()
    ).toMatchSnapshot();

    /*
    Draw water again:
    spell-checker: disable
    WWwW
    WWwL
    WLLL
    LLLL
    spell-checker: enable
    */
    await user.click(
        table_cell(3, 1)
    )
    await sequential_mouse_enter([
        [1, 3],
        [2, 3],
    ])
    await user.click(
        table_cell(1, 4)
    )
    expect(
        asFragment()
    ).toMatchSnapshot();

    /*
    Port and misclick port:
    spell-checker: disable
    WWwW
    WWwL
    WLPL
    PLLL
    spell-checker: enable
    */
    await user.keyboard('{Control>}')
    await user.click(
        table_cell(3, 3)
    )
    await user.click(
        table_cell(4, 1)
    )
    await user.keyboard('{/Control}')
    expect(
        asFragment()
    ).toMatchSnapshot();

    /*
    Draw land and fix port misclick:
    spell-checker: disable
    WWWW
    WLWL
    WLPL
    LLLL
    spell-checker: enable
    */
    await user.click(
        table_cell(2, 2)
    )
    // fix misclick
    await user.click(
        table_cell(4, 1)
    )
    expect(
        asFragment()
    ).toMatchSnapshot();

    // open copy map, compare snapshot and check value of textarea
    await user.click(
        getByText(
            'copy code',
            { exact: false }// just nesting to match by partial text with wrong CASE
        )
    )
    await findBy_with_portals('Map Code') // bootstrap do not open modal fast, that is why snapshot below fail (in 50% of launches) if modal not awaited
    expect(
        fragments_with_portals()
    ).toMatchSnapshot();
    expect(
        // Should not use "container" in test that simulate user's actions. Better not to use it at all.
        // But here it is easier to find textarea
        container_with_portals.querySelector('textarea').value
    ).toBe(
        '[["W","W","W","W"],["W"," ","W"," "],["W"," ","P"," "],[" "," "," "," "]]'
    )
})
