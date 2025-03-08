import {
  startServer,
  Entity,
  PlayerEntity,
  PlayerEvent,
  Quaternion,
} from 'hytopia';

import worldMap from './assets/map.json';

startServer(world => {
  world.loadMap(worldMap);

  // Spawn a player entity when a player joins the game.
  world.on(PlayerEvent.JOINED_WORLD, ({ player }) => {
    const playerEntity = new PlayerEntity({
      player,
      name: 'Player',
      modelUri: 'models/players/player.gltf',
      modelLoopedAnimations: [ 'idle' ],
      modelScale: 0.5,
    });
  
    playerEntity.spawn(world, { x: 0, y: 10, z: 0 });

    // Spawn a sword entity as a child of the player entity.
    const swordChildEntity = new Entity({
      name: 'sword',
      modelUri: 'models/items/sword.gltf',
      parent: playerEntity,
      parentNodeName: 'hand_right_anchor',
    });
    
    swordChildEntity.spawn(
      world,
      { x: 0, y: 0.3, z: 0.5 }, // spawn with a position relative to the parent node
      Quaternion.fromEuler(-90, 0, 90), // spawn with a rotation so it looks correct in the hand
    );
  });

  world.on(PlayerEvent.LEFT_WORLD, ({ player }) => {
    world.entityManager.getPlayerEntitiesByPlayer(player).forEach(entity => entity.despawn());
  });
});