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
    private _interval: NodeJS.Timer;
    private _state: TimerState;

    constructor() {
        // an hour
        this._timerSeconds = 60 * 60;
        this._elapsedSeconds = 0;
        this._state = TimerState.Stopped;
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

    // TODO: intervalの間隔を小さくして時間経過を引き算で求めるようにする
    // TODO: disposeメソッドを作る
    start() {
        this._state = TimerState.Running;
        this._interval = setInterval(() => {
            this.tick();
        }, 1000);
    }

    private getRemainingSeconds() {
        return Math.max(this._timerSeconds - this._elapsedSeconds, 0);
    }

    private tick() {
        this._elapsedSeconds += 1;

        const remainingSeconds = this.getRemainingSeconds();
        if (remainingSeconds <= 0) {
            this._elapsedSeconds = this._timerSeconds;
            this._timerEndEventEmitter.fire();
            clearInterval(this._interval);

            this.reset();
        } else {
            const args: TimeChangedEventArgs = {
                remainingSeconds: remainingSeconds
            };
            this._timeChangedEventEmitter.fire(args);
        }
    }

    pause() {
        this._state = TimerState.Paused;
        clearInterval(this._interval);
    }

    reset() {
        this.pause();
        this._state = TimerState.Stopped;
        this._elapsedSeconds = 0;

        const args: TimeChangedEventArgs = {
            remainingSeconds: this.getRemainingSeconds()
        };
        this._timeChangedEventEmitter.fire(args);
    }

    setTimer(seconds: number) {
        this._timerSeconds = seconds;
    }
}

export enum TimerState {
    Paused,
    Running,
    Stopped
}

interface TimeChangedEventArgs {
    remainingSeconds: number;
}
