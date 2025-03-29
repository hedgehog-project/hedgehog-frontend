"use client";
import { createContext, ReactNode, useContext, useState } from "react";
import { UIBLOCK } from "../agent/actions";

 

interface Message {
    blocks: Array<UIBLOCK>,
    id: string
}

interface HedgyContext {
    currentPrompt: string | null,
    messages: Array<Message>,
    isLoading: boolean,
    setCurrentPrompt: (prompt: string | null) => void,
    addMessage: (message: Message) => void,
    setLoading: (loading: boolean) => void 
}


const hedgyContext = createContext<HedgyContext>({
    addMessage(){},
    setCurrentPrompt() {},
    messages: [], 
    isLoading: false,
    setLoading(){},
    currentPrompt: null
})

export function HedgyContextWrapper(props: {children: ReactNode}) {
    const [messages, setMessages] = useState<Array<Message>>([])
    const [currentPrompt, setCurrentPrompt] = useState<string | null>(null)
    const [isLoading, setLoading] = useState(false) 

    const addMessage = (message: Message) => {
        setMessages((messages)=> {
            return messages.concat([message])
        })
    }

    return (
        <hedgyContext.Provider
            value={{
                addMessage,
                currentPrompt,
                isLoading,
                messages,
                setCurrentPrompt,
                setLoading
            }}
        >
            {props.children}
        </hedgyContext.Provider>
    )
} 

export function useHedgyState ( ) { 
    const context = useContext(hedgyContext)

    return context
}