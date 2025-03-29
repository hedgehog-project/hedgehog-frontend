/* eslint-disable @typescript-eslint/prefer-as-const */
// has a collection of all the oracles and actions

import zodToJsonSchema from "zod-to-json-schema"
import { Action } from "./action"
import { Oracle } from "./oracle"
import { Goal } from "./orchestrater"
import { createPrompt, sendToLLM } from "./utils"
import { z } from "zod"

export interface LibraryRecommendation {
    name: string,
    description: string,
    schema: object
}


export class Library {
    __type: "Library" = "Library"
    Actions: Action[] = []
    Oracles: Oracle[] = []

    static define() {
        return new Library()
    }

    GetAction(name: string){
        return this.Actions.find(action => action.Name === name)
    }

    GetOracle(name: string) {
        return this.Oracles.find(oracle => oracle.Name == name)
    }

    AddAction(action: Action){
        this.Actions.push(action)
        return this
    }

    AddOracle(oracle: Oracle){
        this.Oracles.push(oracle)
        return this
    }

    async AskOracle(args: { goal: Goal }) {
        const { goal } = args
        const { directive } = goal
        const ORACLE_SUMMARY = this.Oracles.map((oracle) => {
            return ` 
            ORACLE: ${oracle.Name}
            DESCRIPTION: ${oracle.Description} \n
            `
        })

        const prompt = createPrompt(
            {
                role: "system",
                name: "getOracles",
                content: `
                I AM A HUMAN ASSISTANT, MY PRIME DIRECTIVE IS TO: ${directive}
                I'll END EXECUTION ONCE MY COMPLETION CRITERIA OF ${goal.completionCriteria}
                MY CURRENT TASK IS:
                ${goal.task}
                I WANT TO COMPLETE THIS AS LONG AS IT'S ACHIEVABLE BY MY PRIME DIRECTIVE.

                FIRST I WANT TO DETERMINE IF THE TASK NEEDS SOME CONTEXT DATA FROM MY ORACLES.
                HERE ARE MY ORACLES: 
                ${ORACLE_SUMMARY}

                If any of the listed oracles are helpful towards achieving my task add them to the args.
                If none of the oracles are useful do not include them.
                `
            },
            {
                name: "getOracles",
                description: "Get Oracles to provide context for my task.",
                parameters: zodToJsonSchema(z.object({
                    oracles: z.array(z.string())
                }))
            },
            "getOracles"
        )

        const result = await sendToLLM(prompt)

        const parsed = JSON.parse(result)

        if (parsed.oracles && parsed.oracles instanceof Array) {
            return parsed.oracles as Array<string>
        }

        return []

    }

}