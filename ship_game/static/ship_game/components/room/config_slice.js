/*
Storing data need for room (excluding players)
*/
import {
    createSlice
} from '@reduxjs/toolkit'

const config_slice = createSlice({
    name: 'config',
    initialState: {
        is_online: false,

        // here will be also properties, but they initially not set
        // your_id: 2, // or 'your_token_str' or not set if player creation not allowed
        // admin: true,// or not set
    },
    reducers: {
        toggle_online(state, action) {
            state.is_online = action.payload
        }
    },
    extraReducers(builder) {
        builder
            .addCase('config/set_your_id', (state, action) => {
                state.your_id = action.payload
            })
            .addCase('config/set_admin', (state) => {
                state.admin = true
            })
    }
})

export const config_reducer = config_slice.reducer
export const { toggle_online } = config_slice.actions