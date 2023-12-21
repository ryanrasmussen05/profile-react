import { useEffect, useState } from 'react';
import styles from './MontyHallPage.module.css';
import { Button, Popover } from "antd";
import classNames from 'classnames';
import { ArrowLeftOutlined, QuestionOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const doors = [1, 2, 3];
const numberOfTests = 100;

const content = (
  <div>
    <p>The Monty Hall Paradox is a classic probability puzzle. You are presented with three doors. Behind one of the doors is a prize, and behind the other two are goats. You choose a door, and then the host opens one of the other doors to reveal a goat. You are then given the option to stick with your original choice, or switch to the other unopened door. What should you do?</p>
    <p>Common sense might tell you that it's a 50/50 choice whether you stick with your original choice or not. However, you mathematically DOUBLE your chances of winning if you switch your choice.</p>
    <p>Run a test to randomly play 100 games. If the theory holds true, you should win 2x as often when "switching" instead of "sticking".</p>
  </div>
);

interface GameSettings {
  gameState: string;
  winningDoor: number;
  selectedDoor: number;
  openDoors: number[];
  finishText: string;
  numberOfWins: number;
  numberOfLosses: number;
  testOutputs: string[];
  isRunningTest: boolean;
  testNumber: number;
  testType?: string;
}

function MontyHallPage() {
  const navigate = useNavigate();
  const [gameSettings, setGameSettings] = useState<GameSettings>({
    gameState: 'initial',
    winningDoor: 0,
    selectedDoor: 0,
    openDoors: [],
    finishText: '',
    numberOfLosses: 0,
    numberOfWins: 0,
    testOutputs: [],
    isRunningTest: false,
    testNumber: 0,
  });

  useEffect(() => {
    if (!gameSettings.isRunningTest) return;

    if (gameSettings.gameState === 'openLoser') {
      openRandomLoser();
    }

    if (gameSettings.gameState === 'stickOrSwitch') {
      switchDoor(gameSettings.testType === 'switch');
    }

    if (gameSettings.gameState === 'reveal') {
      finishGame();
    }

    if (gameSettings.gameState === 'gameOver') {
      const isWin = gameSettings.selectedDoor === gameSettings.winningDoor;
      setGameSettings(previousGameSettings => ({
        ...previousGameSettings,
        numberOfWins: isWin ? previousGameSettings.numberOfWins + 1 : previousGameSettings.numberOfWins,
        numberOfLosses: isWin ? previousGameSettings.numberOfLosses : previousGameSettings.numberOfLosses + 1,
        testOutputs: isWin ? [...previousGameSettings.testOutputs, 'win'] : [...previousGameSettings.testOutputs, 'lose'],
      }));
      runTest(gameSettings.testType === 'switch', gameSettings.testNumber + 1)
    }
  // eslint-disable-next-line
  }, [gameSettings])

  const initializeTests = (switchDoor: boolean) => {
    if (gameSettings.isRunningTest) return;
    setGameSettings(previousGameSettings => ({
      ...previousGameSettings,
      testOutputs: [],
      numberOfLosses: 0,
      numberOfWins: 0,
    }));
    runTest(switchDoor, 1);
  };

  const reset = () => {
    if (gameSettings.isRunningTest) return;
    setGameSettings({
      winningDoor: Math.floor(Math.random() * 3) + 1,
      openDoors: [],
      selectedDoor: 7,
      finishText: '',
      testOutputs: [],
      numberOfLosses: 0,
      numberOfWins: 0,
      isRunningTest: false,
      testNumber: 0,
      gameState: 'initial',
    });
  };

  const getCssClassesForDoor = (doorNumber: number) => {
    const isSelected = gameSettings.selectedDoor === doorNumber;
    const isOpen = gameSettings.openDoors.some(x => x === doorNumber);
    const isWinningDoor = gameSettings.winningDoor === doorNumber;

    let classes = [styles.door];
    if (isSelected) classes.push(styles.selected);
    if (isOpen) classes.push(styles.open);
    if (isWinningDoor) classes.push(styles.winner);
    if (!isWinningDoor) classes.push(styles.loser);

    return classes;
  };

  const handleDoorClick = (doorNumber: number) => {
    if (gameSettings.gameState !== 'initial') return;
    reset();
    setGameSettings(previousGameSettings => ({
      ...previousGameSettings,
      selectedDoor: doorNumber,
      gameState: 'openLoser',
    }));
  };

  const openRandomLoser = () => {
    const losingDoors = doors.filter(x => x !== gameSettings.winningDoor && x !== gameSettings.selectedDoor);
    const randomRatio = Math.random();
    const doorToOpen = randomRatio < 0.5 || losingDoors.length === 1 ? losingDoors[0] : losingDoors[1];
    setGameSettings(previousGameSettings => ({
      ...previousGameSettings,
      gameState: 'stickOrSwitch',
      openDoors: [doorToOpen],
    }));
  };

  const switchDoor = (switchDoor: boolean) => {
    setGameSettings(previousGameSettings => ({
      ...previousGameSettings,
      selectedDoor: switchDoor ? getOtherAvailableDoor() : gameSettings.selectedDoor,
      gameState: 'reveal',
    }));
  };

  const getOtherAvailableDoor = () => {
    return doors.find(x => x !== gameSettings.selectedDoor && !gameSettings.openDoors.includes(x)) as number;
  };

  const finishGame = () => {
    const isWin = gameSettings.selectedDoor === gameSettings.winningDoor;
    const finishText = isWin ? 'You Win!' : 'You Lost';
    setGameSettings(previousGameSettings => ({
      ...previousGameSettings,
      openDoors: [...doors],
      finishText,
      gameState: 'gameOver',
    }));
  };

  const runTest = async (shouldSwitchDoor: boolean, testNumber: number) => {
    if (testNumber > numberOfTests) {
      setGameSettings(previousGameSettings => ({
        ...previousGameSettings,
        isRunningTest: false,
        gameState: 'testCompleted',
      }));
      return;
    }

    setGameSettings(previousGameSettings => ({
      ...previousGameSettings,
      isRunningTest: true,
      testNumber,
      testType: shouldSwitchDoor ? 'switch' : 'stick',
      selectedDoor: Math.floor(Math.random() * 3) + 1,
      winningDoor: Math.floor(Math.random() * 3) + 1,
      openDoors: [],
      gameState: 'openLoser',
    }));
  }

  return (
    <div className={styles.page}>
      <div className={styles.buttons}>
        <Button shape="circle" icon={<ArrowLeftOutlined />} onClick={() => navigate('/home')}/>
        <Button htmlType="button" type="primary" onClick={() => initializeTests(false)}>Run 'Stick' Test</Button>
        <Button htmlType="button" type="primary" onClick={() => initializeTests(true)}>Run 'Switch' Test</Button>
        <Button htmlType="button" onClick={reset}>Reset</Button>
      </div>

      <div className={styles.title}>
        <span>Monty Hall Paradox</span>
        <Popover content={content} title="The Monty Hall Paradox" trigger="click" overlayClassName={styles.tooltip}>
          <Button shape="circle" icon={<QuestionOutlined />} />
        </Popover>
      </div>

      <div className={styles.doors}>
        {doors.map((doorNumber: number) => (
          <div
            key={doorNumber}
            className={classNames(...getCssClassesForDoor(doorNumber))}
            onClick={() => handleDoorClick(doorNumber)}
          >
            <div className={styles.doorCover}>{doorNumber}</div>
          </div>
        ))}
      </div>

      {gameSettings.gameState === 'initial' &&
        <div className={styles.action}>Choose a door</div>
      }

      {gameSettings.gameState === 'openLoser' &&
        <div className={styles.action}>
          <Button htmlType="button" type="primary" onClick={openRandomLoser}>Open A Losing Door</Button>
        </div>
      }

      {gameSettings.gameState === 'stickOrSwitch' &&
        <div className={styles.action}>
          <Button htmlType="button" type="primary" onClick={() => switchDoor(false)}>
            {'Stick With Door ' + gameSettings.selectedDoor}
          </Button>
          <Button htmlType="button" type="primary" onClick={() => switchDoor(true)}>
            {'Switch To Door ' + getOtherAvailableDoor()}
          </Button>
        </div>
      }

      {gameSettings.gameState === 'reveal' &&
        <div className={styles.action}>
          <Button htmlType="button" type="primary" onClick={finishGame}>Reveal</Button>
        </div>
      }

      {gameSettings.gameState === 'gameOver' &&
        <div className={styles.action}>{gameSettings.finishText}</div>
      }

      {gameSettings.gameState === 'testCompleted' &&
        <div className={styles.action}>{'Won: ' + gameSettings.numberOfWins + '      Lost: ' + gameSettings.numberOfLosses}</div>
      }

      <div className={styles.results}>
        {gameSettings.testOutputs.map((output: string, index: number) => (
          <span key={index} className={classNames(styles.testOutput, output === 'win' ? styles.win : styles.loss)}>
            {output === 'win' ? 'WIN' : 'LOSE'}
          </span>
        ))}
      </div>
    </div>
  );
}

export default MontyHallPage;