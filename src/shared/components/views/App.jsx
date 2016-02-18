import React, { Component } from 'react';
import eyeClosePng from 'assets/img/eye_close.png';
import eyeOpenPng from 'assets/img/eye_open.png';

class App extends Component {

    render() {
        return (
            <div className='App'>
                <section className='App-sidebar'>
                    <img src={eyeOpenPng} />
                </section>
                { this.props.children }
            </div>
        );
    }

}

export default App;
