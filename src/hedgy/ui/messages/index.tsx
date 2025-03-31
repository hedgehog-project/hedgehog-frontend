"use client"

import { useHedgyState } from "../context"
import { PurchaseButton } from "./blocks/purchase-button"
import Summary from "./blocks/summary"


export default function Messages(){
    const { messages } = useHedgyState()

    console.log("Messages", messages)

    return (
        <div className="flex flex-col w-full p-2 gap-x-2" > 
            {
                messages.map((message, i)=> {
                    const summaries = message.blocks?.filter((b) => b.name == "DISPLAY") ?? []
                    const SHOW_SUMMARIES = summaries?.length > 0
                    const actionButtons = message.blocks?.filter(b=>b.name == "PURCHASE_BUTTON") ?? []
                    const SHOW_ACTIONS = actionButtons?.length > 0
                    return (
                        <div key={i} className="w-full flex flex-col" >
                    
                                {
                                    SHOW_SUMMARIES && <div className="flex flex-col w-full" >
                                        {
                                            summaries.map((summary, i)=> <Summary key={i} content={summary.props?.content ?? ""} />)
                                        }
                                    </div>
                                }

                                {
                                    SHOW_ACTIONS && <div className="flex flex-row items-center gap-x-2 rounded-md overflow-x-scroll" >
                                        {
                                            actionButtons.map((action, i)=> <PurchaseButton key={i} assetName={action.props?.assetName} quantity={action?.props?.quantity} />)
                                        }
                                    </div>
                                }
                        </div>
                    )
                })
            }
        </div>
    )
}