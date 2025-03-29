/* eslint-disable @typescript-eslint/prefer-as-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
// Functionality to carry out a certain task
// May or may not interface with the oracles
// May act on its own with no side effects to the ozone

import { Effect } from "effect/Effect"



export class Action<Input = any, Output = any> {
    __type: "Action" = "Action"
    Name: string 
    Description: string
    OutputSchema: Zod.ZodTypeAny
    InputSchema: Zod.ZodTypeAny
    private Action: (args: Input) => Effect<Output, unknown, never>

    constructor(name: string, description: string, outputSchema: Zod.ZodTypeAny, inputSchema: Zod.ZodTypeAny, action: (args: Input) => Effect<Output, unknown, never>){
        this.Name = name
        this.Description = description
        this.OutputSchema = outputSchema
        this.InputSchema = inputSchema
        this.Action = action
    }

    Do(args: Input){
        return this.Action(args)
    }

    static define<I = any, O = any>(args: {
        name: string,
        description: string,
        outputSchema: Zod.ZodTypeAny,
        inputSchema: Zod.ZodTypeAny,
        action: (args: I) => Effect<O, unknown, never>
    }){
        return new Action<I, O>(args.name, args.description, args.outputSchema, args.inputSchema, args.action)
    }

}