/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */
// choose UI blocks to display

import { z } from "zod"
import { Action } from "../framework/action"
import { Effect } from "effect"
import { cons } from "effect/List"
import { createPrompt, sendToLLM } from "../framework/utils"
import zodToJsonSchema from "zod-to-json-schema"

const uiBlockSchema = z.object({
    name: z.string(),
    props: z.any(),
    description: z.string()
})

export type UIBLOCK = z.infer<typeof uiBlockSchema>

interface _UIBLOCK {
    name: string,
    props: Zod.ZodTypeAny,
    description: string
}

const UI_BLOCKS: Array<_UIBLOCK> = [
    {
        name: "PURCHASE_BUTTON",
        props: z.object({
            assetName: z.string(),
            quantity: z.number()
        }),
        description: "A Button for purchasing an asset"
    },
    {
        name: "SUMMARY",
        props: z.object({
            content: z.string()
        }),
        description: "Summarise the execution to the user"
    }
]

const parseInputSchema = z.object({
    // results: z.string(),
    originalTask: z.string(),
    primeDirective: z.string(),
})

type ParseInputSchema = z.infer<typeof parseInputSchema>


// choose UI blocks then populate the props
export const CHOOSE_UI_BLOCK_ACTION = Action.define<ParseInputSchema, UIBLOCK[]>({
    name: "CHOOSE_UI_BLOCK",
    description: "Choose a UI block to display, and determine the props to pass to it, based on the result of the task. There can be multiple UI blocks, chosen especially if the user asks to buy an asset",
    outputSchema: z.object({
        uiBlocks: z.array(uiBlockSchema)
    }),
    inputSchema: parseInputSchema,
    action(args) {
        const { originalTask, primeDirective } = args
        return Effect.tryPromise({
            try: async () => {
                const chooseUIBlockPrompt = createPrompt(
                    {
                        role: "system",
                        content: `
                            choose a single or multiple UI Blocks to correctly display, and provide interactions for the following content:
                            original task: ${args.originalTask}
                            prime directive: ${primeDirective}

                            Here are the available UI Blocks:
                            ${UI_BLOCKS.map(block => `- ${block.name}: ${block.description}`).join("\n")}
                        `,
                        name: "chooseUIBlocks"
                    },
                    {
                        name: "chooseUIBlocks",
                        description: "Choose UI Blocks to display",
                        parameters: zodToJsonSchema(z.object({
                            blocks: z.array(z.string())
                        }))
                    },
                    "chooseUIBlocks"
                )

                let response = await sendToLLM(chooseUIBlockPrompt)
                const asJSON = JSON.parse(response)
                
                if(!asJSON?.blocks || asJSON.blocks.length == 0) return [];

                const chosenBlocks = UI_BLOCKS.filter(block => asJSON.blocks.includes(block.name))

                const serializedUIData = await Promise.all(chosenBlocks.map(async (block) => {
                        
                    const prompt = createPrompt(
                        {
                            role: "system",
                            content: `
                            Determine what props can be derived from this content for the UI Block ${block.name}: ${block.description}
                      
                            original task: ${args.originalTask}
                            prime directive: ${primeDirective}
                            `,
                            name: "getUIBlockProps"
                        },
                        {
                            name: "getUIBlockProps",
                            description: "Get UI Block Props",
                            parameters: zodToJsonSchema(block.props)
                        }, 
                        "getUIBlockProps"
                    );

                    const result = await sendToLLM(prompt) 

                    const parsed = JSON.parse(result)

                    const parsedProps = block.props.safeParse(parsed)

                    if (parsedProps.success) {
                        return {
                            name: block.name,
                            props: parsedProps.data,
                            description: block.description
                        }
                    } else {
                        console.log("Failed to parse props", parsedProps.error)
                        return null
                    }


                }))

                const filteredUIBlocks = serializedUIData.filter((block) => block !== null) as UIBLOCK[]

                return filteredUIBlocks
            },
            catch(error) {
                console.log("Something went wrong", error)
                return error
            },
        })
    },
})