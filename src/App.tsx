import {useState, useMemo, useEffect} from 'react';

import s from './App.module.scss';

const BOMB = -1;
enum Mask {
	Transparent,
	Fill,
	Flag,
	Question,
}

enum BombsNearby {
	Zero,
	One,
	Two,
	Three,
	Four,
	Five,
	Six,
	Seven,
	Eight
}

enum BombsAmount {
	Zero,
	One,
	Two,
	Three,
	Four,
	Five,
	Six,
	Seven,
	Eight,
	Nine
}
const createMapNumbersToView = () => {
	const mapToView: Record<number, React.ReactNode> = {
		[BombsAmount.Zero]: <div className={`${s['app__mineNumber']} ${s['app__mineNumber_zero']}`}></div>,
		[BombsAmount.One]: <div className={`${s['app__mineNumber']} ${s['app__mineNumber_one']}`}></div>,
		[BombsAmount.Two]: <div className={`${s['app__mineNumber']} ${s['app__mineNumber_two']}`}></div>,
		[BombsAmount.Three]: <div className={`${s['app__mineNumber']} ${s['app__mineNumber_three']}`}></div>,
		[BombsAmount.Four]: <div className={`${s['app__mineNumber']} ${s['app__mineNumber_four']}`}></div>,
		[BombsAmount.Five]: <div className={`${s['app__mineNumber']} ${s['app__mineNumber_five']}`}></div>,
		[BombsAmount.Six]: <div className={`${s['app__mineNumber']} ${s['app__mineNumber_six']}`}></div>,
		[BombsAmount.Seven]: <div className={`${s['app__mineNumber']} ${s['app__mineNumber_seven']}`}></div>,
		[BombsAmount.Eight]: <div className={`${s['app__mineNumber']} ${s['app__mineNumber_eight']}`}></div>,
		[BombsAmount.Nine]: <div className={`${s['app__mineNumber']} ${s['app__mineNumber_nine']}`}></div>,
	};
	return mapToView;
};	

const bombsAmountToView = createMapNumbersToView();
const timerToView = createMapNumbersToView();

const bombsNearbyToView: Record<number, React.ReactNode> = {
	[BombsNearby.Zero]: null,
	[BombsNearby.One]: (<div className={`${s['bombsNearby']} ${s['bombsNearby_one']}`}></div>),
	[BombsNearby.Two]: (<div className={`${s['bombsNearby']} ${s['bombsNearby_two']}`}></div>),
	[BombsNearby.Three]: (<div className={`${s['bombsNearby']} ${s['bombsNearby_three']}`}></div>),
	[BombsNearby.Four]: (<div className={`${s['bombsNearby']} ${s['bombsNearby_four']}`}></div>),
	[BombsNearby.Five]: (<div className={`${s['bombsNearby']} ${s['bombsNearby_five']}`}></div>),
	[BombsNearby.Six]: (<div className={`${s['bombsNearby']} ${s['bombsNearby_six']}`}></div>),
	[BombsNearby.Seven]: (<div className={`${s['bombsNearby']} ${s['bombsNearby_seven']}`}></div>),
	[BombsNearby.Eight]: (<div className={`${s['bombsNearby']} ${s['bombsNearby_eight']}`}></div>),
}

const maskToView: Record<Mask, React.ReactNode> = {
	[Mask.Transparent]: null,
	[Mask.Fill]: (<div className={s['cell_filled']}></div>),
	[Mask.Flag]: (<div className={s['flag']}></div>),
	[Mask.Question]: (<div className={s['question']}></div>),
};

const createField = (size: number): number[] => {
    const field = new Array(size * size).fill(0);

	const inc = (x: number, y: number) => {
		if(x >= 0 && x < size && y >= 0 && y < size) {
			if(field[y * size + x] === BOMB) {
				return;
			}
			field[y * size + x] += 1;
		}
	};

	for(let i = 0; i < 40;) {
		const x = Math.floor(Math.random() * size);
		const y = Math.floor(Math.random() * size);

		if(field[y * size + x] === BOMB) {
			continue;
		}

		field[y * size + x] = BOMB;
		i += 1;

		inc(x + 1, y);
		inc(x - 1, y);
		inc(x, y + 1);
		inc(x, y - 1);
		inc(x + 1, y - 1);
		inc(x - 1, y - 1);
		inc(x + 1, y + 1);
		inc(x - 1, y + 1);
	}

	return field;
};

function App() {
	const size = 16;
	const dimension = new Array(size).fill(null);
	const [field, setField] = useState<number[]>(() => createField(size));
	const [mask, setMask] = useState<Mask[]>(() => new Array(size * size).fill(Mask.Fill));
	const [loss, setLoss] = useState(false);
	const [minesLeft, setMinesLeft] = useState(40);
	const [secondsFromStart, setSecondsFromStart] = useState(0);
	const [hasGameStarted, setHasGameStarted] = useState(false);
	const [emojiStatus, setEmojiStatus] = useState<"happy" | "scared" | "sad" | "win">('happy');
	
	const win = useMemo(() => !field.some(
		(f, i) => (f === BOMB && mask[i] !== Mask.Flag) 
			&& mask[i] !== Mask.Transparent
		), 
		[field, mask]);

	const createFieldContent = (index: number) => {
		if(mask[index] !== Mask.Transparent) {
			return maskToView[mask[index]];
		}
		if(field[index] === BOMB) {
			return (<div className={s['bomb']}></div>);
		}
		
		return bombsNearbyToView[field[index]];
	};

	const handleClick = (x: number, y: number) => {
		if (win || loss) {
			return;
		}

		if(mask[y * size + x] === Mask.Transparent) {
			return;
		}

		const clearing: [number, number][] = [];

		const clear = (x: number, y: number) => {
			if(x >= 0 && x < size && y >= 0 && y < size) {
				if(mask[y * size + x] === Mask.Transparent) {
					return;
				}
				clearing.push([x, y]);
			}
		};

		clear(x, y);

		while(clearing.length) {
			const [x, y] = clearing.pop()!;

			mask[y * size + x] = Mask.Transparent;
			if(field[y * size + x] !== 0) {
				continue;
			}

			clear(x + 1, y);
			clear(x - 1, y);
			clear(x, y + 1);
			clear(x, y - 1);
		}

		if(field[y * size + x] === BOMB) {
			mask.forEach((_, i) => mask[i] = Mask.Transparent);
			setLoss(true);
		}

		setMask(prev => {
			const newMask = [...prev];
			newMask[y * size + x] = Mask.Transparent;
			return newMask;
		});
	};

	//* Right click functionality
	const handleRightClick = (x: number, y: number) => {	
		const index = y * size + x;

		if(win || loss) {
			return;
		}

		if(mask[index] === Mask.Transparent) {
			return;
		}
		if (mask[index] === Mask.Fill) {
			setMask(prev => {
				const newMask = [...prev];
				newMask[y * size + x] = Mask.Flag;
				return newMask;
			});
		} else if(mask[index] === Mask.Flag) {
			setMask(prev => {
				const newMask = [...prev];
				newMask[y * size + x] = Mask.Question;
				return newMask;
			});
		} else if(mask[index] === Mask.Question) {
			setMask(prev => {
				const newMask = [...prev];
				newMask[y * size + x] = Mask.Fill;
				return newMask;
			});
		}
	};

	//* Timer functionality
	useEffect(() => {
		let timer: any;
		if(hasGameStarted) {
			timer = setInterval(() => {
				setSecondsFromStart(prev => prev += 1);
			}, 1000);
		} else if(loss || win) {
			return () => clearInterval(timer);
		} else {
			setSecondsFromStart(0);
			return () => clearInterval(timer);
		}
		return () => clearInterval(timer);
	}, [hasGameStarted]);

	//* Displaying emojis
	const displayEmoji = () => {
		if(emojiStatus === 'sad') {
			return (<div className={`${s['app__emoji']} ${s['app__emoji_sad']}`}></div>);
		} else if(emojiStatus === 'scared') {
			return (<div className={`${s['app__emoji']} ${s['app__emoji_scared']}`}></div>);
		} else if(emojiStatus === 'win') {
			return (<div className={`${s['app__emoji']} ${s['app__emoji_win']}`}></div>);
		} else {
			return (<div className={`${s['app__emoji']} ${s['app__emoji_happy']}`}></div>);
		}
	};

	//* Rest functionality
	const onResetGame = () => {
		setField(() => createField(16));
		setMask(prev => prev.map(_ => Mask.Fill));
	};
	
	return (
		<div className={s['app']}>
			<div className={s['app__wrap']}>
				<div className={s['app__head']}>
					<div className={s['app__minesLeft']}>
						{bombsAmountToView[Math.trunc(minesLeft / 100) % 10]}
						{bombsAmountToView[Math.trunc(minesLeft / 10) % 10]}
						{bombsAmountToView[minesLeft % 10]}
					</div>
					<div className={s['app__startGame']}>
						<button onClick={() => {
							if(win || loss) {
								setHasGameStarted(false);
								return;
							}
							setHasGameStarted(prev => !prev);
							if(hasGameStarted) {
								onResetGame();
							}
						}}>
							{displayEmoji()}
						</button>
					</div>
					<div className={s['app__timer']}>
						{timerToView[Math.trunc(secondsFromStart / 100) % 10]}
						{timerToView[Math.trunc(secondsFromStart / 10) % 10]}
						{timerToView[secondsFromStart % 10]}
					</div>
				</div>
				<div className={s['app__divider']}></div>
				<div className="app_field">
					{dimension.map((_, y) => {
						return (
						<div key={y} className={s['row']}>
							{dimension.map((_, x) => {
								return (
									<div 
										key={x} 
										className={s['cell']}
										onClick={() => handleClick(x, y)}
										onMouseDown={() => {setEmojiStatus('scared')}}
										onMouseUp={() => {
											if(win || loss) {
												return;
											}
											setEmojiStatus(() => loss ? 'sad' : win ? 'win' : 'happy');
										}}
										onContextMenu={(e) => {
											e.preventDefault(); 
											e.stopPropagation();
											handleRightClick(x, y);
										}}>
											{createFieldContent(y * size + x)}
									</div>
								);
							})}
						</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}

export default App;
