import './room.less'

import { Modal as BsModal } from 'bootstrap'
import PropTypes from 'prop-types';
import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSelector } from 'react-redux'

import { players_selectors } from './players_slice'


const every4char_match = /.{1,4}/g

function PlayerCard({
    player_id, w_socket_send, show_edit_myself,
}) {
    const your_id = useSelector(state => state.config.your_id)
    const is_admin = useSelector(state => state.config.admin)

    const player = useSelector(state => players_selectors.selectById(state, player_id))

    const is_current_player = your_id == player.id

    let card_class = "card position-relative text-bg-"

    let p_color, p_name, token, add_player_btn, player_ctrl_btn;

    function add_player_click() {
        const new_name = prompt('New player name')
        if (new_name) {
            // new name entered and OK pressed
            w_socket_send({
                type: 'player_token2player',
                p_token: player.id,
                name: new_name,
            })
        }
    }

    if (player.name) {
        // player registered in DB (as a result - has name)

        p_name = player.name
        p_color = <span className="color_square me-1" style={{ backgroundColor: '#' + player.color }} />

        card_class += is_current_player ? "primary" : "secondary"

        if (is_current_player) {
            player_ctrl_btn = (
                <>
                    <button type="button" className="btn me-2 btn-secondary"
                        onClick={event => show_edit_myself(p_name, '#' + player.color)}
                    >
                        <i className="fa-solid fa-user-pen" />
                        &nbsp;
                        Edit profile
                    </button>
                    <button type="button" className="btn me-2 btn-light">
                        <i className="fa-solid fa-person-circle-question" />
                        &nbsp;
                        Toggle ready
                    </button>
                </>
            )
        }
    } else {
        p_name = is_current_player ?
            'You are not registered' : 'Not registered';

        card_class += is_current_player ? "warning" : "secondary"

        token = (
            <p className="card-text">
                {is_current_player ? 'Your token:' : 'Token:'}
                &nbsp;
                {player.id.substr(0, 16).match(every4char_match).join(' ')}
            </p>
        )

        if (is_admin) {
            add_player_btn = (
                <button type="button" className="btn me-2 btn-success"
                    onClick={add_player_click}
                >
                    <i className="fa-solid fa-user-plus" />
                    &nbsp;
                    Add a player
                </button>
            )
        }
    }

    return (
        <div className="col">
            <div className={card_class}>

                <span className="position-absolute top-0 start-100">
                    <span className={
                        "translate-middle badge rounded-pill bg-" +
                        (player.ready ? 'success' : 'secondary')
                    }>
                        <i className={
                            "fa-solid fa-user-" +
                            (player.ready ? 'check' : 'clock')
                        } />
                    </span>
                    {
                        player.online &&
                        <span className="translate-middle badge rounded-pill bg-success">
                            <i className="fa-solid fa-globe" />
                        </span>
                    }
                </span>

                <div className="card-body">
                    <h5 className="card-title">
                        {p_color}
                        {p_name}
                    </h5>
                    {token}
                    {add_player_btn}
                    {player_ctrl_btn}
                </div>

            </div>
        </div>
    )
}
PlayerCard.propTypes = {
    player_id: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]).isRequired,
    w_socket_send: PropTypes.func.isRequired,
    show_edit_myself: PropTypes.func.isRequired,
}

function Room({ room_name, w_socket_send }) {
    const is_online = useSelector(state => state.config.is_online)
    const your_id = useSelector(state => state.config.your_id)

    let player_ids = useSelector(players_selectors.selectIds)

    const [profileName, setProfileName] = useState('')
    const [profileColor, setProfileColor] = useState('')
    // in state color stored with leading '#', without in other places

    const modal_ref = useRef(null);
    if (modal_ref.current === null) {
        modal_ref.current = new BsModal('#ship_modal', {})
    }

    if (
        your_id &&
        player_ids.includes(your_id)
    ) {
        // make your_id first in list of player_ids to display current player always first
        player_ids = player_ids.filter(id => id != your_id)
        player_ids.unshift(your_id)
    }

    function show_edit_myself(name, color) {
        setProfileName(name)
        setProfileColor(color)

        modal_ref.current.show()
    }

    function update_myself() {
        w_socket_send({
            type: 'player_profile_update',
            name: profileName,
            color: profileColor.substring(1),
        })

        modal_ref.current.hide()
    }

    const online_mark = is_online ?
        <span className="badge float-end text-bg-success">online</span>
        :
        <span className="badge float-end text-bg-danger">offline</span>;

    return (
        <div className="container">

            <div className="row">
                <div className="col-12">
                    <h1>
                        {room_name}
                        {online_mark}
                    </h1>
                </div>
            </div>

            <div className="row row-cols-1 row-cols-md-3 g-4">
                {
                    player_ids.map(p_id => (
                        <PlayerCard key={p_id} player_id={p_id}
                            w_socket_send={w_socket_send} show_edit_myself={show_edit_myself}
                        />
                    ))
                }
            </div>

            {createPortal(
                <>
                    <div className="modal-header">
                        <h1 className="modal-title" id="ship_modal_label">
                            Profile
                        </h1>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
                    </div>

                    <div className="modal-body">
                        <div className="row mt-2">
                            <div className="col">
                                <label htmlFor="player_name_txt" className="form-label">
                                    Name
                                </label>
                            </div>
                            <div className="col">
                                <input id="player_name_txt" className="form-control"
                                    value={profileName} onChange={e => setProfileName(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="row mt-2">
                            <div className="col">
                                <label htmlFor="player_color" className="form-label">
                                    Color
                                </label>
                            </div>
                            <div className="col">
                                <input id="player_color" className="form-control form-control-color"
                                    type="color" title="Choose your color"
                                    value={profileColor} onChange={e => setProfileColor(e.target.value)}
                                />
                            </div>
                        </div>

                        <button type="button" className="btn btn-primary" onClick={update_myself}>
                            Save
                        </button>
                        &nbsp;
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                            Cancel
                        </button>
                    </div>
                </>,
                document.getElementById("ship_modal_content")
            )}

        </div>
    )
}
Room.propTypes = {
    room_name: PropTypes.string.isRequired,
    w_socket_send: PropTypes.func.isRequired,
}

export default Room