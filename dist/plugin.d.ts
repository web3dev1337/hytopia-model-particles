import { Plugin } from 'hytopia';
import { World } from 'hytopia';
export declare class HytopiaParticlesPlugin implements Plugin {
    name: string;
    version: string;
    private emitter;
    onLoad(world: World): Promise<void>;
    onUnload(): Promise<void>;
    update(deltaTime: number): void;
}
