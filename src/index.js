import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

const BOMB = 'X';
const ZERO = 0;
const FLAG = '?';
const GAME_OVER = "GAME_OVER";
const GAME_WON = "GAME_WON";
const DEFAULT_COMPLEXITY = 3;
const DEFAULT_BOARD_SIZE = Math.pow(7, 2);

const STATUSES = {
    GAME_OVER: 'Game over!',
    GAME_WON: "You win!",
    null: 'Good luck!',
}

function Square(props) {
    let buttonClasses = "square";
    if (props.failSquare) {
        buttonClasses += " fail";
    }

    return (
        <button 
            className={buttonClasses}
            onClick={props.onClick}
            onContextMenu={props.onClick}
        >
        {props.value}
        </button> 
    );
}

class Slider extends React.Component {
    handleInput = event => {
        const { value } = event.target;
        this.setState({value});
        this.props.handleSlider(value);
    }

    render() {
        const { value, min, max, step, publicValue } = this.props;

        return (
            <div className="slidecontainer">
                <input 
                    type="range"
                    className="slider"
                    min={min} 
                    max={max}
                    step={step}
                    value={value} 
                    onChange={this.handleInput}
                />
                <span>{ publicValue }</span>
            </div>
        )
    }
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
                failSquare={this.props.failSquare === i}
            />
        );
    }

    renderValue(i) {
        if (this.props.status === GAME_OVER) {
            return this.props.squares[i];
        }
        if (this.props.history.includes(i)) {
            return this.props.squares[i];
        }
        if (this.props.flags.includes(i)) {
            return FLAG;
        }
        return <span className="index">{i}</span>;
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
            size: DEFAULT_BOARD_SIZE,
            failSquare: null,
            complexity: DEFAULT_COMPLEXITY
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
        if (!squares.length) {
            let complexity = size * (this.state.complexity / 100);
            if (size - complexity < 1) {
                this.setState({complexity: DEFAULT_COMPLEXITY});
                return;
            }
            squares = this.initSquares(i, size, complexity);
            this.printDebug(squares);
        }

        let { status, failSquare } = this.state;

        if (status === GAME_OVER || status === GAME_WON) {
            return;
        }

        let history = this.state.history.slice();

        if (history.includes(i)) {
            return;
        } else {
            history = history.concat(i);
        }

        const square = squares[i];
        if (square === ZERO) {
            const closesZeroes = this.openClosestZeroSquares(i, squares, history);
            console.log(closesZeroes);
            history = history.concat(closesZeroes);
        } else if (square === BOMB) {
            status = GAME_OVER;
            history = squares;
            failSquare = i;
        } else if (this.isGameWon(squares, history)) {
            status = GAME_WON;
        }

        this.setState({
            squares: squares,
            history: history,
            status: status,
            failSquare: failSquare
        });
    }

    openClosestZeroSquares(i, squares, history) {

        let delimiter = Math.sqrt(squares.length);

        var isIndexValid = function(index, squares) {
            return index !== undefined &&
                index >= 0 && 
                index < squares.length &&
                squares[index] !== BOMB;
        }

        var checkLeft = function(index, zeroes) {
            if (zeroes.has(index)) {
                return zeroes;
            }

            if (isIndexValid(index, squares)) {
                zeroes.add(index);
            }

            zeroes = checkTop(index - delimiter, zeroes);
            zeroes = checkBottom(index + delimiter, zeroes);

            if (index % delimiter === 0) { // left edge
                return zeroes;
            }
            
            return checkLeft(index - 1, zeroes);
        }

        var checkRight = function(index, zeroes) {
            if (zeroes.has(index)) {
                return zeroes;
            }

            if (isIndexValid(index, squares)) {
                zeroes.add(index);
            }
            
            zeroes = checkBottom(index + delimiter, zeroes);
            zeroes = checkTop(index - delimiter, zeroes);

            if ((index + 1) % delimiter === 0) { // right edge
                return zeroes;
            }

            return checkRight(index + 1, zeroes);
        }

        var checkTop = function(index, zeroes) {
            if (zeroes.has(index)) {
                return zeroes;
            }

            if (isIndexValid(index, squares)) {
                zeroes.add(index);
            }

            if (index - delimiter < 0) {
                return zeroes;
            }
           
            zeroes = checkRight(index + 1, zeroes);
            zeroes = checkLeft(index - 1, zeroes);

            return checkTop(index - delimiter, zeroes);
        }

        var checkBottom = function(index, zeroes) {
            if (zeroes.has(index)) {
                return zeroes;
            }

            if (isIndexValid(index, squares)) {
                zeroes.add(index);
            }

            if (index + delimiter > squares.length) {
                return zeroes;
            }

            zeroes = checkRight(index + 1, zeroes);
            zeroes = checkLeft(index - 1, zeroes);

            return checkBottom(index + delimiter, zeroes);
        }

        history.splice(history.indexOf(i), 1)
        var zeroes = new Set(history);

        zeroes = checkLeft(i, zeroes);

        return Array.from(zeroes);
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
            failSquare: null,
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

        const { status, squares, history, flags, size, complexity, failSquare} = this.state;
        const gameStatus = STATUSES[status];

        return (
            <div>
                <h1 className='status'>{gameStatus}</h1>
                <Board 
                    squares={squares}
                    history={history}
                    flags={flags}
                    failSquare={failSquare}
                    status={status}
                    onClick={i => this.handleClick(i)}
                    size={size}
                    addFlag={i => this.handleAddFlag(i)}
                />
                <button 
                    className="btn" 
                    onClick={() => this.restartGame()}>Restart
                </button>

                <p>Choose complexity:</p>
                <Slider
                    value={complexity}
                    publicValue={complexity}
                    min={1}
                    max={99}
                    handleSlider={(i) => this.setState({complexity: i})}
                />

                <p>Choose board size:</p>
                <Slider
                    value={Math.sqrt(size)}
                    min={2}
                    max={25}
                    step={1}
                    handleSlider={(val) => this.changeSize(val * val)}
                    publicValue={size}
                />
                
            </div>
        );
    }
}


ReactDOM.render(<Game />, document.getElementById('root'));