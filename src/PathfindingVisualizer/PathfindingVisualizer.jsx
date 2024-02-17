import React, {Component} from 'react';
import Node from './Node/Node';
import {dijkstra, getNodesInShortestPathOrder} from '../Algorithms/dijkstra';

import './PathfindingVisualizer.css';

let START_NODE_ROW = Math.floor((window.innerHeight / 26 - 3) * .50);
let START_NODE_COL = Math.floor((window.innerWidth / 26 - 3) * .35);
let FINISH_NODE_ROW = Math.floor((window.innerHeight / 26 - 3) * .50);
let FINISH_NODE_COL = Math.floor((window.innerWidth / 26 - 3) * .65);
let wall = false;
let start = false;
let end = false;

export default class PathfindingVisualizer extends Component {
  constructor() {
    super();
    this.state = {
      grid: [],
      mouseIsPressed: false,
    };
  }

  componentDidMount() {
    const grid = getInitialGrid();
    this.setState({grid});
  }

  handleMouseDown(row, col) {
    if (wall) {
      const newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
      this.setState({grid: newGrid, mouseIsPressed: true});
    }
    else if(start) {
      // Make new grid that is start
      const replaceOld = getNewGridAsStartNode(this.state.grid, START_NODE_ROW, START_NODE_COL);
      this.setState({grid: replaceOld, mouseIsPressed: true});
      const newGrid = getNewGridAsStartNode(this.state.grid, row, col);
      // Update our start node row col for algo
      START_NODE_ROW = row;
      START_NODE_COL = col;
      this.setState({grid: newGrid, mouseIsPressed: true});
    }
    // Same as start
    else if(end) {
      const replaceOld = getNewGridAsEndNode(this.state.grid, FINISH_NODE_ROW, FINISH_NODE_COL);
      this.setState({grid: replaceOld, mouseIsPressed: true});
      const newGrid = getNewGridAsEndNode(this.state.grid, row, col);
      FINISH_NODE_ROW = row;
      FINISH_NODE_COL = col;
      this.setState({grid: newGrid, mouseIsPressed: true});
    }
  }

  handleMouseEnter(row, col) {
    if (!this.state.mouseIsPressed) return;
    if (wall) {
      const newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
      this.setState({grid: newGrid});
    }
  }

  handleMouseUp() {
    this.setState({mouseIsPressed: false});
  }

  animateDijkstra(visitedNodesInOrder, nodesInShortestPathOrder) {
    for (let i = 0; i <= visitedNodesInOrder.length; i++) {
      if (i === visitedNodesInOrder.length) {
        setTimeout(() => {
          this.animateShortestPath(nodesInShortestPathOrder);
        }, 10 * i);
        return;
      }
      setTimeout(() => {
        const node = visitedNodesInOrder[i];
        document.getElementById(`node-${node.row}-${node.col}`).className =
          'node node-visited';
      }, 10 * i);
    }
  }

  animateShortestPath(nodesInShortestPathOrder) {
    for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
      setTimeout(() => {
        const node = nodesInShortestPathOrder[i];
        document.getElementById(`node-${node.row}-${node.col}`).className =
          'node node-shortest-path';
      }, 50 * i);
    }
  }

  visualizeDijkstra() {
    const {grid} = this.state;
    const startNode = grid[START_NODE_ROW][START_NODE_COL];
    const finishNode = grid[FINISH_NODE_ROW][FINISH_NODE_COL];
    const visitedNodesInOrder = dijkstra(grid, startNode, finishNode);
    const nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode);
    this.animateDijkstra(visitedNodesInOrder, nodesInShortestPathOrder);
  }

  toggleWall(){
    wall = !wall;
  }
  
  toggleStart(){
    start = !start;
  }

  toggleEnd(){
    end = !end;
  }

  reset() {
    window.location.reload();
  }

  render() {
    const {grid, mouseIsPressed} = this.state;

    return (
      <>
        <div class = "nav">
            <h1>
                Dijkstra's Algorithm Visualizer
            </h1>
            <button onClick={() => this.visualizeDijkstra()}>
            Visualize Algorithm
            </button>
            <button onClick={() => this.reset()}>
            Reset
            </button>
            <br/>
            <p class = "desc">
                Click grid spaces to change them based on the slider selected
                <br/>
                Walls can be drawn by holding down click
                <br/>
                Reset after window resize or if grids aren't aligned
            </p>
            <div class = "legend">
                <div class = "color" style = {{backgroundColor: "green"}}/>
                - Start node
                <div class = "color" style = {{backgroundColor: "red"}}/>
                - End node
                <div class = "color" style = {{backgroundColor: "rgba(0, 190, 218, 0.75)"}}/>
                - Explored node
                <div class = "color" style = {{backgroundColor: "rgb(255, 254, 106)"}}/>
                - Shortest Path
                <div class = "color" style = {{backgroundColor: "rgb(12, 53, 71"}}/>
                - Wall
            </div>
            <div class = "switches">
              <label class="switch">
                <input type="checkbox" onChange = {() => this.toggleWall()}/>
                <span class="slider"></span>
              </label>
              <div class = "switchtext">
                Wall
              </div>
              <label class="switch">
                <input type="checkbox" onChange = {() => this.toggleStart()}/>
                <span class="slider"></span>
              </label>
              <div class = "switchtext">
                Start Node
              </div>
              <label class="switch">
                <input type="checkbox" onChange = {() => this.toggleEnd()}/>
                <span class="slider"></span>
              </label>
              <div class = "switchtext">
                End Node
              </div>
            </div>
        </div>
        <div className="grid">
          {grid.map((row, rowIdx) => {
            return (
              <div key={rowIdx}>
                {row.map((node, nodeIdx) => {
                  const {row, col, isFinish, isStart, isWall} = node;
                  return (
                    <Node
                      key={nodeIdx}
                      col={col}
                      isFinish={isFinish}
                      isStart={isStart}
                      isWall={isWall}
                      mouseIsPressed={mouseIsPressed}
                      onMouseDown={(row, col) => this.handleMouseDown(row, col)}
                      onMouseEnter={(row, col) =>
                        this.handleMouseEnter(row, col)
                      }
                      onMouseUp={() => this.handleMouseUp()}
                      row={row}></Node>
                  );
                })}
              </div>
            );
          })}
        </div>
      </>
    );
  }
}

const getInitialGrid = () => {
    const grid = [];
    var rowSize = Math.floor((window.innerHeight - 150) / 26.0);
    var colSize = Math.floor(window.innerWidth / 26.0);
    for (let row = 0; row < rowSize; row++) {
        const currentRow = [];
        for (let col = 0; col < colSize; col++) {
            currentRow.push(createNode(col, row));
        }
        grid.push(currentRow);
    }
  return grid;
};

const createNode = (col, row) => {
  return {
    col,
    row,
    isStart: row === START_NODE_ROW && col === START_NODE_COL,
    isFinish: row === FINISH_NODE_ROW && col === FINISH_NODE_COL,
    distance: Infinity,
    isVisited: false,
    isWall: false,
    previousNode: null,
  };
};

const getNewGridWithWallToggled = (grid, row, col) => {
  const newGrid = grid.slice();
  const node = newGrid[row][col];
  const newNode = {
    ...node,
    isWall: !node.isWall,
  };
  newGrid[row][col] = newNode;
  return newGrid;
};

const getNewGridAsStartNode = (grid, row, col) => {
  // Make copy of grid
  const newGrid = grid.slice();
  // Assign node to the node in the grid we are trying to modify
  const node = newGrid[row][col];
  // Make a new node to replace the node we clicked
  const newNode = {
    ...node,
    isStart: !node.isStart,
  };
  newGrid[row][col] = newNode;
  return newGrid;
}

const getNewGridAsEndNode = (grid, row, col) => {
  const newGrid = grid.slice();
  const node = newGrid[row][col];
  const newNode = {
    ...node,
    isFinish: !node.isFinish,
  };
  newGrid[row][col] = newNode;
  return newGrid;
}