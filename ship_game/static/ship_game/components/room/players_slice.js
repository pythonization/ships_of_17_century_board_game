import {
    createEntityAdapter, createSlice
} from '@reduxjs/toolkit'

// const PLAYER_TYPE_D = PropTypes.exact({
//     id: PropTypes.oneOfType([
//         PropTypes.string,
//         PropTypes.number,
//     ]).isRequired,

//     name: PropTypes.string,
//     online: PropTypes.bool,
//     color: PropTypes.string,
//     ready: PropTypes.bool,
// })

const player_adapter = createEntityAdapter()

const players_slice = createSlice({
    name: 'players',
    initialState: player_adapter.getInitialState(),
    reducers: {},
    extraReducers(builder) {
        builder
            .addCase('players/add_many', player_adapter.setAll)
            .addCase('players/add_one', player_adapter.addOne)
            .addCase('players/update_one', player_adapter.updateOne)
            .addCase('players/remove_one', player_adapter.removeOne)
        // .addDefaultCase(function(state, action){
        //     // but that will catch system redux actions and actions from './config_slice'
        //     console.warn('Unknown action', action)
        // })
    }
})

export const players_reducer = players_slice.reducer
export const players_selectors = player_adapter.getSelectors(state => state.players)