import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

const BOMB = 'X';
const GAME_OVER = "GAME_OVER";
const GAME_WON = "GAME_WON";

const STATUSES = {
    GAME_OVER: 'Game over!',
    GAME_WON: "You win!",
    null: 'Good luck!',
}


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

        // @TODO: take size from state
        // @TODO: add support of different board sizes

        let cols = 5;
        let rows = 5;

        let board = []
        for (var i = 0; i < cols; i++) {
            let row = []
            for (var j = 0; j < rows; j++) {
                row.push(this.renderSquare(i * cols + j))
            }
            board.push(<div className="board-row">{row}</div>)
        }

        return (
            <div className="board">{board}</div>
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
            squares: [],
            history: [],
            status: null,
        };
    }


    handleClick(i) {
        let squares = this.state.squares;
        if (!squares.length) {
            squares = this.initSquares(i);
        }

        let status = this.state.status;

        if (status === GAME_OVER || status === GAME_WON) {
            return;
        }

        let history = this.state.history.slice();
        let closesZeroes = [];

        if (history.includes(i)) {
            return;
        }


        let square = squares[i]
        if (square === BOMB) {
            status = GAME_OVER;
        } else if (square === 0) {
            closesZeroes = this.openClosestZeroSquares(i);
        } 

        history = history.concat(i).concat(closesZeroes);

        if (this.isGameWon(squares, history)) {
            status = GAME_WON;
        }

        this.setState({
            squares: squares.slice(),
            history: history,
            status: status,
        });
    }

    openClosestZeroSquares(i) {
        // @TODO: recursively check neighbours
        return [];
    }

    containsAllElements = (arr, target) => target.every(v => arr.includes(v));

    isGameWon(squares, history) {
        let notBombs = squares
            .map((val, index) => val !== BOMB ? index : undefined)
            .filter(x => x !== undefined);
        return this.containsAllElements(history, notBombs);
    }

    initSquares(excluded, size = 25, complexity = 5) {
        let squares = Array(size).fill(null);
        let counter = 0;
        while(counter < complexity) {
            let index = Math.floor(Math.random() * (size - 0));
            if (index === excluded || squares[index] === BOMB) {
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
            squares: [],
            history: [],
            status: null,
        });
    }


    render() {

        let gameStatus = STATUSES[this.state.status];

        return (
            <div>
                <h1 className='status'>{gameStatus}</h1>
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