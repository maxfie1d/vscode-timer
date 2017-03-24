"use strict";

import * as vscode from "vscode";
import { Timer, TimerState } from "./models/timer";
import * as moment from "moment";
import { Commands, Messages } from "./constants";
require("moment-duration-format");

export function activate(context: vscode.ExtensionContext) {
    // ステータスバーアイテムを作る
    const statusBarItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Left);
    statusBarItem.tooltip = "Timer";
    statusBarItem.command = Commands.TimerAction;
    statusBarItem.show();

    // タイマーの時間を読み込む
    function getConfigTimerSeconds(): number | undefined {
        const t = context.globalState.get<number>("vscode-timer.timer");
        if (t === undefined) {
            return undefined;
        } else {
            const seconds = moment.duration(t, "seconds").asSeconds();
            if (t <= 0) {
                return undefined;
            } else {
                return seconds;
            }
        }
    }

    const seconds = getConfigTimerSeconds();
    // タイマーのモデルを作成する
    const timer = new Timer(seconds);
    timer.onTimeChanged((args) => {
        // 残り時間が変わるたびにUIに反映する
        statusBarItem.text = formatSeconds(args.remainingSeconds);
    });
    timer.onTimerEnd(() => {
        // タイマー終了のメッセージをvscodeに出す
        vscode.window.showInformationMessage("Timer end");
    });
    timer.onTimerChanged(({ timerSeconds }) => {
        // タイマー時間の変更を保存する
        context.globalState.update("vscode-timer.timer", timerSeconds);
    });

    context.subscriptions.push(statusBarItem);


    // Commands: TimerAction
    context.subscriptions.push(
        vscode.commands.registerCommand(Commands.TimerAction, () => {
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
        }));

    // Commands: Reset
    context.subscriptions.push(
        vscode.commands.registerCommand(Commands.Reset, () => {
            timer.reset();
        }));

    // Commands: Set timer
    context.subscriptions.push(
        vscode.commands.registerCommand(Commands.SetTimer, () => {
            if (timer.state == TimerState.Running) {
                // タイマー動作中の場合は
                // 動作中のタイマーをキャンセルして新しいタイマーをセットするかを確認する
                vscode.window.showQuickPick(["OK", "Cancel"], { placeHolder: Messages.ContinueTimerSet })
                    .then(selection => {
                        if (selection === "OK") {
                            showInputBox();
                        }
                    });
            } else {
                showInputBox();
            }

            function showInputBox() {
                vscode.window.showInputBox({ placeHolder: Messages.SetTimer })
                    .then(input => {
                        const seconds = moment.duration(input).asSeconds();
                        if (seconds <= 0) {
                            vscode.window.showErrorMessage(Messages.InvalidTimerDuration);
                            return;
                        }

                        timer.reset();
                        timer.setTimer(seconds);
                    });
            }
        }));
}

function formatSeconds(seconds: number) {
    const duration = moment.duration(seconds, "seconds") as any;
    return duration.format("mm:ss");
}

export function deactivate() {

}