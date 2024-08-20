function GameEntities({ entities }) {
  /* ===== GAME ENTITIES COMPONENT ===== */
  return (
    <div>
      <span>Monkeys: { entities.monkey.join(",") }</span>
    </div>
  );
};

/* ===== EXPORTS ===== */
export default GameEntities;