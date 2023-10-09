import { Modal as BsModal } from 'bootstrap'
import { useState } from 'react';
import { createPortal } from 'react-dom';

import ShipMap from '../map/map.jsx'
import MAP_COLLECTION from '../map_data/data.js'

// can import
// import * as bootstrap from 'bootstrap'
// to create modal like "new bootstrap.Modal("

function calc_map_name(desc) {
    const map_table = desc.table;

    const num_ports = map_table.reduce(
        (accumulator, row) => (
            accumulator +
            row.reduce(
                (ports_in_row, cell) => ports_in_row + (cell === 'P'),
                0
            )
        ),
        0
    );

    return `${desc.name} [${map_table[0].length}:${map_table.length} ${num_ports}P]`
}

function Editor() {
    const [drawingMode, setDrawingMode] = useState(false);
    const [mapName, setMapName] = useState('g_finland_48x27');
    const [table, setTable] = useState(
        MAP_COLLECTION[mapName].table
    );

    // #region modal state
    const [modalMode, setModalMode] = useState(''); // '' or 'code' or 'settings'
    const [valueKeepRatio, setValueKeepRatio] = useState(true);
    // #endregion

    function start_drawing(event) {
        if (!event.ctrlKey) {
            setDrawingMode(true)
        }
    }
    function end_drawing() {
        setDrawingMode(false)
    }

    function on_edit_cell(row_idx, col_idx, event) {
        if (

            // initial click to start drawing
            (event.type === "mousedown") ||

            // user continue to draw water
            (
                drawingMode &&
                event.type === "mouseenter"
            )
        ) {
            let new_table = [...table];
            let new_row = [...table[row_idx]];

            new_table[row_idx] = new_row

            let old_cell = new_row[col_idx]

            if (event.ctrlKey) {
                // toggle port
                if (old_cell === 'P') {
                    new_row[col_idx] = 'W'
                } else {
                    new_row[col_idx] = 'P'
                }
            } else {
                // toggle water
                if (old_cell === ' ') {
                    new_row[col_idx] = 'W'
                } else {
                    new_row[col_idx] = ' '
                }
            }

            setTable(new_table)
        }
    }

    // #region modal functions
    function show_modal(mode) {
        setModalMode(mode)
        const modal = new BsModal('#ship_modal', {})
        modal.show()
    }
    function change_map(e) {
        const new_map_name = e.target.value

        setMapName(new_map_name)
        setTable(
            MAP_COLLECTION[new_map_name].table
        )
    }
    function change_row_col(row, col) {
        const row_old = table.length
        const col_old = table[0].length

        if (row === undefined) {
            col = parseInt(col) || 1
            if (col < 0) {
                col = 1
            }
            row = valueKeepRatio ?
                row_old * col / col_old :
                row_old
        } else {
            row = parseInt(row) || 1
            if (row < 0) {
                row = 1
            }
            col = valueKeepRatio ?
                col_old * row / row_old :
                col_old
        }

        let new_table = []
        for (let cur_row = 0; cur_row < Math.round(row); cur_row++) {
            new_table.push(
                Array(
                    Math.round(col)
                ).fill('W')
            )
        }

        setTable(new_table)
    }
    // #endregion

    let modal_content
    if (modalMode === 'code') {
        modal_content = (
            <>
                <div className="modal-header">
                    <h1 className="modal-title" id="ship_modal_label">
                        Map Code
                    </h1>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
                </div>

                <div className="modal-body">
                    <textarea className="w-100" rows="10" readOnly={true} value={JSON.stringify(table)} />
                </div>
            </>
        )
    } else if (modalMode === 'settings') {
        modal_content = (
            <>
                <div className="modal-header">
                    <h1 className="modal-title" id="ship_modal_label">
                        Settings
                    </h1>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
                </div>

                <div className="modal-body">
                    <div className="row mt-2">
                        <div className="col">
                            Map
                        </div>
                        <div className="col">
                            <select className="form-select" aria-label="Map"
                                value={mapName} onChange={change_map}>
                                {
                                    Object.entries(MAP_COLLECTION).map(
                                        ([code, desc]) => (
                                            <option value={code} key={code}>
                                                {calc_map_name(desc)}
                                            </option>
                                        )
                                    )
                                }

                            </select>
                        </div>
                    </div>

                    <div className="row mt-2">
                        <div className="col">
                            <label htmlFor="num_rows" className="form-label">
                                Rows
                            </label>
                        </div>
                        <div className="col">
                            <input id="num_rows" type="number" className="form-control" min="1"
                                value={table.length} onChange={e => change_row_col(e.target.value)} />
                        </div>
                    </div>
                    <div className="row mt-2">
                        <div className="col">
                            <label htmlFor="num_cols" className="form-label">
                                Columns
                            </label>
                        </div>
                        <div className="col">
                            <input id="num_cols" type="number" className="form-control" min="1"
                                value={table[0].length} onChange={e => change_row_col(undefined, e.target.value)} />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col offset-6">
                            <div className="form-check form-switch mt-2">
                                <input className="form-check-input" type="checkbox" role="switch" id="keep_ratio"
                                    checked={valueKeepRatio} onChange={e => setValueKeepRatio(e.target.checked)} />
                                <label className="form-check-label" htmlFor="keep_ratio">
                                    Keep ratio
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="alert alert-info mt-3" role="alert">
                        <p>
                            <strong>Instructions:</strong>
                        </p>
                        <p>
                            <kbd>Click</kbd> or <kbd>Click + Drag</kbd> to toggle water.
                        </p>
                        <p>
                            <kbd>Ctrl + Click</kbd> to toggle port.
                        </p>
                    </div>

                </div>
            </>
        )
    }

    return (
        <>
            <div onMouseDown={start_drawing} onMouseUp={end_drawing} onMouseLeave={end_drawing}>
                <ShipMap table={table} image={MAP_COLLECTION[mapName].image} on_edit_cell={on_edit_cell} />
            </div>
            {createPortal(
                <>
                    <button className="btn btn-outline-primary" type="button" onClick={() => show_modal('code')}>
                        <i className="fa-solid fa-code" />
                        &nbsp;
                        Copy code of a map
                    </button>
                    &nbsp;
                    <button className="btn btn-outline-secondary" type="button" onClick={() => show_modal('settings')}>
                        <i className="fa-solid fa-gears" />
                        &nbsp;
                        Settings
                    </button>
                </>,
                document.getElementById("place4map_editor_bt")
            )}
            {createPortal(
                modal_content,
                document.getElementById("ship_modal_content")
            )}
        </>
    )
}

export default Editor