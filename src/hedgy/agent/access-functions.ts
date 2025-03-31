"use server";

import { encodeHumanRequestToExecutionTask } from "../framework/codec";
import { UIBLOCK } from "./actions";
import { orchestrator } from "./orchestrater";

interface getCompletionArgs {
    prompt: string 
}
export async function getCompletion(args: getCompletionArgs) {
    const { prompt } = args 
    
    const goal = await encodeHumanRequestToExecutionTask(prompt, orchestrator.directive)

    const orchestrationPromise = new Promise<Array<UIBLOCK>>(async (res, rej)=> {
        try {
            await orchestrator.run(goal, (result, error)=> {
                if (error) {
                    rej(error)
                } else {
                    res(result ?? [])
                }
            })
        }
        catch (e){
            console.log("Something went wrong ::", e)
            rej(e)
        }
    })
    const result = await orchestrationPromise

    console.log("RESULT", result)

    return result
    
}