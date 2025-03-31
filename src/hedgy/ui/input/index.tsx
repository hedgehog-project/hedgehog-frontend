"use client"
import { Controller, useForm } from "react-hook-form"
import { useHedgyState } from "../context"
import {z} from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { SendIcon } from "lucide-react"
import { getCompletion } from "@/hedgy/agent/access-functions"

const promptSchema = z.object({
    prompt: z.string()
})

type PromptSchema = z.infer<typeof promptSchema>

export default function MessageInput(){
    const {addMessage, setLoading} = useHedgyState()

    const form = useForm<PromptSchema>({
        resolver: zodResolver(promptSchema)
    })

    const handleSubmit = async (values: PromptSchema )=> {
        setLoading(true)
        console.log("Values: ", values)

        try {
            const results = await getCompletion({
                prompt: values.prompt
            })

            console.log("Results")

            addMessage({
                blocks: results,
                id: `${Date.now()}`
            })
            
        }
        catch (e)
        {
            console.log("Something went wrong", e)
        }
        finally
        {
            setLoading(false)
        }

    }

    const handleError = (error: any ) => {
        console.log("Something went wrong ::", error)
    }

    return (
        <div className="flex flex-row w-full border-blue-500 border-2 rounded-md" >
            <Controller
                control={form.control}
                name="prompt"
                render={({field})=> {
                    return (            
                    <div className="w-full p-2 rounded-md flex flex-row items-center gap-x-2" >
                        <textarea className="flex flex-row w-full placeholder:text-white/60 text-white border-none min-h-10 max-h-20" {...field} />
                        <div onClick={form.handleSubmit(handleSubmit, handleError)}  className="rounded-md bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] cursor-pointer" >
                            <SendIcon className="text-white" />
                        </div>
                    </div>
                    )
                }}
            />
        </div>
    )
}