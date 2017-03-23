"use strict";

export namespace Commands {
    export const TimerAction = "extension.vscode-timer.timerAction";
    export const Reset = "extension.vscode-timer.reset";
    export const SetTimer = "extension.vscode-timer.setTimer";
}


export namespace Messages {
    export const SetTimer = "Set timer. e.g. 1:0:0(1 hour), 0:30:0(30 minutes)";
    export const ContinueTimerSet = "Timer is running. Do you want to reset timer and set new timer?";
    export const InvalidTimerDuration = "Timer duration must be > 0 sec";
}
