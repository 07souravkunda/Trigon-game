import Matter from 'matter-js';

const Physics = (entities, {touches, time, screen}) => {
  let engine = entities.physics.engine;
  let world = entities.physics.world;
  // console.log(touches.length);
  // if (touches.length > 0) {
  //   console.log(touches);
  // }
  Object.values(entities).forEach((e) => {
    if (e.body && e.body.position.y > screen.height && !e.body.isRemoved) {
      // console.log('removed2');
      e.body.isRemoved = true;
      Matter.World.remove(world, e.body);
    }
  });
  Object.keys(entities).forEach((e) => {
    if (entities[e].body && entities[e].body.isRemoved) {
      // console.log('deleted');
      delete entities[e];
    }
  });
  Matter.Engine.update(engine, time.delta);
  // console.log(Object.values(entities).length, 'entities');
  return entities;
};

export default Physics;
