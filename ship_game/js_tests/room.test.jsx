import {
    expect, test, afterEach,
    vi
} from 'vitest'
import {
    cleanup, render,// fireEvent,
} from '@testing-library/react';
// import userEvent from '@testing-library/user-event'

import { Provider } from 'react-redux'

import Room from '../static/ship_game/components/room/room'
import { toggle_online } from '../static/ship_game/components/room/config_slice'
import store from '../static/ship_game/components/room/store'


/* To silent console.error(...) of react and check if correct error silenced.

// hide one warning - see below
const mocked_error_log = vi.fn()
vi.stubGlobal('console', {
    error: mocked_error_log,
})

// here call your code that cause
// console.error(...)

// restore normal console behavior
vi.unstubAllGlobals()
// and
// warning was hidden, because instead of instance of WebSocket, w_socket (simply object) passed in test
expect(mocked_error_log).toHaveBeenCalledTimes(1)
expect(
    mocked_error_log.mock.calls[0]
).toEqual(
    expect.arrayContaining([
        'Warning: Failed %s type: %s%s',
        'prop',
        'Invalid prop `w_socket` of type `Object` supplied to `Room`, expected instance of `WebSocket`.',
    ])
)

*/

afterEach(() => {
    cleanup();
});

// it is not finished
// todo:
// later delete that comment

test('Render and basic data tests: Room', () => {

    /* Note if you get error:
    TypeError: Cannot assign to read only property 'entities' of object '#<Object>'

    then replace:
    store.getState()

    with:
    JSON.parse(
        JSON.stringify(
            store.getState()
        )
    )

    after that return store back, because it is seems to be faster.
    */

    const w_socket_send = vi.fn()

    // #region empty data
    expect(
        store.getState()
    ).toEqual(
        {
            config: { is_online: false },
            players: { ids: [], entities: {} }
        }
    )

    const {
        asFragment
        // container, asFragment,
        // getByRole, getByLabelText, getByText
    } = render(
        <Provider store={store}>
            <Room room_name="Test room name 123" w_socket_send={w_socket_send} />
        </Provider>
    )

    // todo:
    // expect(
    //     asFragment()
    // ).toMatchSnapshot();

    // #endregion

    // #region is online
    store.dispatch(
        toggle_online(true)
    )
    expect(
        store.getState()
    ).toEqual(
        {
            config: { is_online: true },
            players: { ids: [], entities: {} }
        }
    )

    // todo:
    // expect(
    //     asFragment()
    // ).toMatchSnapshot();

    // #endregion

    // #region basic real data
    store.dispatch({
        type: 'config/set_your_id',
        payload: 2,// or 'your_token_str' or null if you are admin and player creation not allowed
    })
    store.dispatch({
        type: 'config/set_admin', // or do not set
    })
    store.dispatch({
        type: 'players/add_many',
        payload: [
            { id: 1, name: 'slow-poke', online: false, ready: false },
            { id: 2, name: 'you', online: true, ready: true },
            { id: 'token_str_1234_long_not_show_474487486467' },
        ],
    })
    expect(
        store.getState()
    ).toEqual(
        {
            config: { is_online: true, your_id: 2, admin: true },
            players: {
                ids: [1, 2, 'token_str_1234_long_not_show_474487486467'],
                entities: {
                    '1': { id: 1, name: 'slow-poke', online: false, ready: false },
                    '2': { id: 2, name: 'you', online: true, ready: true },
                    token_str_1234_long_not_show_474487486467: {
                        id: 'token_str_1234_long_not_show_474487486467'
                    },
                }
            }
        }
    )

    // todo:
    // expect(
    //     asFragment()
    // ).toMatchSnapshot();

    // #endregion

    // todo:
    // pass all type of data to w_socket.onmessage({

    // todo:
    // do more data tests
})
