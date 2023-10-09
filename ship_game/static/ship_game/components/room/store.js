import { configureStore } from '@reduxjs/toolkit'

import { players_reducer } from './players_slice'
import { config_reducer } from './config_slice'

export default configureStore({
    reducer: {
        config: config_reducer,
        players: players_reducer,
    }
})