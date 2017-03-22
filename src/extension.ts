"use strict";

import * as vscode from "vscode";
import { Timer, TimerState } from "./models/timer";
import * as moment from "moment";
require("moment-duration-format");

export function activate(context: vscode.ExtensionContext) {
    const statusBarItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Left);

    statusBarItem.tooltip = "Timer";
    const timerActionCommand = "extension.vscode-timer.timerAction";
    statusBarItem.command = timerActionCommand;

    statusBarItem.show();

    const timer = new Timer();
    const seconds = 60 * 60;
    statusBarItem.text = formatSeconds(seconds);
    timer.setTimer(seconds);
    timer.onTimeChanged((args) => {
        statusBarItem.text = formatSeconds(args.remainingSeconds);
    });

    timer.onTimerEnd(() => {
        statusBarItem.text = formatSeconds(seconds);
        vscode.window.showInformationMessage("Timer end");
    });


    context.subscriptions.push(statusBarItem);

    const command = vscode.commands.registerCommand(timerActionCommand, () => {
        switch (timer.state) {
            case TimerState.Running:
                timer.pause();
                break;
            case TimerState.Paused:
                timer.start();
                break;
            case TimerState.Stopped:
                timer.start();
                break;
        }
    });

    const command2 = vscode.commands.registerCommand("extension.vscode-timer.reset", () => {
        timer.reset();
    });

    context.subscriptions.push(command, command2);
}

function formatSeconds(seconds: number) {
    const duration = moment.duration(seconds, "seconds") as any;
    return duration.format("mm:ss");
}

export function deactivate() {

}