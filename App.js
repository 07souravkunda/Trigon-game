import React, {useState, useEffect, useRef} from 'react';
import {StyleSheet, View, Text, TouchableOpacity} from 'react-native';
import {GameEngine, DefaultTouchProcessor} from 'react-native-game-engine';
import Matter from 'matter-js';
import Constants from './costants';
import Trigon from './Trigon';
import Pipe from './Pipe';
import Physics from './Physics';

let id = 0;

export const randomBetween = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

export const generatePipes = () => {
  const color = ['red', 'blue', 'green'];
  const ind = randomBetween(0, 2);
  // console.log(ind);
  return color[ind];
};

const App = () => {
  const gameEngine = useRef();
  const [entities, setEntities] = useState();
  const eng = useRef();
  const t = useRef(Date.now());
  const ind = useRef(0);
  const [running, setRunning] = useState(true);
  const score = useRef(0);

  const setupWorld = () => {
    let engine = Matter.Engine.create({enableSleeping: false});
    eng.current = engine;
    let world = engine.world;
    world.gravity.y = 0.1;
    let trigon = Matter.Bodies.rectangle(
      Constants.width / 2,
      Constants.height - 200,
      50,
      50,
      {isStatic: true, label: 'trigon'},
    );
    let col = generatePipes();
    let pipe = Matter.Bodies.rectangle(
      Constants.width / 2,
      randomBetween(-100, -200),
      Constants.width,
      40,
      {render: {fillStyle: col}},
    );
    Matter.Events.on(engine, 'collisionActive', (e) => {
      console.log('yo');
      const pairs = e.pairs;

      pairs.forEach(({bodyA, bodyB}) => {
        if (bodyA.label !== 'trigon' && bodyB.label === 'trigon') {
          if (bodyA.render.fillStyle === Constants.colorArr[ind.current]) {
            Matter.Body.scale(bodyA, 0.1, 0.1, {
              x: bodyB.bounds.min.x - 1000,
              y: Constants.height + 1000,
            });
            Matter.World.remove(world, bodyA);
            score.current = score.current + 10;
          } else {
            console.log('hi');
            gameEngine.current.dispatch({type: 'game-over'});
          }
        } else if (bodyB.label !== 'trigon' && bodyA.label === 'trigon') {
          if (bodyB.render.fillStyle === Constants.colorArr[ind.current]) {
            Matter.Body.scale(bodyB, 0.1, 0.1, {
              x: bodyB.bounds.min.x - 1000,
              y: Constants.height + 1000,
            });
            Matter.World.remove(world, bodyB);
            score.current = score.current + 10;
          } else {
            console.log('hello');
            gameEngine.current.dispatch({type: 'game-over'});
          }
        }
      });
    });
    Matter.World.add(world, [trigon, pipe]);
    Matter.Events.on(world, 'afterAdd', (e) => {
      // console.log('added');
    });
    return {
      physics: {engine: engine, world: world},
      trigon: {body: trigon, size: [50, 50], renderer: Trigon, color: 'red'},
      id: {
        body: pipe,
        size: [Constants.width, 40],
        renderer: Pipe,
        color: col,
      },
    };
  };
  const ChangeColor = (entities, {touches, time}) => {
    let trigon = entities.trigon;
    touches
      .filter((t) => t.type === 'press')
      .forEach((t) => {
        // console.log('hi');
        ind.current = (ind.current + 1) % 3;
        trigon.color = Constants.colorArr[ind.current];
        // console.log(trigon.body);
      });
    // Matter.Engine.update(engine, time.delta);
    return entities;
  };
  const AddBodies = (entities, {time}) => {
    let world = entities.physics.world;
    // console.log(time);
    if (time.current - t.current > 1500 && running) {
      t.current = time.current;
      // console.log('yo');
      let col = generatePipes();
      let pipe = Matter.Bodies.rectangle(
        Constants.width / 2,
        randomBetween(-100, -200),
        Constants.width,
        40,
        {render: {fillStyle: col}},
      );

      Matter.World.add(world, [pipe]);
      id++;
      entities[id] = {
        body: pipe,
        size: [Constants.width, 40],
        renderer: Pipe,
        color: col,
      };
    }
    return entities;
  };
  useEffect(() => {
    const entities = setupWorld();
    setEntities(entities);
  }, []);
  const reset = () => {
    console.log('hh');
    // Matter.Events.off(eng.current);
    // let entities = setupWorld();
    id = 0;
    ind.current = 0;
    t.current = Date.now();
    Matter.World.clear(eng.current.world);
    gameEngine.current.swap(setupWorld());
    score.current = 0;
    // setEntities(entities);
    setRunning(true);
  };
  if (!entities) return null;
  return (
    <GameEngine
      running={running}
      style={styles.container}
      ref={(ref) => (gameEngine.current = ref)}
      systems={[Physics, AddBodies, ChangeColor]}
      entities={entities}
      onEvent={(e) => {
        if (e.type === 'game-over') {
          console.log('game-over');
          setRunning(false);
        }
      }}>
      {!running && (
        <TouchableOpacity style={styles.fullScreenButton} onPress={reset}>
          <View style={styles.fullScreen}>
            <Text style={styles.gameOverText}>
              You scored : {score.current}
            </Text>
            <Text style={styles.gameOverText}>Game Over</Text>
            <Text style={styles.gameOverText}>Tap to play again</Text>
          </View>
        </TouchableOpacity>
      )}
    </GameEngine>
  );
};
export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  gameContainer: {
    flex: 1,
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  gameOverText: {
    color: 'black',
    fontSize: 48,
  },
  fullScreen: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    opacity: 0.8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenButton: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    flex: 1,
  },
});
