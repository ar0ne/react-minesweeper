import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

const BOMB = 'X';

// @TODO: handle second mouse button


function Square(props) {
    return (
        <button 
            className="square"
            onClick={props.onClick}
        >
        {props.value}
        </button> 
    );
}


class Board extends React.Component {
    render() {

        // @TODO: refactor it!
        return (
            <div>
                <div className="board-row">
                    {this.renderSquare(0)}
                    {this.renderSquare(1)}
                    {this.renderSquare(2)}
                    {this.renderSquare(3)}
                    {this.renderSquare(4)}
                </div>
                <div className="board-row">
                    {this.renderSquare(5)}
                    {this.renderSquare(6)}
                    {this.renderSquare(7)}
                    {this.renderSquare(8)}
                    {this.renderSquare(9)}
                </div>
                <div className="board-row">
                    {this.renderSquare(10)}
                    {this.renderSquare(11)}
                    {this.renderSquare(12)}
                    {this.renderSquare(13)}
                    {this.renderSquare(14)}
                </div>
                <div className="board-row">
                    {this.renderSquare(15)}
                    {this.renderSquare(16)}
                    {this.renderSquare(17)}
                    {this.renderSquare(18)}
                    {this.renderSquare(19)}
                </div>
                <div className="board-row">
                    {this.renderSquare(20)}
                    {this.renderSquare(21)}
                    {this.renderSquare(22)}
                    {this.renderSquare(23)}
                    {this.renderSquare(24)}
                </div>
            </div>
        );
    }

    renderSquare(i) {
        return (
            <Square 
                onClick={() => this.props.onClick(i)}
                value={this.renderValue(i)}
            />
        );
    }

    renderValue(i) {
        if (this.props.history.includes(i)) {
            return this.props.squares[i];
        }
    }
}

class Game extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            squares: this.initSquares(),
            history: [],
            gameOver: false,
        };
    }

    handleClick(i) {
        if (this.state.gameOver) {
            return;
        }

        const history = this.state.history.slice();
        let closesZeroes = [];

        if (history.includes(i)) {
            return;
        }

        let gameOverStatus = false;

        let square = this.state.squares[i]
        if (square === BOMB) {
            gameOverStatus = true;
        } else if (square === 0) {
            closesZeroes = this.handleZeroes(i);
        }

        this.setState({
            squares: this.state.squares.slice(),
            history: history.concat(i).concat(closesZeroes),
            gameOver: gameOverStatus,
        });
    }

    handleZeroes(i) {
        // @TODO: recursively check neighbours
        return [];
    }

    initSquares(size = 25, complexity = 5) {
        let squares = Array(size).fill(null);
        let counter = 0;
        while(counter < complexity) {
            let index = Math.floor(Math.random() * (size - 0));
            if (squares[index] === BOMB) {
                continue;
            }
            squares[index] = BOMB;
            counter++;
        }

        let delimiter = Math.sqrt(size);
        for(var i = 0; i < delimiter; i++) {
            for (var j = 0; j < delimiter; j++) {
                let index = i * delimiter + j;
                if (squares[index] !== BOMB) {
                    let counter = 0;
                    if (squares[index - delimiter] === BOMB) {
                        counter++;
                    } 
                    if (squares[index + delimiter] === BOMB) {
                        counter++;
                    } 
                    if ((index + 1) % delimiter !== 0 && squares[index + 1] === BOMB) {
                        counter++;
                    }
                    if (index % delimiter !== 0 && squares[index - 1] === BOMB) {
                        counter++;
                    }
                    // @TODO: add checks for rest neighbours 

                    squares[index] = counter;
                }
            }
        }

        return squares;
    }

    restartGame() {
        this.setState({
            squares: this.initSquares(),
            history: [],
            gameOver: false,
        });
    }


    render() {
        const gameOverStatus = this.state.gameOver ? 
            'Game over! Restart the game':
            'Good luck!';

        return (
            <div>
                <h1 className='status'>{gameOverStatus}</h1>
                <Board 
                    squares={this.state.squares}
                    history={this.state.history}
                    onClick={i => this.handleClick(i)}
                />
                <button className="btn" onClick={() => this.restartGame()}>Restart</button>
            </div>
        );
    }
}


ReactDOM.render(<Game />, document.getElementById('root'));