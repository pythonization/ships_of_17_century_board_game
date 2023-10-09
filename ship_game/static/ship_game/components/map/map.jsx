import './map.less'

import PropTypes from 'prop-types';


const CELL_TYPE_D = PropTypes.oneOf([
    ' ', //land
    'W', // water
    'P', // port
]).isRequired

export function MapCell({ cell_d, toggle_cell }) {
    return (
        <td onMouseDown={toggle_cell} onMouseEnter={toggle_cell} style={{
            border: cell_d !== ' ' && '1px solid black'
        }}>
            {cell_d === 'P' && <i className="fa-solid fa-anchor" />}
        </td>
    )
}
MapCell.propTypes = {
    cell_d: CELL_TYPE_D,
    toggle_cell: PropTypes.func,
}

function ShipMap({ table, image, on_edit_cell }) {
    function prevent_ctrl_click(event) {
        // do not select cell when CTRL+Click it (need for map editor)
        // can left code working also in not edit mode
        event.preventDefault();
    }

    /*
    then on desktop:
        table_width = 100vw
        col_width = 100vw / num_of_columns // but this not need, because "table-layout: fixed;" do this
        row_height = col_width // because we need squares
    */
    const row_height = 100 / table[0].length
    const font_size = row_height * 0.51 // bigger ratio make cells not square form (stretched)
    const row_style = {
        height: on_edit_cell ?
            `calc(${row_height}vw - 2px)` // in edit mode
            :
            `${row_height}vw`,
    }

    const table_contents = table.map((row, row_idx) => <tr
        key={row_idx} style={row_style}
    >
        {
            row.map((col, col_idx) => <MapCell key={col_idx} cell_d={col}
                toggle_cell={on_edit_cell && (ev => on_edit_cell(row_idx, col_idx, ev))}
            />)
        }
    </tr>)

    return (
        <table onMouseDown={prevent_ctrl_click} className='ship_map' style={{
            width: '100vw',
            fontSize: `${font_size}vw`,

            backgroundImage: `url("${image}")`,

            borderCollapse: on_edit_cell && 'separate',// only in edit mode
        }}>
            <tbody>
                {table_contents}
            </tbody>
        </table>
    )
}
ShipMap.propTypes = {
    table: PropTypes.arrayOf(
        PropTypes.arrayOf(
            CELL_TYPE_D
        ).isRequired,
    ).isRequired,
    image: PropTypes.string.isRequired,
    on_edit_cell: PropTypes.func
}

export default ShipMap