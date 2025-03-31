"use client"
import { Controller, useForm, FieldErrors } from "react-hook-form"
import { useHedgyState } from "../context"
import {z} from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { SendIcon } from "lucide-react"
import { getCompletion } from "@/hedgy/agent/access-functions"

const promptSchema = z.object({
    prompt: z.string().min(1, "Please enter a message")
})

type PromptSchema = z.infer<typeof promptSchema>

export default function MessageInput(){
    const {addMessage, setLoading} = useHedgyState()

    const form = useForm<PromptSchema>({
        resolver: zodResolver(promptSchema),
        defaultValues: {
            prompt: ""
        }
    })

    const handleSubmit = async (values: PromptSchema )=> {
        if (!values.prompt.trim()) return;
        
        setLoading(true);
        
        // Add user message immediately
        addMessage({
            blocks: [
                {
                    name: "USER_MESSAGE",
                    description: "User's message",
                    props: { content: values.prompt }
                },
                {
                    name: "TEXT",
                    description: "Message content",
                    props: { content: values.prompt }
                }
            ],
            id: Date.now().toString()
        });

        try {
            const results = await getCompletion({
                prompt: values.prompt
            });

            addMessage({
                blocks: results,
                id: Date.now().toString()
            });
        }
        catch (e) {
            console.error("Something went wrong", e);
            // Optionally add an error message to the chat
            addMessage({
                blocks: [{
                    name: "TEXT",
                    description: "Error message",
                    props: { content: "Sorry, something went wrong. Please try again." }
                }],
                id: Date.now().toString()
            });
        }
        finally {
            setLoading(false);
            form.reset({ prompt: "" });
        }
    }

    const handleError = (errors: FieldErrors<PromptSchema>) => {
        console.error("Form errors:", errors);
    }

    return (
        <div className="flex flex-row w-full border border-[var(--border-color)] rounded-md bg-[var(--background)]" >
            <Controller
                control={form.control}
                name="prompt"
                render={({field})=> {
                    return (            
                    <div className="w-full p-2 rounded-md flex flex-row items-center gap-x-2" >
                        <textarea 
                            placeholder="Type a message..."
                            className="flex flex-row w-full bg-transparent placeholder:text-[var(--muted-foreground)] text-[var(--foreground)] border-none min-h-10 max-h-20 resize-none focus:outline-none" 
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    form.handleSubmit(handleSubmit, handleError)();
                                }
                            }}
                            {...field} 
                        />
                        <div 
                            onClick={form.handleSubmit(handleSubmit, handleError)}  
                            className="p-2 rounded-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] cursor-pointer transition-colors duration-200 border border-[var(--border-color)]" 
                        >
                            <SendIcon className="text-[var(--primary-foreground)] h-5 w-5" />
                        </div>
                    </div>
                    )
                }}
            />
        </div>
    )
}