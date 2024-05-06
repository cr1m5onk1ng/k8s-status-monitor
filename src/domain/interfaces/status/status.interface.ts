
export interface MonitorActionResult<TData> {
    success: boolean,
    error?: Error,
    data?: TData,
};


export type MonitorCommandType = "STATUS" | "RESTART";


export interface MonitorCommand<TCommand extends MonitorCommandType, TResult> {
    readonly command: TCommand;
    run(): Promise<MonitorActionResult<TResult>>;
};


export interface MonitorClient {};