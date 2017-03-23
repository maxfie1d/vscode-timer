"use strict";

import * as vscode from "vscode";
import * as moment from "moment";

export class Timer {
    private _timeChangedEventEmitter = new vscode.EventEmitter<TimeChangedEventArgs>();
    private _timerEndEventEmitter = new vscode.EventEmitter<void>();
    // private _timerStarted: Date;
    // private _timerEnd: Date;
    private _elapsedSeconds: number;
    private _timerSeconds: number;
    private _interval: NodeJS.Timer | undefined;
    private _state: TimerState;

    // デフォルトのタイマー時間
    private static _DEFAULT_TIMER_SECONDS = 60 * 60;

    constructor() {
        this._timerSeconds = Timer._DEFAULT_TIMER_SECONDS;

        // イベントハンドラの登録を待つために
        // 少し時間をあけてリセットをかける
        setTimeout(() => {
            this.reset();
        }, 100);
    }

    get onTimeChanged(): vscode.Event<TimeChangedEventArgs> {
        return this._timeChangedEventEmitter.event;
    }

    get onTimerEnd(): vscode.Event<void> {
        return this._timerEndEventEmitter.event;
    }

    get state(): TimerState {
        return this._state;
    }

    private clearTimerLoop() {
        if (this._interval) {
            clearInterval(this._interval);
        }
    }

    private fireTimeChangedEvent(remainingSeconds: number): void {
        const args: TimeChangedEventArgs = {
            remainingSeconds: remainingSeconds
        };
        this._timeChangedEventEmitter.fire(args);
    }

    // TODO: intervalの間隔を小さくして時間経過を引き算で求めるようにする
    // TODO: disposeメソッドを作る
    start() {
        this._state = TimerState.Running;
        this._interval = setInterval(() => {
            this.tick();
        }, 1000);
    }

    public get remainingSeconds() {
        return Math.max(this._timerSeconds - this._elapsedSeconds, 0);
    }

    private tick() {
        this._elapsedSeconds += 1;

        const remainingSeconds = this.remainingSeconds;
        if (remainingSeconds <= 0) {
            // タイマー終了の場合
            this._elapsedSeconds = this._timerSeconds;
            // タイマー終了イベントを出す
            this._timerEndEventEmitter.fire();

            // タイマー終了後はリセットし、初期状態に戻す
            this.reset();
            clearInterval(this._interval);
        } else {
            // タイマー続行の場合
            this.fireTimeChangedEvent(remainingSeconds);
        }
    }

    pause() {
        this._state = TimerState.Paused;
        this.clearTimerLoop();
    }

    reset() {
        this._state = TimerState.Stopped;
        this.clearTimerLoop();
        this._elapsedSeconds = 0;

        this.fireTimeChangedEvent(this.remainingSeconds);
    }

    setTimer(seconds: number) {
        this._timerSeconds = seconds;
    }
}

export enum TimerState {
    /**
     * タイマーが一時停止の状態
     * タイマーを再開することができる
     * [あり得る状態遷移]
     * Paused -> Running
     */
    Paused,

    /**
     * タイマーが動作中の状態
     * [あり得る状態遷移]
     * Running -> Stopped
     * Running -> Paused
     */
    Running,

    /**
     * タイマーが動作していない状態
     * タイマーを作成した初期状態でもある
     * [あり得る状態遷移]
     * Stopped -> Running
     */
    Stopped
}

export interface TimeChangedEventArgs {
    remainingSeconds: number;
}
