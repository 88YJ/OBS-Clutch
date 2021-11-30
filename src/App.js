import React, { Component } from 'react'
import { Stack, Image, PrimaryButton } from '@fluentui/react'
import './App.css'
import gameImage from './images/Dust.jpg'
const { ipcRenderer } = window.require('electron')

const gameLocation = 'C:\\Program Files (x86)\\Steam\\steamapps\\common\\Call of Duty Black Ops\\BlackOps.exe'

export default class App extends Component {
    render() {
        return (
            <div className='App'>
                <Stack tokens={{ childrenGap: 10 }}>
                    <Stack horizontalAlign='center'>
                        <Image src={gameImage} />
                    </Stack>
                    <PrimaryButton text='Play' onClick={this.playGame} />
                    <PrimaryButton text='Stream' onClick={this.streamGame} />
                </Stack>
            </div>
        )
    }

    playGame = () => {
        ipcRenderer.send('game-play', gameLocation)
    }

    streamGame = () => {
        ipcRenderer.send('game-stream')
        setTimeout(() => {
            this.playGame()
        }, 1000)
    }
}
