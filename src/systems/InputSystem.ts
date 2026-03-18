import Phaser from 'phaser';

export interface InputState {
  left: boolean;
  right: boolean;
  moveX: number;
  jumpPressed: boolean;
  attackPressed: boolean;
  specialPressed: boolean;
}

export class InputSystem {
  private jump = false;
  private attack = false;
  private special = false;
  private joystickX = 0;
  private joystickPointerId?: number;
  private joystickHome?: Phaser.Math.Vector2;
  private joystickKnob?: Phaser.GameObjects.Arc;
  private joystickRadius = 0;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys: Record<string, Phaser.Input.Keyboard.Key>;

  constructor(private scene: Phaser.Scene) {
    this.cursors = this.scene.input.keyboard?.createCursorKeys() as Phaser.Types.Input.Keyboard.CursorKeys;
    this.keys = this.scene.input.keyboard?.addKeys('A,D,W,SPACE,SHIFT') as Record<
      string,
      Phaser.Input.Keyboard.Key
    >;

    this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (pointer.id === this.joystickPointerId) {
        this.updateJoystick(pointer.worldX, pointer.worldY);
      }
    });

    this.scene.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (pointer.id === this.joystickPointerId) {
        this.releaseJoystick();
      }
    });
  }

  bindJoystick(zone: Phaser.GameObjects.Zone, knob: Phaser.GameObjects.Arc, centerX: number, centerY: number, radius: number): void {
    this.joystickKnob = knob;
    this.joystickHome = new Phaser.Math.Vector2(centerX, centerY);
    this.joystickRadius = radius;
    zone.setInteractive();
    zone.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.joystickPointerId = pointer.id;
      this.updateJoystick(pointer.worldX, pointer.worldY);
    });
  }

  bindActionButton(
    target: Phaser.GameObjects.Zone,
    key: 'jumpPressed' | 'attackPressed' | 'specialPressed',
    hold = false,
    handlers?: { onPress?: () => void; onRelease?: () => void }
  ): void {
    target.setInteractive();
    target.on('pointerdown', () => {
      this.setKey(key, true);
      handlers?.onPress?.();
    });
    target.on('pointerup', () => {
      this.setKey(key, false);
      handlers?.onRelease?.();
    });
    target.on('pointerout', () => {
      this.setKey(key, false);
      handlers?.onRelease?.();
    });
    if (hold) {
      target.on('pointermove', () => handlers?.onPress?.());
    }
  }

  private updateJoystick(pointerX: number, pointerY: number): void {
    if (!this.joystickKnob || !this.joystickHome) {
      return;
    }

    const dx = pointerX - this.joystickHome.x;
    const dy = pointerY - this.joystickHome.y;
    const length = Math.min(this.joystickRadius, Math.hypot(dx, dy));
    const angle = Math.atan2(dy, dx);
    const nextX = Math.cos(angle) * length;
    const nextY = Math.sin(angle) * length;
    this.joystickX = Phaser.Math.Clamp(nextX / this.joystickRadius, -1, 1);
    this.joystickKnob.setPosition(this.joystickHome.x + nextX, this.joystickHome.y + nextY);
  }

  private releaseJoystick(): void {
    this.joystickPointerId = undefined;
    this.joystickX = 0;
    if (!this.joystickKnob || !this.joystickHome) {
      return;
    }
    this.scene.tweens.add({
      targets: this.joystickKnob,
      x: this.joystickHome.x,
      y: this.joystickHome.y,
      duration: 120,
      ease: 'Quad.easeOut'
    });
  }

  private setKey(key: 'jumpPressed' | 'attackPressed' | 'specialPressed', value: boolean): void {
    if (key === 'jumpPressed') this.jump = value;
    if (key === 'attackPressed') this.attack = value;
    if (key === 'specialPressed') this.special = value;
  }

  consumeFrame(): InputState {
    const keyboardMove = (this.cursors.left.isDown || this.keys.A.isDown ? -1 : 0) + (this.cursors.right.isDown || this.keys.D.isDown ? 1 : 0);
    const moveX = keyboardMove !== 0 ? Phaser.Math.Clamp(keyboardMove, -1, 1) : this.joystickX;
    const jumpPressed =
      this.jump ||
      Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
      Phaser.Input.Keyboard.JustDown(this.keys.W);
    const attackPressed = this.attack || Phaser.Input.Keyboard.JustDown(this.keys.SPACE);
    const specialPressed = this.special || Phaser.Input.Keyboard.JustDown(this.keys.SHIFT);
    const state: InputState = {
      left: moveX < -0.2,
      right: moveX > 0.2,
      moveX,
      jumpPressed,
      attackPressed,
      specialPressed
    };
    this.jump = false;
    this.attack = false;
    this.special = false;
    return state;
  }
}
