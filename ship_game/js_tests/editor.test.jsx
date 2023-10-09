import {
    expect, test, vi,
    beforeAll, afterAll
} from 'vitest'
import renderer from 'react-test-renderer';

import Editor from '../static/ship_game/components/editor/editor'

beforeAll(async () => {

    // instead of createPortal, just render element inline
    // (to do not simulate all page HTML)
    vi.mock('react-dom', async () => ({
        ...(await vi.importActual(
            'react-dom'
        )),
        createPortal: vi.fn((element, node) => element),
    }))

    // instead of showing Modal - do nothing
    // (to do not simulate all page HTML)
    vi.mock('bootstrap', async () => ({
        ...(await vi.importActual(
            'bootstrap'
        )),
        Modal: vi.fn().mockImplementation(() => {
            return { show: vi.fn() };
        }),
    }))
    // +
    // can not do auto-mock like
    // vi.mock('bootstrap')
    // because vitest does not expect Modal will be called with new

    // we are not testing map here, only editor
    // do not render map inside, because it is too big
    vi.mock('../static/ship_game/components/map/map.jsx', () => ({
        default: vi.fn().mockReturnValue(
            'Map was here, but now it is mocked'
        )
    }))

})
afterAll(() => {
    vi.restoreAllMocks()
})

test('Render tests: editor (dialogs closed/opened)', () => {
    const test_r_instance = renderer.create(<Editor />)

    expect(
        test_r_instance.toJSON()
        // better use "asFragment()" instead of 'react-test-renderer'
    ).toMatchSnapshot();

    let settings_bt = test_r_instance.root.find(r_instance => (
        r_instance.type == 'button' &&
        r_instance.children[1].toLowerCase().includes('settings')
    ))
    let copy_bt = test_r_instance.root.find(r_instance => (
        r_instance.type == 'button' &&
        r_instance.children[1].toLowerCase().includes('copy code')
    ))

    // open settings dialog
    settings_bt.props.onClick();

    // #region make map smaller
    const input_rows = test_r_instance.root.find(r_instance => (
        r_instance.type == 'input' &&
        r_instance.props.id == "num_rows"
    ))
    const input_cols = test_r_instance.root.find(r_instance => (
        r_instance.type == 'input' &&
        r_instance.props.id == "num_cols"
    ))
    const input_ratio = test_r_instance.root.find(r_instance => (
        r_instance.type == 'input' &&
        r_instance.props.id == "keep_ratio"
    ))

    input_ratio.props.onChange({
        target: {
            checked: false,
        }
    })
    input_rows.props.onChange({
        target: {
            value: 3,
        }
    })
    input_cols.props.onChange({
        target: {
            value: 3,
        }
    })
    // #endregion

    expect(
        test_r_instance.toJSON()
        // better use "asFragment()" instead of 'react-test-renderer'
    ).toMatchSnapshot();

    // open copy map dialog
    copy_bt.props.onClick();

    expect(
        test_r_instance.toJSON()
        // better use "asFragment()" instead of 'react-test-renderer'
    ).toMatchSnapshot();
})
