import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

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

const BOMB = 'X';


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
                // value={this.props.history[i]}
                value={this.props.squares[i]}
            />
        );
    }


}
class Game extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            squares: this.initSquares(),
            history: [],
        };
    }

    handleClick(i) {
        const square = this.state.squares[i];
        const history = this.state.history.slice();
        if (square === BOMB) {
            console.log('Game over');
        }

        this.setState({
            squares: this.state.squares.slice(),
            history: history.concat(i)
        });

        console.log(this.state)
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

                    if (squares[index - delimiter] === 'X') {
                        counter++;
                    } 
                    if (squares[index + delimiter] === 'X') {
                        counter++;
                    } 
                    if ((index + 1) % delimiter !== 0 && squares[index + 1] === 'X') {
                        counter++;
                    }
                    if (index % delimiter !== 0 && squares[index - 1] === 'X') {
                        counter++;
                    }  
                    squares[index] = counter;
                }
            }
        }

        return squares;
    }


    render() {
        return (
            <Board 
                squares={this.state.squares}
                history={this.state.history}
                onClick={i => this.handleClick(i)}
            />
        );
    }

}


ReactDOM.render(<Game />, document.getElementById('root'));