import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

const BOMB = 'X';
const ZERO = 0;
const FLAG = '?';
const GAME_OVER = "GAME_OVER";
const GAME_WON = "GAME_WON";

const STATUSES = {
    GAME_OVER: 'Game over!',
    GAME_WON: "You win!",
    null: 'Good luck!',
}


function Square(props) {
    return (
        <button 
            className="square"
            onClick={props.onClick}
            onContextMenu={props.onClick}
        >
        {props.value}
        </button> 
    );
}


class Board extends React.Component {
    render() {
        const { size } = this.props;

        let cols, rows;
        cols = rows = Math.sqrt(size);

        let board = []
        for (var i = 0; i < cols; i++) {
            let row = []
            for (var j = 0; j < rows; j++) {
                row.push(this.renderSquare(i * cols + j))
            }
            board.push(<div className="board-row" key={i}>{row}</div>)
        }

        return (
            <div className="board">{board}</div>
        );
    }

    handleClick(i, e) {
        e.preventDefault();
        if (e.type === 'click') {
            this.props.onClick(i);
        } else if (e.type === 'contextmenu') {
            this.props.addFlag(i);
        }
    }

    renderSquare(i) {
        return (
            <Square 
                onClick={(event) => this.handleClick(i, event) }
                value={this.renderValue(i)}
                key={i}
            />
        );
    }

    renderValue(i) {
        if (this.props.history.includes(i)) {
            return this.props.squares[i];
        }
        if (this.props.flags.includes(i)) {
            return FLAG;
        }
    }
}

class Game extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            squares: [],
            history: [],
            flags: [],
            status: null,
            size: 25,
        };
    }

    // @TODO: for debug purposes only
    printDebug(squares) {
        let delimiter = Math.sqrt(squares.length);
        let s = '';
        for(var h = 0; h < squares.length; h++) {
            if (h !== 0 && h % delimiter === 0) {
                s += "\n";
            }
            s += squares[h];
        }
        console.log(s);
    }

    handleClick(i) {
        let { squares, size } = this.state;
        if (squares.length === ZERO) {
            let complexity = size % 10;
            squares = this.initSquares(i, size, complexity);
            this.printDebug(squares);
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

    initSquares(excluded, size, complexity=5) {
        let squares = Array(size).fill(null);
        let counter = 0;
        while(counter < complexity) {
            let index = Math.floor(Math.random() * size);
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

                    if (squares[index - delimiter] === BOMB) {  // up
                        counter++;
                    } 
                    if (squares[index + delimiter] === BOMB) {  // down
                        counter++;
                    } 
                    
                    // check left for edge cases 
                    if (index % delimiter !== 0) {
                        if (squares[index - 1] === BOMB) {  // left
                            counter++;
                        }
                        if (squares[index - (delimiter + 1)] === BOMB) {  // up + left
                            counter++;
                        }
                        if (squares[index + (delimiter - 1)] === BOMB) {  // up + left
                            counter++;
                        }
                    }

                    // check right for edge cases
                    if ((index + 1) % delimiter !== 0) {
                        if (squares[index + 1] === BOMB) {  // right
                            counter++;
                        }
                        if (squares[index - (delimiter - 1)] === BOMB) {  // up + right
                            counter++;
                        }
                        if (squares[index + (delimiter + 1)] === BOMB) {  // up + right
                            counter++;
                        }
                    }

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
            flags: [],
            status: null,
        });
    }

    changeSize(size) {
        this.setState({
            size: size,
        });
        this.restartGame();
    }

    handleAddFlag(i) {
        let { flags } = this.state;
        if (!flags.includes(i)) {
            this.setState({
                flags: flags.concat(i)
            });
        } else {
            this.setState({
                flags: flags.filter((val, index, arr) => val !== i)
            })
        }
    }

    render() {
        let gameStatus = STATUSES[this.state.status];

        return (
            <div>
                <h1 className='status'>{gameStatus}</h1>
                <Board 
                    squares={this.state.squares}
                    history={this.state.history}
                    flags={this.state.flags}
                    onClick={i => this.handleClick(i)}
                    size={this.state.size}
                    addFlag={i => this.handleAddFlag(i)}
                />
                <div>
                    <button onClick={() => this.changeSize(25)}>25</button>
                    <button onClick={() => this.changeSize(36)}>36</button>
                    <button onClick={() => this.changeSize(49)}>49</button>
                </div>
                <button className="btn" onClick={() => this.restartGame()}>Restart</button>
            </div>
        );
    }
}


ReactDOM.render(<Game />, document.getElementById('root'));