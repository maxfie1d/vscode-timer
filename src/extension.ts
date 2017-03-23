"use strict";

import * as vscode from "vscode";
import { Timer, TimerState } from "./models/timer";
import * as moment from "moment";
import { Commands } from "./constants";
require("moment-duration-format");

export function activate(context: vscode.ExtensionContext) {
    // ステータスバーアイテムを作る
    const statusBarItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Left);
    statusBarItem.tooltip = "Timer";
    statusBarItem.command = Commands.TimerAction;
    statusBarItem.show();

    // タイマーのモデルを作成する
    const timer = new Timer();
    timer.onTimeChanged((args) => {
        // 残り時間が変わるたびにUIに反映する
        statusBarItem.text = formatSeconds(args.remainingSeconds);
    });
    timer.onTimerEnd(() => {
        // タイマー終了のメッセージをvscodeに出す
        vscode.window.showInformationMessage("Timer end");
    });

    context.subscriptions.push(statusBarItem);

    const command = vscode.commands.registerCommand(Commands.TimerAction, () => {
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

    const command2 = vscode.commands.registerCommand(Commands.Reset, () => {
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