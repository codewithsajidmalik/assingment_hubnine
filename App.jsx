import React, { useState } from "react";
import { ResizableBox } from "react-resizable";
import { useDrag, useDrop, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import "./App.css";

const Card = ({ id, text, position, onMove, onResize }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "CARD",
    item: { id, left: position.x, top: position.y },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const handleResize = (event, { size }) => {
    onResize(id, size);
  };

  return (
    <ResizableBox
      width={position.width}
      height={position.height}
      onResize={handleResize}
      resizeHandles={["se"]}
    >
      <div
        ref={drag}
        className="card"
        style={{
          left: position.x,
          top: position.y,
          opacity: isDragging ? 0.5 : 1,
          position: "absolute",
        }}
      >
        <div className="card-content">
          {text.length > 50 ? `${text.substring(0, 50)}...` : text}
          {text.length > 50 && <button className="show-more">Show more</button>}
        </div>
      </div>
    </ResizableBox>
  );
};

const Canvas = () => {
  const [cards, setCards] = useState([]);

  const moveCard = (id, left, top) => {
    setCards((prevCards) =>
      prevCards.map((card) =>
        card.id === id ? { ...card, position: { ...card.position, x: left, y: top } } : card
      )
    );
  };

  const resizeCard = (id, size) => {
    setCards((prevCards) =>
      prevCards.map((card) =>
        card.id === id
          ? { ...card, position: { ...card.position, width: size.width, height: size.height } }
          : card
      )
    );
  };

  const [, drop] = useDrop(() => ({
    accept: "CARD",
    drop: (item, monitor) => {
      const delta = monitor.getDifferenceFromInitialOffset();
      const left = Math.round(item.left + delta.x);
      const top = Math.round(item.top + delta.y);
      moveCard(item.id, left, top);
    },
  }));

  const addCard = () => {
    const id = `card-${cards.length + 1}`;
    const newCard = {
      id,
      text: "This is a sample text for card " + id,
      position: { x: 100, y: 100, width: 200, height: 100 },
    };
    setCards([...cards, newCard]);
  };

  return (
    <div className="canvas" ref={drop}>
      {cards.map((card) => (
        <Card
          key={card.id}
          id={card.id}
          text={card.text}
          position={card.position}
          onMove={moveCard}
          onResize={resizeCard}
        />
      ))}
      <button className="add-card" onClick={addCard}>
        Add Card
      </button>
    </div>
  );
};

function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="App">
        <h1>Drag and Drop Canvas</h1>
        <Canvas />
      </div>
    </DndProvider>
  );
}

export default App;
