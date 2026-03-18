import './style.css';
import { createGame } from './game/config';

const mount = document.getElementById('app');

if (!mount) {
  throw new Error('App mount not found');
}

createGame(mount);
