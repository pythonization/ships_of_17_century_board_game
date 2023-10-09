import { Provider } from 'react-redux'
import React from 'react'
import ReactDOM from 'react-dom/client'

import Room from '../components/room/room'
import { toggle_online } from '../components/room/config_slice'
import store from '../components/room/store'


const room_data = JSON.parse(
    document.getElementById('stored_room_data').textContent
);

// #region setup WebSocket
const room_socket = new WebSocket(
    `ws://${window.location.host}/ws/room/${room_data.id}`
);

room_socket.onopen = function (event) {
    store.dispatch(
        toggle_online(true)
    )
    w_socket_send({
        type: 'need_init_data'
    })
}
room_socket.onmessage = function (event) {
    const msg_list = JSON.parse(event.data)

    for (const msg of msg_list) {
        store.dispatch(msg)
    }
}
room_socket.onclose = function (event) {
    store.dispatch(
        toggle_online(false)
    )
}

function w_socket_send(data) {
    room_socket.send(
        JSON.stringify(data)
    )
}
// #endregion

ReactDOM.createRoot(
    document.getElementById('room_component_root')
).render(
    <React.StrictMode>
        <Provider store={store}>
            <Room room_name={room_data.name} w_socket_send={w_socket_send} />
        </Provider>
    </React.StrictMode>,
)
